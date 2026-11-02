import { describe, expect, it } from "vitest";
import { classify, extractHashtags, scoreText } from "./sentiment";
import { runMicroBatch } from "./engine";
import { emptyCheckpoint } from "./types";

describe("sentiment", () => {
  it("thresholds at ±0.05", () => {
    expect(classify(0.05)).toBe("Positive");
    expect(classify(-0.05)).toBe("Negative");
    expect(classify(0.049)).toBe("Neutral");
  });
  it("handles negation", () => {
    expect(scoreText("this is good")).toBeGreaterThan(0);
    expect(scoreText("this is not good")).toBeLessThan(0);
  });
  it("extracts lowercase unique hashtags", () => {
    expect(extractHashtags("a #AI b #ai #BigData")).toEqual(["#ai", "#bigdata"]);
  });
});

describe("engine", () => {
  const ts = new Date().toISOString();
  it("rejects malformed, drops duplicates, never double counts", () => {
    const cp = emptyCheckpoint();
    cp.queue = [{ seq: 0, createdAt: ts, tweets: [
      { id: "a", timestamp: ts, text: "great day" },
      { id: "a", timestamp: ts, text: "great day" },
      { timestamp: ts, text: "no id" },
      { id: "b", timestamp: "bad", text: "x" },
    ] }];
    const r1 = runMicroBatch(cp).cp;
    expect(r1.totals.Positive).toBe(1);
    expect(r1.rejected).toBe(2);
    expect(r1.duplicates).toBe(1);
    // replaying the same batch after commit is skipped
    const replay = { ...r1, queue: cp.queue };
    const r2 = runMicroBatch(replay).cp;
    expect(r2.totals.Positive).toBe(1);
  });
});
