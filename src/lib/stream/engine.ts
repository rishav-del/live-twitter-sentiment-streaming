import { classify, extractHashtags, scoreText } from "./sentiment";
import type { Checkpoint, ProcessedTweet, RawBatch, RawTweet, WindowState } from "./types";

export const WINDOW_MS = 60_000;
export const WATERMARK_MS = 120_000;
export const MAX_BATCHES_PER_TRIGGER = 5;
const MAX_IDS = 5000;
const MAX_RECENT = 25;
const MAX_LOG = 12;
const MAX_FINAL = 30;

export function validate(t: RawTweet): t is RawTweet & { id: string; text: string; timestamp: string } {
  if (!t || typeof t.id !== "string" || !t.id) return false;
  if (typeof t.text !== "string" || !t.text.trim()) return false;
  if (typeof t.timestamp !== "string" || Number.isNaN(Date.parse(t.timestamp))) return false;
  return true;
}

/** Process one micro-batch (pure: returns a new checkpoint). */
export function runMicroBatch(cp: Checkpoint, now = Date.now()): { cp: Checkpoint; rows: number } {
  const t0 = performance.now();
  const take = cp.queue.slice(0, MAX_BATCHES_PER_TRIGGER).filter((b) => b.seq > cp.committedOffset);
  const skipped = cp.queue.slice(0, MAX_BATCHES_PER_TRIGGER).length - take.length;
  if (take.length === 0 && skipped === 0) return { cp, rows: 0 };

  const seen = new Set(cp.processedIds);
  const newIds: string[] = [];
  let rejected = 0, duplicates = 0, late = 0;
  const out: ProcessedTweet[] = [];
  let maxEvent = cp.maxEventTime;
  const watermarkBefore = cp.maxEventTime - WATERMARK_MS;

  for (const b of take as RawBatch[]) {
    for (const raw of b.tweets) {
      if (!validate(raw)) { rejected++; continue; }
      if (seen.has(raw.id)) { duplicates++; continue; }
      const ev = Date.parse(raw.timestamp);
      if (cp.maxEventTime > 0 && ev < watermarkBefore) { late++; seen.add(raw.id); newIds.push(raw.id); continue; }
      seen.add(raw.id);
      newIds.push(raw.id);
      const text = raw.text.replace(/\s+/g, " ").trim();
      const score = scoreText(text);
      out.push({
        id: raw.id, timestamp: new Date(ev).toISOString(), text, topic: raw.topic || "unknown",
        hashtags: extractHashtags(text), score, sentiment: classify(score),
      });
      if (ev > maxEvent) maxEvent = ev;
    }
  }

  // windowed aggregation
  const windows = new Map<number, WindowState>(cp.activeWindows.map((w) => [w.start, { ...w, hashtags: { ...w.hashtags } }]));
  const totals = { ...cp.totals };
  const hashtagTotals = { ...cp.hashtagTotals };
  for (const t of out) {
    const ev = Date.parse(t.timestamp);
    const start = Math.floor(ev / WINDOW_MS) * WINDOW_MS;
    let w = windows.get(start);
    if (!w) { w = { start, end: start + WINDOW_MS, Positive: 0, Negative: 0, Neutral: 0, hashtags: {} }; windows.set(start, w); }
    w[t.sentiment]++;
    totals[t.sentiment]++;
    for (const h of t.hashtags) { w.hashtags[h] = (w.hashtags[h] || 0) + 1; hashtagTotals[h] = (hashtagTotals[h] || 0) + 1; }
  }

  // watermark: finalize & drop state for windows that closed before watermark
  const watermark = maxEvent - WATERMARK_MS;
  const active: WindowState[] = [];
  const finalized = [...cp.finalizedWindows];
  for (const w of [...windows.values()].sort((a, b) => a.start - b.start)) {
    if (w.end <= watermark) finalized.push(w);
    else active.push(w);
  }

  const lastSeq = take.at(-1)?.seq ?? cp.committedOffset;
  const rows = out.length;
  const at = new Date(now).toISOString();
  const microBatchId = cp.microBatchId + 1;
  const durationMs = Math.max(0, Math.round((performance.now() - t0) * 100) / 100);

  return {
    rows,
    cp: {
      ...cp,
      committedOffset: Math.max(cp.committedOffset, lastSeq),
      queue: cp.queue.slice(take.length + skipped),
      processedIds: [...cp.processedIds, ...newIds].slice(-MAX_IDS),
      activeWindows: active,
      finalizedWindows: finalized.slice(-MAX_FINAL),
      totals,
      hashtagTotals,
      rejected: cp.rejected + rejected,
      duplicates: cp.duplicates + duplicates,
      late: cp.late + late,
      maxEventTime: maxEvent,
      microBatchId,
      recent: [...out.reverse(), ...cp.recent].slice(0, MAX_RECENT),
      log: [{ batchId: microBatchId, at, rows, rejected, duplicates, late, durationMs, sourceBatches: take.length }, ...cp.log].slice(0, MAX_LOG),
      lastBatchAt: at,
      lastBatchRows: rows,
    },
  };
}
