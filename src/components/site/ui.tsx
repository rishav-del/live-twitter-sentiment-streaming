import { CircleMinus, TrendingDown, TrendingUp } from "lucide-react";
import type { ReactNode } from "react";
import type { SentimentLabel } from "@/lib/stream/sentiment";

export function SimBadge() {
  return (
    <span className="inline-flex self-start md:self-auto shrink-0 items-center gap-1.5 rounded-sm border border-border px-2 py-0.5 font-mono text-[11px] text-muted-foreground">
      <span className="h-1.5 w-1.5 rounded-full bg-neutral" aria-hidden /> Simulated Twitter Data
    </span>
  );
}

const SENT = {
  Positive: { icon: TrendingUp, cls: "text-positive border-positive/40" },
  Negative: { icon: TrendingDown, cls: "text-negative border-negative/40" },
  Neutral: { icon: CircleMinus, cls: "text-neutral border-neutral/40" },
} as const;

export function SentimentTag({ s }: { s: SentimentLabel }) {
  const { icon: Icon, cls } = SENT[s];
  return (
    <span className={`inline-flex shrink-0 items-center gap-1 rounded-sm border px-1.5 py-0.5 text-xs font-medium ${cls}`}>
      <Icon className="h-3.5 w-3.5" aria-hidden /> {s}
    </span>
  );
}

export function PageHeader({ eyebrow, title, children }: { eyebrow: string; title: string; children?: ReactNode }) {
  return (
    <div className="animate-rise mb-10 max-w-3xl">
      <p className="eyebrow mb-3">{eyebrow}</p>
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl text-balance">{title}</h1>
      {children && <div className="mt-4 text-muted-foreground leading-relaxed">{children}</div>}
    </div>
  );
}

export function Section({ title, children, id }: { title: string; children: ReactNode; id?: string }) {
  return (
    <section id={id} className="border-t border-border py-8 grid gap-4 md:grid-cols-[220px_1fr] md:gap-10">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground font-mono">{title}</h2>
      <div className="min-w-0 space-y-3 leading-relaxed text-foreground/90">{children}</div>
    </section>
  );
}
