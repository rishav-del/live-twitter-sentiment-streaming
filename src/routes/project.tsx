import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Section } from "@/components/site/ui";

export const Route = createFileRoute("/project")({
  head: () => ({
    meta: [
      { title: "Project Overview · Live Twitter Sentiment Streaming" },
      { name: "description", content: "Problem statement, objectives, scope, tech stack and limitations of the Spark-style Twitter sentiment streaming demo." },
      { property: "og:title", content: "Project Overview · Live Twitter Sentiment Streaming" },
      { property: "og:description", content: "Objectives, scope and honest limitations of an academic real-time sentiment streaming demo." },
    ],
  }),
  component: Project,
});

const L = ({ items }: { items: string[] }) => (
  <ul className="list-disc space-y-1.5 pl-5 marker:text-primary">{items.map((i) => <li key={i}>{i}</li>)}</ul>
);

function Project() {
  return (
    <article>
      <PageHeader eyebrow="Project overview" title="Real-Time Stream Processing with Spark Streaming: A Case Study on Twitter Data">
        An academic Big Data demo that shows how a streaming pipeline turns a continuous flow of short texts into live sentiment and hashtag metrics.
      </PageHeader>
      <Section title="Problem statement">
        <p>Social platforms produce text at high velocity. Batch analysis reports opinions hours later; organisations need to see shifts in public sentiment while they happen. The problem is to ingest a continuous stream of posts, clean and classify each one, and keep accurate aggregate views updated in near real time.</p>
      </Section>
      <Section title="Research context">
        <p>The project follows the case-study theme "Real-Time Stream Processing with Spark Streaming: A Case Study on Twitter Data", focusing on the concepts of Spark Structured Streaming: micro-batches, event-time windows, watermarks and checkpoint-based recovery.</p>
      </Section>
      <Section title="Objectives">
        <ol className="list-decimal space-y-1.5 pl-5 marker:font-mono marker:text-primary">
          <li>Ingest a live or simulated Twitter stream and perform real-time sentiment analysis.</li>
          <li>Provide a live dashboard of sentiment trends and top hashtags.</li>
        </ol>
      </Section>
      <Section title="Scope">
        <p>In scope: a simulated tweet producer, a Spark-style micro-batch engine written in TypeScript, lexicon-based sentiment scoring, windowed aggregations, a browser-storage checkpoint and a live dashboard.</p>
        <p className="font-medium">Out of scope: real Twitter/X integration and real Apache Spark are not part of this build. Everything runs in the browser on simulated data.</p>
      </Section>
      <Section title="Solution">
        <p>A producer writes small batches of simulated tweets into an incoming queue every 2 seconds. Every 3 seconds the engine takes up to 5 pending batches as one micro-batch, validates and de-duplicates them, scores sentiment, updates 1-minute windows under a 2-minute watermark, and saves a checkpoint. The dashboard reads only from the engine's state.</p>
      </Section>
      <Section title="Features">
        <L items={["Start, pause, resume and stop controls with separate producer and engine status", "Schema validation with rejected, duplicate and late record counts", "VADER-style sentiment with negation and intensifiers", "Hashtag extraction and top-10 ranking", "Event-time tumbling windows with watermarking", "Checkpointing and recovery across reloads without double counting", "Live charts, recent tweets and a micro-batch log"]} />
      </Section>
      <Section title="Tech stack">
        <L items={["React and TypeScript", "Tailwind CSS for styling", "TanStack Router for pages", "Recharts for charts", "Lucide icons", "Browser localStorage as the checkpoint store"]} />
      </Section>
      <Section title="Expected outputs">
        <L items={["Running totals and percentages of positive, negative and neutral tweets", "Per-window sentiment and volume series", "Top hashtags", "Per-micro-batch row, duration and rejection metrics"]} />
      </Section>
      <Section title="Real-world applications">
        <L items={["Brand and product reputation monitoring", "Customer-support escalation for spikes in negative posts", "Tracking reaction to launches, outages or announcements", "Public-opinion research and crisis monitoring"]} />
      </Section>
      <Section title="Limits of sentiment analysis">
        <L items={["Sarcasm: \"great, another outage\" scores positive", "Slang, abbreviations and emoji meaning are poorly covered by a small lexicon", "Mixed opinions in one post collapse into a single score", "Domain words (for example \"kill a process\") can be misread"]} />
      </Section>
      <Section title="Limits of simulated data">
        <L items={["Tweets come from fixed templates, so vocabulary and topics are narrow", "The sentiment mix is set by the generator, not by real people", "Volumes are tiny compared with a real firehose", "Results show how the pipeline works, not what anyone actually thinks"]} />
      </Section>
      <Section title="Real Twitter/X integration would require">
        <L items={["Authorised developer access to the X API at a tier that allows streaming or search", "API credentials kept server-side in environment variables, never in browser code", "A backend service to hold the connection and forward data", "Compliance with the X developer terms of service, rate limits and data-retention rules"]} />
      </Section>
    </article>
  );
}
