import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { LogoMark } from "./Logo";
import { useStream } from "@/lib/stream/controller";

const NAV = [
  { to: "/", label: "Dashboard" },
  { to: "/project", label: "Project" },
  { to: "/methodology", label: "Methodology" },
  { to: "/viva", label: "Viva Q&A" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const s = useStream();
  const live = s.engine === "processing";
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link to="/" className="flex min-w-0 items-center gap-2.5 rounded-sm" aria-label="Live Twitter Sentiment, go to dashboard">
          <LogoMark />
          <span className="truncate text-sm font-semibold tracking-tight">
            Live Sentiment <span className="text-muted-foreground font-normal hidden sm:inline">/ Spark-style streaming</span>
          </span>
        </Link>
        <nav className="hidden md:flex items-center gap-1" aria-label="Main">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              activeOptions={{ exact: true }}
              className="rounded-sm px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground data-[status=active]:text-foreground data-[status=active]:bg-secondary"
            >
              {n.label}
            </Link>
          ))}
          <span className="ml-3 flex items-center gap-2 font-mono text-xs text-muted-foreground">
            <span className={`h-2 w-2 rounded-full ${live ? "bg-primary animate-live" : "bg-muted-foreground/50"}`} aria-hidden />
            {live ? "processing" : s.engine}
          </span>
        </nav>
        <button
          type="button"
          className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-sm border border-border"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((o) => !o)}
        >
          {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </div>
      {open && (
        <nav id="mobile-nav" className="md:hidden border-t border-border px-4 py-2" aria-label="Mobile">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              activeOptions={{ exact: true }}
              onClick={() => setOpen(false)}
              className="block rounded-sm px-3 py-2.5 text-sm text-muted-foreground data-[status=active]:text-foreground data-[status=active]:bg-secondary"
            >
              {n.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-border">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 sm:px-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <LogoMark className="h-5 w-5" />
          <span className="font-mono text-xs text-muted-foreground">© {new Date().getFullYear()} Live Twitter Sentiment Streaming</span>
        </div>
        <nav className="flex flex-wrap gap-x-5 gap-y-2 text-sm" aria-label="Footer">
          <Link to="/" className="text-muted-foreground hover:text-foreground">Dashboard</Link>
          <Link to="/project" className="text-muted-foreground hover:text-foreground">Project overview</Link>
          <Link to="/methodology" className="text-muted-foreground hover:text-foreground">Methodology</Link>
          <Link to="/viva" className="text-muted-foreground hover:text-foreground">Viva Q&amp;A</Link>
        </nav>
      </div>
      <p className="mx-auto max-w-7xl px-4 pb-8 text-xs text-muted-foreground sm:px-6">
        Independent academic project, not affiliated with Twitter/X or Apache Spark. Tweets are simulated.
      </p>
    </footer>
  );
}
