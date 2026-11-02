import type { SentimentLabel } from "./sentiment";

export interface RawTweet {
  id?: string | undefined;
  timestamp?: string | undefined;
  text?: string | undefined;
  topic?: string | undefined;
  source?: string | undefined;
}

export interface RawBatch {
  seq: number;
  createdAt: string;
  tweets: RawTweet[];
}

export interface ProcessedTweet {
  id: string;
  timestamp: string;
  text: string;
  topic: string;
  hashtags: string[];
  score: number;
  sentiment: SentimentLabel;
}

export interface WindowState {
  start: number; // epoch ms
  end: number;
  Positive: number;
  Negative: number;
  Neutral: number;
  hashtags: Record<string, number>;
}

export interface BatchLogEntry {
  batchId: number;
  at: string;
  rows: number;
  rejected: number;
  duplicates: number;
  late: number;
  durationMs: number;
  sourceBatches: number;
}

export type ProducerStatus = "running" | "paused" | "stopped";
export type EngineStatus = "starting" | "processing" | "idle" | "stopped";

export interface Checkpoint {
  version: 1;
  producerSeq: number; // next seq to produce
  committedOffset: number; // last batch seq fully processed (-1 none)
  queue: RawBatch[]; // pending batches ("incoming folder")
  processedIds: string[];
  activeWindows: WindowState[];
  finalizedWindows: WindowState[];
  totals: { Positive: number; Negative: number; Neutral: number };
  hashtagTotals: Record<string, number>;
  rejected: number;
  duplicates: number;
  late: number;
  maxEventTime: number;
  microBatchId: number;
  recent: ProcessedTweet[];
  log: BatchLogEntry[];
  lastBatchAt: string | null;
  lastBatchRows: number;
}

export const emptyCheckpoint = (): Checkpoint => ({
  version: 1,
  producerSeq: 0,
  committedOffset: -1,
  queue: [],
  processedIds: [],
  activeWindows: [],
  finalizedWindows: [],
  totals: { Positive: 0, Negative: 0, Neutral: 0 },
  hashtagTotals: {},
  rejected: 0,
  duplicates: 0,
  late: 0,
  maxEventTime: 0,
  microBatchId: 0,
  recent: [],
  log: [],
  lastBatchAt: null,
  lastBatchRows: 0,
});
