import { useSyncExternalStore } from "react";
import { toast } from "sonner";
import { clearCheckpoint, loadCheckpoint, saveCheckpoint } from "./checkpoint";
import { runMicroBatch } from "./engine";
import { produceBatch } from "./producer";
import { emptyCheckpoint, type Checkpoint, type EngineStatus, type ProducerStatus } from "./types";

export const PRODUCER_INTERVAL = 2000;
export const TRIGGER_INTERVAL = 3000;

export interface StreamState {
  hydrated: boolean;
  producer: ProducerStatus;
  engine: EngineStatus;
  busy: boolean;
  storageOk: boolean;
  cp: Checkpoint;
}

let state: StreamState = {
  hydrated: false, producer: "stopped", engine: "stopped", busy: false, storageOk: true, cp: emptyCheckpoint(),
};
const listeners = new Set<() => void>();
let producerTimer: ReturnType<typeof setInterval> | null = null;
let engineTimer: ReturnType<typeof setInterval> | null = null;

function set(patch: Partial<StreamState>) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}

function produce() {
  const cp = state.cp;
  const batch = produceBatch(cp.producerSeq);
  const next = { ...cp, producerSeq: cp.producerSeq + 1, queue: [...cp.queue, batch] };
  set({ cp: next, storageOk: saveCheckpoint(next) });
}

function trigger() {
  if (state.cp.queue.length === 0) {
    if (state.engine !== "idle") set({ engine: "idle" });
    return;
  }
  const { cp } = runMicroBatch(state.cp);
  set({ cp, engine: "processing", storageOk: saveCheckpoint(cp) });
}

function startEngine(): Promise<void> {
  if (engineTimer) return Promise.resolve();
  set({ engine: "starting" });
  return new Promise((resolve) => {
    setTimeout(() => {
      engineTimer = setInterval(trigger, TRIGGER_INTERVAL);
      set({ engine: state.cp.queue.length ? "processing" : "idle" });
      trigger();
      resolve();
    }, 700);
  });
}

function startProducer() {
  if (producerTimer) return;
  producerTimer = setInterval(produce, PRODUCER_INTERVAL);
  produce();
  set({ producer: "running" });
}

function stopProducer(status: ProducerStatus) {
  if (producerTimer) clearInterval(producerTimer);
  producerTimer = null;
  set({ producer: status });
}

export const stream = {
  init() {
    if (state.hydrated) return;
    const cp = loadCheckpoint();
    set({ hydrated: true, cp });
    if (cp.queue.length > 0) {
      const n = cp.queue.length;
      startEngine().then(() =>
        toast.info(`Recovered from checkpoint`, { description: `Engine resumed at offset ${cp.committedOffset + 1} with ${n} pending batch${n === 1 ? "" : "es"}.` }),
      );
    }
  },
  async start() {
    if (state.producer !== "stopped" || state.busy) return;
    set({ busy: true });
    const resumed = state.cp.committedOffset >= 0;
    await startEngine();
    startProducer();
    set({ busy: false });
    toast.success(resumed ? "Stream started from checkpoint" : "Stream started", {
      description: resumed ? `Resuming after offset ${state.cp.committedOffset}.` : "Producer and engine are running.",
    });
  },
  pause() {
    if (state.producer !== "running") return;
    stopProducer("paused");
    toast("Producer paused", { description: "The engine keeps draining the incoming queue." });
  },
  resume() {
    if (state.producer !== "paused") return;
    startProducer();
    toast.success("Producer resumed");
  },
  stop() {
    stopProducer("stopped");
    if (engineTimer) clearInterval(engineTimer);
    engineTimer = null;
    const ok = saveCheckpoint(state.cp);
    set({ engine: "stopped", storageOk: ok });
    const n = state.cp.queue.length;
    toast(ok ? "Stream stopped, checkpoint saved" : "Stream stopped", {
      description: ok ? `${n} pending batch${n === 1 ? "" : "es"} will be processed on restart.` : "Checkpoint could not be written to browser storage.",
    });
  },
  reset() {
    stopProducer("stopped");
    if (engineTimer) clearInterval(engineTimer);
    engineTimer = null;
    clearCheckpoint();
    set({ engine: "stopped", cp: emptyCheckpoint() });
    toast("Checkpoint reset", { description: "All offsets, state and metrics were cleared." });
  },
  subscribe(l: () => void) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
  get: () => state,
};

const serverState = state;
export function useStream(): StreamState {
  return useSyncExternalStore(stream.subscribe, stream.get, () => serverState);
}
