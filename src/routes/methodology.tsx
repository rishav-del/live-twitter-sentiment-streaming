import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Section } from "@/components/site/ui";
import { useStream } from "@/lib/stream/controller";

export const Route = createFileRoute("/methodology")({
  head: () => ({
    meta: [
      { title: "Methodology · Spark-style Streaming Architecture" },
      { name: "description", content: "Architecture, event-time windows, watermarks, checkpointing and how this in-browser simulation differs from Apache Spark." },
      { property: "og:title", content: "Methodology · Spark-style Streaming Architecture" },
      { property: "og:description", content: "How the simulated tweet pipeline mirrors Spark Structured Streaming concepts." },
    ],
  }),
  component: Methodology,
});

const STAGES = [
  ["Tweet producer", "simulated, 2 s"],
  ["Incoming queue", "pending batches"],
  ["Streaming engine", "validate, dedupe"],
  ["Sentiment analysis", "VADER-style"],
  ["Windowed aggregations", "1 min, 2 min WM"],
  ["Checkpoint / state", "localStorage"],
  ["Dashboard", "live metrics"],
];

function Diagram({ active }: { active: boolean }) {
  return (
    <figure className="panel p-4">
      <div className="overflow-x-auto">
        <svg viewBox="0 0 1060 120" className="min-w-[760px] w-full" role="img" aria-label="Pipeline: Tweet producer, incoming queue, streaming engine, sentiment analysis, windowed aggregations, checkpoint and state, dashboard">
          {STAGES.map(([t, s], i) => {
            const x = 10 + i * 150;
            return (
              <g key={t}>
                {i < STAGES.length - 1 && (
                  <line x1={x + 130} y1={60} x2={x + 150} y2={60} strokeWidth={2} className={active ? "stroke-primary flow-line" : "stroke-border"} />
                )}
                <rect x={x} y={25} width={130} height={70} rx={3} className={i === 2 && active ? "fill-secondary stroke-primary" : "fill-secondary stroke-border"} strokeWidth={1} />
                <text x={x + 65} y={55} textAnchor="middle" className="fill-foreground" fontSize={12.5} fontWeight={600}>{t}</text>
                <text x={x + 65} y={74} textAnchor="middle" className="fill-muted-foreground" fontSize={10.5} fontFamily="JetBrains Mono, monospace">{s}</text>
              </g>
            );
          })}
        </svg>
      </div>
      <figcaption className="mt-3 flex items-center gap-2 font-mono text-xs text-muted-foreground">
        <span className={`h-2 w-2 rounded-full ${active ? "bg-primary animate-live" : "bg-muted-foreground/50"}`} aria-hidden />
        {active ? "Engine is processing: connectors are animated" : "Engine not processing: connectors are static"}
      </figcaption>
    </figure>
  );
}

const MAP = [
  ["Velocity", "Producer emits a batch every 2 s; engine triggers every 3 s", "Dashboard queue length, micro-batch log"],
  ["Streaming source", "Incoming queue of batches with increasing offsets", "Queue metric, checkpoint offset"],
  ["Schema validation", "Records missing id, text or a valid timestamp are rejected", "Rejected counter"],
  ["Transformation", "Whitespace normalisation, dedupe by id, hashtag extraction", "Recent tweets list"],
  ["Sentiment analysis", "Lexicon scoring with negation and intensifiers", "KPI cards, donut, tweet labels"],
  ["Event-time windows", "1-minute tumbling windows on tweet timestamp", "Sentiment-over-time and volume charts"],
  ["Watermarks", "Max event time minus 2 minutes; older state finalised and dropped", "Late counter, window list"],
  ["Checkpointing", "Offsets, ids, state and queue saved after each micro-batch", "Recovery toast after reload"],
  ["Live monitoring", "UI subscribes to engine state", "Producer/engine status, header indicator"],
];

function Methodology() {
  const s = useStream();
  return (
    <article>
      <PageHeader eyebrow="Spark-style streaming engine (in-browser simulation)" title="Methodology and architecture">
        The engine is a TypeScript implementation that mirrors Spark Structured Streaming concepts inside your browser. It is not Apache Spark.
      </PageHeader>
      <Diagram active={s.engine === "processing"} />
      <div className="mt-10">
        <Section title="1 · Producer">
          <p>Generates 4 to 8 simulated tweets every 2 seconds from positive, negative and neutral templates with 1 to 3 hashtags. About 3% are malformed on purpose, and a few records are replayed to exercise de-duplication.</p>
        </Section>
        <Section title="2 · Incoming queue">
          <p>Each batch gets a sequential offset and is appended to a queue, like files landing in a watched folder. Pausing stops only the producer; the queue keeps draining.</p>
        </Section>
        <Section title="3 · Engine">
          <p>Every 3 seconds the trigger takes up to 5 batches above the committed offset. It validates schema, normalises whitespace, drops ids already seen, and extracts lower-cased unique hashtags.</p>
        </Section>
        <Section title="4 · Sentiment">
          <p>A lexicon of about 150 weighted words produces a compound score from -1 to 1. Negations within three words flip and dampen a weight; intensifiers like "very" strengthen it. Positive if score is 0.05 or more, Negative if -0.05 or less, otherwise Neutral.</p>
        </Section>
        <Section title="5 · Event-time windows">
          <p>Tweets are grouped by their own timestamp into 1-minute tumbling windows, counting sentiment and hashtags. A tweet created at 10:00:58 but processed at 10:01:04 still counts in the 10:00 window.</p>
        </Section>
        <Section title="6 · Watermarks">
          <p>The watermark is the latest event time seen minus 2 minutes. Windows ending before it are finalised (emitted to the chart history) and their mutable state is dropped. Records older than the watermark are counted as late and discarded.</p>
        </Section>
        <Section title="7 · Checkpoint and recovery">
          <p>After every micro-batch the committed offset, recent processed ids, window state, totals and pending queue are written to browser storage. On reload the engine restores this, skips batches already committed, ignores ids already seen and drains pending batches, so nothing is double counted.</p>
        </Section>
        <Section title="Guarantees">
          <p><strong className="text-foreground">Does give:</strong> no double counting across stop/start and reload within one browser; deterministic offsets; bounded state through the watermark.</p>
          <p><strong className="text-foreground">Does not give:</strong> durability if browser storage is cleared or full; protection across devices or tabs running at once; true exactly-once delivery to external sinks; the processed-id set is capped at the latest 5,000 ids.</p>
        </Section>
        <Section title="Concept mapping">
          <div className="overflow-x-auto rounded-sm border border-border">
            <table className="w-full min-w-[560px] text-sm">
              <thead className="bg-secondary text-left">
                <tr><th className="p-2.5 font-medium">Big Data concept</th><th className="p-2.5 font-medium">How it is implemented</th><th className="p-2.5 font-medium">Where you see it</th></tr>
              </thead>
              <tbody>
                {MAP.map(([a, b, c]) => (
                  <tr key={a} className="border-t border-border align-top">
                    <td className="p-2.5 font-medium">{a}</td><td className="p-2.5 text-muted-foreground">{b}</td><td className="p-2.5 text-muted-foreground">{c}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
        <Section title="Differences from real Spark">
          <p>Real Spark Structured Streaming runs on a cluster: data is partitioned across executors, work is scheduled by a driver, and state is stored in fault-tolerant state stores with write-ahead logs on durable storage such as HDFS or S3. It can recover from machine failures and scale to millions of events per second.</p>
          <p>This simulation runs in one browser thread, keeps all state in memory, persists to localStorage and handles a few tweets per second. It reproduces the concepts, not the distributed execution, fault tolerance or scale.</p>
        </Section>
      </div>
    </article>
  );
}
