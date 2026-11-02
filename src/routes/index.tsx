import { createFileRoute } from "@tanstack/react-router";
import { Loader2, Pause, Play, RotateCcw, Square, StepForward, Activity } from "lucide-react";
import { useMemo } from "react";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { stream, useStream } from "@/lib/stream/controller";
import { SentimentTag, SimBadge } from "@/components/site/ui";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { WindowState } from "@/lib/stream/types";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard · Live Twitter Sentiment Streaming (Spark-style)" },
      { name: "description", content: "Live dashboard of sentiment, hashtags and micro-batch metrics computed from a simulated tweet stream." },
      { property: "og:title", content: "Live Twitter Sentiment Streaming Dashboard" },
      { property: "og:description", content: "Spark-style micro-batch sentiment analysis on simulated tweets, running in the browser." },
    ],
  }),
  component: Dashboard,
});

const COLORS = { Positive: "var(--positive)", Negative: "var(--negative)", Neutral: "var(--neutral)" };
const tip = {
  contentStyle: { background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 4, fontSize: 12, color: "var(--foreground)" },
  labelStyle: { color: "var(--muted-foreground)" },
  cursor: { fill: "var(--accent)" },
};
const hhmm = (ms: number) => new Date(ms).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
const pct = (n: number, t: number) => (t ? ((n / t) * 100).toFixed(1) : "0.0");

function Btn({ onClick, disabled, children, primary }: { onClick: () => void; disabled?: boolean; children: React.ReactNode; primary?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-1.5 rounded-sm border px-3 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
        primary ? "border-primary bg-primary text-primary-foreground hover:bg-primary/90" : "border-border hover:bg-secondary"
      }`}
    >
      {children}
    </button>
  );
}

function Stat({ label, value, sub }: { label: string; value: React.ReactNode; sub?: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <p className="eyebrow">{label}</p>
      <p className="mt-1 truncate font-mono text-sm">{value}</p>
      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

function Panel({ title, children, right }: { title: string; children: React.ReactNode; right?: React.ReactNode }) {
  return (
    <section className="panel animate-rise min-w-0 p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold">{title}</h2>
        {right}
      </div>
      {children}
    </section>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <div className="flex h-56 items-center justify-center rounded-sm border border-dashed border-border px-4 text-center text-sm text-muted-foreground">{children}</div>;
}

function Dashboard() {
  const s = useStream();
  const { cp } = s;
  const total = cp.totals.Positive + cp.totals.Negative + cp.totals.Neutral;
  const windows: WindowState[] = useMemo(() => [...cp.finalizedWindows, ...cp.activeWindows].slice(-20), [cp.finalizedWindows, cp.activeWindows]);
  const series = windows.map((w) => ({ t: hhmm(w.start), Positive: w.Positive, Negative: w.Negative, Neutral: w.Neutral, total: w.Positive + w.Negative + w.Neutral }));
  const donut = (["Positive", "Negative", "Neutral"] as const).map((k) => ({ name: k, value: cp.totals[k] })).filter((d) => d.value > 0);
  const top = Object.entries(cp.hashtagTotals).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([tag, count]) => ({ tag, count }));
  const processing = s.engine === "processing";
  const emptyMsg = !s.hydrated ? "Loading checkpoint…" : "No data yet. Press Start to begin streaming.";

  return (
    <div className="space-y-6">
      <div className="animate-rise flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0">
          <p className="eyebrow">Spark-style streaming engine (in-browser simulation)</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl text-balance">Live Twitter Sentiment Streaming Application Using Spark</h1>
        </div>
        <SimBadge />
      </div>

      {/* Control bar */}
      <section className="panel p-4" aria-label="Stream controls">
        <div className="flex flex-wrap gap-2">
          <Btn primary onClick={() => stream.start()} disabled={!s.hydrated || s.producer !== "stopped" || s.busy}>
            {s.busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />} {s.busy ? "Starting…" : "Start"}
          </Btn>
          <Btn onClick={() => stream.pause()} disabled={s.producer !== "running"}><Pause className="h-4 w-4" /> Pause</Btn>
          <Btn onClick={() => stream.resume()} disabled={s.producer !== "paused"}><StepForward className="h-4 w-4" /> Resume</Btn>
          <Btn onClick={() => stream.stop()} disabled={s.busy || (s.producer === "stopped" && s.engine === "stopped")}><Square className="h-4 w-4" /> Stop</Btn>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button type="button" disabled={!s.hydrated || s.busy} className="inline-flex items-center gap-1.5 rounded-sm border border-border px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary disabled:opacity-40 sm:ml-auto">
                <RotateCcw className="h-4 w-4" /> Reset checkpoint
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Reset the checkpoint?</AlertDialogTitle>
                <AlertDialogDescription>This stops the stream and deletes saved offsets, processed ids, window state, pending batches and all metrics. It cannot be undone.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => stream.reset()}>Reset</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4 border-t border-border pt-4 sm:grid-cols-3 lg:grid-cols-6">
          <Stat label="Producer" value={s.producer} />
          <Stat label="Engine" value={<span className="inline-flex items-center gap-1.5">{processing && <span className="h-2 w-2 rounded-full bg-primary animate-live" aria-hidden />}{s.engine}</span>} />
          <Stat label="Queue" value={`${cp.queue.length} pending`} sub="batches" />
          <Stat label="Last micro-batch" value={cp.lastBatchAt ? new Date(cp.lastBatchAt).toLocaleTimeString() : "—"} sub={`#${cp.microBatchId} · offset ${cp.committedOffset}`} />
          <Stat label="Rows last batch" value={cp.lastBatchRows} />
          <Stat label="Rejected" value={cp.rejected} sub={`${cp.duplicates} dup · ${cp.late} late`} />
        </div>
        {!s.storageOk && <p role="alert" className="mt-3 text-sm text-negative">Browser storage is unavailable, so the checkpoint is not being saved.</p>}
      </section>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="panel animate-rise p-4">
          <p className="eyebrow flex items-center gap-1.5"><Activity className="h-3.5 w-3.5" /> Total processed</p>
          <p className="mt-2 font-mono text-2xl sm:text-3xl">{total}</p>
          <p className="text-xs text-muted-foreground">valid tweets</p>
        </div>
        {(["Positive", "Negative", "Neutral"] as const).map((k) => (
          <div key={k} className="panel animate-rise p-4">
            <SentimentTag s={k} />
            <p className="mt-2 font-mono text-2xl sm:text-3xl">{cp.totals[k]}</p>
            <p className="font-mono text-xs text-muted-foreground">{pct(cp.totals[k], total)}%</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 min-w-0">
          <Panel title="Sentiment over time" right={<span className="font-mono text-[11px] text-muted-foreground">1-min windows</span>}>
            {series.length === 0 ? <Empty>{emptyMsg}</Empty> : (
              <div className="h-56">
                <ResponsiveContainer>
                  <AreaChart data={series} margin={{ left: -20, right: 8, top: 4 }}>
                    <CartesianGrid stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="t" tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} stroke="var(--border)" />
                    <YAxis allowDecimals={false} tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} stroke="var(--border)" />
                    <Tooltip {...tip} />
                    {(["Neutral", "Negative", "Positive"] as const).map((k) => (
                      <Area key={k} type="monotone" dataKey={k} stackId="1" stroke={COLORS[k]} fill={COLORS[k]} fillOpacity={0.25} isAnimationActive={false} />
                    ))}
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </Panel>
        </div>
        <Panel title="Sentiment distribution">
          {donut.length === 0 ? <Empty>{emptyMsg}</Empty> : (
            <>
              <div className="h-44">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={donut} dataKey="value" nameKey="name" innerRadius="58%" outerRadius="90%" stroke="var(--card)" strokeWidth={2} isAnimationActive={false}>
                      {donut.map((d) => <Cell key={d.name} fill={COLORS[d.name]} />)}
                    </Pie>
                    <Tooltip {...tip} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <ul className="mt-2 space-y-1.5">
                {(["Positive", "Negative", "Neutral"] as const).map((k) => (
                  <li key={k} className="flex items-center justify-between text-sm"><SentimentTag s={k} /><span className="font-mono text-xs">{cp.totals[k]} · {pct(cp.totals[k], total)}%</span></li>
                ))}
              </ul>
            </>
          )}
        </Panel>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Top hashtags" right={<span className="font-mono text-[11px] text-muted-foreground">top 10</span>}>
          {top.length === 0 ? <Empty>{emptyMsg}</Empty> : (
            <div style={{ height: Math.max(160, top.length * 28) }}>
              <ResponsiveContainer>
                <BarChart data={top} layout="vertical" margin={{ left: 10, right: 16 }}>
                  <XAxis type="number" allowDecimals={false} tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} stroke="var(--border)" />
                  <YAxis type="category" dataKey="tag" width={96} tick={{ fill: "var(--foreground)", fontSize: 11, fontFamily: "var(--font-mono)" }} stroke="var(--border)" />
                  <Tooltip {...tip} />
                  <Bar dataKey="count" fill="var(--primary)" radius={[0, 2, 2, 0]} isAnimationActive={false} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Panel>
        <Panel title="Tweet volume per window">
          {series.length === 0 ? <Empty>{emptyMsg}</Empty> : (
            <div className="h-56">
              <ResponsiveContainer>
                <BarChart data={series} margin={{ left: -20, right: 8 }}>
                  <CartesianGrid stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="t" tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} stroke="var(--border)" />
                  <YAxis allowDecimals={false} tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} stroke="var(--border)" />
                  <Tooltip {...tip} />
                  <Bar dataKey="total" name="Tweets" maxBarSize={48} fill="var(--neutral)" radius={[2, 2, 0, 0]} isAnimationActive={false} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Panel>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 min-w-0">
          <Panel title="Recent processed tweets" right={<SimBadge />}>
            {cp.recent.length === 0 ? <Empty>{emptyMsg}</Empty> : (
              <ul className="max-h-[480px] divide-y divide-border overflow-y-auto pr-1">
                {cp.recent.map((t) => (
                  <li key={t.id} className="py-3">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] text-muted-foreground">
                      <span>{new Date(t.timestamp).toLocaleTimeString()}</span>
                      <span>id {t.id.slice(-8)}</span>
                      <span>score {t.score.toFixed(3)}</span>
                      <span className="ml-auto"><SentimentTag s={t.sentiment} /></span>
                    </div>
                    <p className="mt-1.5 break-words text-sm">{t.text}</p>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {t.hashtags.map((h) => <span key={h} className="rounded-sm bg-secondary px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground">{h}</span>)}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>
        <Panel title="Micro-batch log">
          {cp.log.length === 0 ? <Empty>No micro-batches yet.</Empty> : (
            <div className="overflow-x-auto">
              <table className="w-full font-mono text-xs">
                <thead className="text-left text-muted-foreground">
                  <tr><th className="py-1.5 pr-3 font-normal">Batch</th><th className="pr-3 font-normal">Rows</th><th className="pr-3 font-normal">Duration</th><th className="font-normal">Rejected</th></tr>
                </thead>
                <tbody>
                  {cp.log.map((l) => (
                    <tr key={l.batchId} className="border-t border-border">
                      <td className="py-1.5 pr-3">#{l.batchId}</td>
                      <td className="pr-3">{l.rows}</td>
                      <td className="pr-3">{l.durationMs} ms</td>
                      <td className={l.rejected ? "text-negative" : ""}>{l.rejected}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}
