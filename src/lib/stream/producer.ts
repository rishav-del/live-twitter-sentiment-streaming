import type { RawTweet, RawBatch } from "./types";

const TAGS = ["#BigData", "#ApacheSpark", "#Streaming", "#AI", "#Cloud", "#AWS", "#DevOps", "#DataScience", "#Tech", "#Innovation"];
const TOPICS = ["data-engineering", "cloud", "ai", "devops", "analytics"];

const POS = [
  "Really impressed by how fast the new pipeline is, latency dropped a lot!",
  "Love how easy it is to scale this cluster. Great experience so far",
  "Our dashboard is finally real-time. The team is thrilled",
  "Excellent talk on stream processing today, very inspiring",
  "The upgrade was smooth and the jobs are much more reliable now",
  "Best decision this quarter was moving our ETL to a streaming design",
  "Such a helpful community, solved my windowing question in minutes",
  "Amazing results from the new model, accuracy improved again",
  "Clean, elegant API. Really enjoying working with it",
  "Huge win for the data team today, everything works perfectly",
];
const NEG = [
  "Another outage this morning, the whole pipeline is down again",
  "Jobs keep crashing with memory errors, so frustrating",
  "Terrible experience debugging this cluster, logs are a mess",
  "The cloud bill this month is way too expensive",
  "Not happy with the latency, dashboards are really slow today",
  "Ugh, the deploy failed and we lost two hours of data",
  "Worst week ever for our on-call rotation, constant timeouts",
  "Confusing docs and buggy SDK, really disappointed",
  "Data leak news is scary, worried about our own setup",
  "This migration has been a nightmare from start to finish",
];
const NEU = [
  "Reading about event-time windows and watermarks this afternoon",
  "Meetup on stream processing is scheduled for Thursday",
  "Moving the ingestion job to a new region next week",
  "Comparing batch and micro-batch approaches for our use case",
  "New release notes are out for the streaming connector",
  "Testing a 1 minute tumbling window on the sample dataset",
  "Our team is evaluating different message queues",
  "Writing a report on data pipeline architecture",
  "Conference schedule for the data track has been posted",
  "Running the benchmark again with a larger input",
];

const pick = <T,>(a: T[]): T => a[Math.floor(Math.random() * a.length)] as T;
const randInt = (min: number, max: number) => min + Math.floor(Math.random() * (max - min + 1));

function makeId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
}

function hashtags() {
  const n = randInt(1, 3);
  const set = new Set<string>();
  while (set.size < n) set.add(pick(TAGS));
  return Array.from(set).join(" ");
}

function goodTweet(): RawTweet {
  const r = Math.random();
  const base = r < 0.4 ? pick(POS) : r < 0.75 ? pick(NEG) : pick(NEU);
  // small event-time jitter: tweets arrive up to 15s after they were created
  const ts = new Date(Date.now() - randInt(0, 15000)).toISOString();
  return { id: makeId(), timestamp: ts, text: `${base} ${hashtags()}`, topic: pick(TOPICS), source: "simulated" };
}

function malformed(): RawTweet {
  const t = goodTweet();
  const kind = randInt(0, 2);
  if (kind === 0) return { ...t, id: undefined };
  if (kind === 1) return { ...t, timestamp: "not-a-date" };
  return { ...t, text: "   " };
}

export function produceBatch(seq: number): RawBatch {
  const n = randInt(4, 8);
  const tweets: RawTweet[] = [];
  for (let i = 0; i < n; i++) tweets.push(Math.random() < 0.03 ? malformed() : goodTweet());
  // occasionally replay a record to demonstrate dedup
  if (Math.random() < 0.05 && tweets[0]?.id) tweets.push({ ...tweets[0] });
  return { seq, createdAt: new Date().toISOString(), tweets };
}
