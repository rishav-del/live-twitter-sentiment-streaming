// VADER-style lexicon sentiment scorer (simplified, in-browser).
export const LEXICON: Record<string, number> = {
  // positive
  good: 1.9, great: 3.1, excellent: 3.2, amazing: 2.8, awesome: 3.1, love: 3.2, loving: 2.9, loved: 2.9,
  like: 1.5, liked: 1.5, enjoy: 2.2, enjoying: 2.2, happy: 2.7, glad: 2.0, nice: 1.8, fantastic: 3.0,
  brilliant: 2.8, impressive: 2.4, impressed: 2.2, fast: 1.2, faster: 1.4, reliable: 1.8, stable: 1.4,
  smooth: 1.6, easy: 1.7, easier: 1.6, simple: 1.0, clean: 1.3, powerful: 2.0, efficient: 1.9,
  helpful: 2.0, useful: 1.8, best: 3.2, better: 1.9, win: 2.5, wins: 2.5, winning: 2.4, success: 2.7,
  successful: 2.6, solved: 1.8, fixed: 1.4, improved: 1.9, improvement: 1.8, thrilled: 2.9,
  excited: 2.3, exciting: 2.4, perfect: 2.9, wonderful: 3.0, superb: 3.0, elegant: 2.1, seamless: 2.0,
  scalable: 1.5, productive: 1.9, recommend: 1.9, recommended: 1.9, thanks: 1.9, thank: 1.6,
  grateful: 2.4, proud: 2.1, beautiful: 2.9, cool: 1.3, solid: 1.4, boost: 1.6, boosted: 1.6,
  breakthrough: 2.3, innovative: 2.0, inspiring: 2.4, robust: 1.7, delightful: 2.8, smart: 1.7,
  wow: 2.4, yay: 2.4, finally: 0.8, saved: 1.5, gain: 1.4, gains: 1.4, celebrate: 2.6, works: 1.0,
  // negative
  bad: -2.5, terrible: -2.9, awful: -3.1, horrible: -3.0, hate: -2.7, hated: -2.7, hating: -2.6,
  dislike: -1.6, slow: -1.5, slower: -1.6, broken: -2.4, break: -1.2, breaks: -1.4, crash: -2.3,
  crashed: -2.4, crashes: -2.3, bug: -1.5, bugs: -1.6, buggy: -2.0, fail: -2.4, failed: -2.3,
  failing: -2.3, failure: -2.6, error: -1.8, errors: -1.9, outage: -2.5, down: -1.0, downtime: -2.0,
  annoying: -2.2, annoyed: -2.0, frustrating: -2.4, frustrated: -2.3, angry: -2.6, sad: -2.1,
  disappointed: -2.3, disappointing: -2.3, worst: -3.1, worse: -2.1, painful: -2.2, pain: -1.8,
  expensive: -1.4, costly: -1.4, confusing: -1.7, confused: -1.5, messy: -1.5, mess: -1.7,
  useless: -2.5, poor: -2.1, problem: -1.7, problems: -1.8, issue: -1.2, issues: -1.3, lost: -1.6,
  lose: -1.6, loss: -1.8, losing: -1.7, leak: -1.9, leaked: -2.1, vulnerable: -1.7, risk: -1.1,
  risky: -1.5, worried: -1.8, worry: -1.6, fear: -2.1, scary: -2.2, stuck: -1.6, nightmare: -2.8,
  regret: -2.0, unstable: -1.9, laggy: -1.8, lag: -1.4, timeout: -1.5, timeouts: -1.6, ugh: -1.9,
  sucks: -2.4, waste: -2.0, wasted: -2.1, hard: -0.8, difficult: -1.3, overloaded: -1.6, panic: -2.2,
  blocked: -1.4, unfortunately: -1.6, meh: -0.9, boring: -1.6, hype: -0.5, overhyped: -1.8,
};

const NEGATIONS = new Set(["not", "no", "never", "isn't", "isnt", "wasn't", "wasnt", "don't", "dont", "doesn't", "doesnt", "can't", "cant", "won't", "wont", "nothing", "hardly", "without"]);
const BOOSTERS: Record<string, number> = {
  very: 0.293, really: 0.293, extremely: 0.4, super: 0.3, so: 0.2, incredibly: 0.4, totally: 0.3,
  absolutely: 0.4, highly: 0.3, slightly: -0.293, somewhat: -0.2, barely: -0.3, kinda: -0.2,
};
const ALPHA = 15;

export type SentimentLabel = "Positive" | "Negative" | "Neutral";

export function scoreText(text: string): number {
  const tokens = text
    .toLowerCase()
    .replace(/#\w+/g, " ")
    .replace(/https?:\/\/\S+/g, " ")
    .split(/[^a-z']+/)
    .filter(Boolean);
  let sum = 0;
  tokens.forEach((tok, i) => {
    let v = LEXICON[tok];
    if (v === undefined) return;
    // intensifier immediately before
    const prev = tokens[i - 1];
    if (prev && BOOSTERS[prev] !== undefined) v += Math.sign(v) * BOOSTERS[prev];
    // negation within previous 3 tokens
    for (let k = 1; k <= 3; k++) {
      const t = tokens[i - k];
      if (t && NEGATIONS.has(t)) {
        v *= -0.74;
        break;
      }
    }
    sum += v;
  });
  const excl = Math.min((text.match(/!/g) || []).length, 4) * 0.292;
  if (sum > 0) sum += excl;
  else if (sum < 0) sum -= excl;
  if (sum === 0) return 0;
  return Number((sum / Math.sqrt(sum * sum + ALPHA)).toFixed(4));
}

export function classify(score: number): SentimentLabel {
  if (score >= 0.05) return "Positive";
  if (score <= -0.05) return "Negative";
  return "Neutral";
}

export function extractHashtags(text: string): string[] {
  const m = text.match(/#\w+/g) || [];
  return Array.from(new Set(m.map((h) => h.toLowerCase())));
}
