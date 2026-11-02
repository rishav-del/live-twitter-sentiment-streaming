import { emptyCheckpoint, type Checkpoint } from "./types";

const KEY = "spark-sim-checkpoint-v1";

export function loadCheckpoint(): Checkpoint {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return emptyCheckpoint();
    const parsed = JSON.parse(raw) as Checkpoint;
    if (parsed?.version !== 1) return emptyCheckpoint();
    return { ...emptyCheckpoint(), ...parsed };
  } catch {
    return emptyCheckpoint();
  }
}

export function saveCheckpoint(cp: Checkpoint): boolean {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(cp));
    return true;
  } catch {
    return false;
  }
}

export function clearCheckpoint(): void {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
