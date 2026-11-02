import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/site/ui";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export const Route = createFileRoute("/viva")({
  head: () => ({
    meta: [
      { title: "Viva Q&A · Live Twitter Sentiment Streaming" },
      { name: "description", content: "Fifteen viva questions on Big Data, Spark Structured Streaming, VADER, windows, watermarks and checkpointing, with short answers." },
      { property: "og:title", content: "Viva Q&A · Live Twitter Sentiment Streaming" },
      { property: "og:description", content: "Short, accurate answers to 15 viva questions about this streaming project." },
    ],
  }),
  component: Viva,
});

const QA: [string, string][] = [
  ["What is Big Data?", "Data whose volume, velocity or variety is too large for a single traditional system to store and process in time. It needs distributed storage and parallel processing."],
  ["Why Spark?", "Apache Spark processes data in memory across a cluster, offers one API for batch, streaming, SQL and ML, and recovers from failures using lineage and checkpoints. That makes it a common choice for large-scale stream analytics."],
  ["What is Structured Streaming?", "Spark's streaming API built on the DataFrame/SQL engine. A stream is treated as an unbounded table; each trigger processes newly arrived rows incrementally and updates the result, with support for event-time windows, watermarks and exactly-once sinks."],
  ["Legacy Spark Streaming vs Structured Streaming?", "Legacy Spark Streaming (DStreams) works on RDD micro-batches and processing time, with manual state handling. Structured Streaming uses DataFrames, the Catalyst optimiser, event-time semantics, watermarks and end-to-end exactly-once guarantees with supported sources and sinks."],
  ["How does the simulated stream work?", "A producer creates 4 to 8 template-based tweets every 2 seconds, each with an id, timestamp, text, topic, hashtags and source \"simulated\". About 3% are deliberately malformed. Each batch is appended to an incoming queue, like files landing in a folder."],
  ["How are tweets ingested?", "Every 3 seconds the engine takes up to 5 pending batches whose offset is above the last committed offset and processes them together as one micro-batch."],
  ["How does VADER classify sentiment?", "Each known word has a weight. Weights are adjusted for intensifiers and flipped/reduced after negations, summed, then normalised to a compound score between -1 and 1. Score >= 0.05 is Positive, <= -0.05 is Negative, otherwise Neutral."],
  ["How are hashtags extracted?", "With the regex #\\w+, then lower-cased and de-duplicated per tweet, so #AI and #ai count once."],
  ["What is event-time windowing?", "Grouping records by when the event happened (the tweet timestamp), not when it was processed. Here each tweet falls into a 1-minute tumbling window based on its own timestamp."],
  ["What are watermarks?", "A threshold of how late data may arrive: max event time seen minus 2 minutes. Windows that end before the watermark are finalised and their state is dropped; records older than it are discarded as late."],
  ["What is checkpointing?", "Persisting progress and state after each micro-batch. This app saves offsets, processed ids, window state, totals and the pending queue to browser storage."],
  ["How does recovery work?", "On reload or restart, the engine loads the checkpoint, skips batches at or below the committed offset, ignores ids already processed, and continues with the pending queue, so nothing is counted twice."],
  ["What are the limits of simulated data?", "Narrow template vocabulary, a sentiment mix chosen by the generator, tiny volume and no real users. It demonstrates the pipeline, not real opinion."],
  ["What would a real Twitter/X source need?", "Authorised X API access, credentials stored server-side in environment variables, a backend to hold the connection, and compliance with the developer terms, rate limits and data policies."],
  ["How are the dashboard metrics derived?", "Only from engine state: totals and percentages from classified tweets, chart series from window counts, top hashtags from hashtag counts, and the log from per-micro-batch counters. Nothing is hardcoded."],
];

function Viva() {
  return (
    <article>
      <PageHeader eyebrow="Viva preparation" title="15 questions, short answers">
        Answers describe this project's in-browser simulation and, where relevant, how real Apache Spark differs.
      </PageHeader>
      <Accordion type="multiple" className="max-w-3xl border-t border-border">
        {QA.map(([q, a], i) => (
          <AccordionItem key={q} value={String(i)} className="border-border">
            <AccordionTrigger className="text-left hover:no-underline">
              <span className="flex gap-3"><span className="font-mono text-xs text-primary pt-0.5">{String(i + 1).padStart(2, "0")}</span>{q}</span>
            </AccordionTrigger>
            <AccordionContent className="pl-8 text-muted-foreground leading-relaxed">{a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </article>
  );
}
