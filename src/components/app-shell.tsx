import { useLog, type Section } from "@/lib/log-context";
import { EldorethLogo } from "./eldoreth-logo";
import { Wand2, ScanSearch, Sparkles, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV: { id: Section; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "generator", label: "Generator", icon: Wand2 },
  { id: "inspector", label: "Inspector", icon: ScanSearch },
  { id: "insights", label: "Insights", icon: Sparkles },
  { id: "use-cases", label: "Use Cases", icon: Lightbulb },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const { section, setSection, log } = useLog();
  return (
    <div className="flex min-h-screen w-full bg-background text-foreground">
      <aside className="hidden md:flex w-64 shrink-0 flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
        <div className="flex items-center gap-3 px-5 py-5 border-b border-sidebar-border">
          <EldorethLogo className="h-9 w-9" />
          <div className="leading-tight">
            <div className="text-base font-bold tracking-tight text-white">Eldoreth</div>
            <div className="text-[10px] uppercase tracking-[0.14em] text-electric-glow/80">
              Process Intelligence
            </div>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.map((n) => {
            const active = section === n.id;
            return (
              <button
                key={n.id}
                onClick={() => setSection(n.id)}
                className={cn(
                  "w-full flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors text-left",
                  active
                    ? "bg-electric/15 text-white border border-electric/40 shadow-[0_0_0_1px_oklch(0.62_0.21_258_/_0.25)]"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-white",
                )}
              >
                <n.icon className={cn("h-4 w-4", active ? "text-electric-glow" : "")} />
                {n.label}
              </button>
            );
          })}
        </nav>
        <div className="px-5 py-4 border-t border-sidebar-border text-[11px] text-sidebar-foreground/60">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "h-1.5 w-1.5 rounded-full",
                log ? "bg-success" : "bg-sidebar-foreground/30",
              )}
            />
            {log ? `Log loaded · ${log.length.toLocaleString()} events` : "No log loaded"}
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="flex items-center justify-between border-b border-border bg-white/80 backdrop-blur px-6 py-4">
          <div className="flex items-center gap-3 md:hidden">
            <EldorethLogo className="h-7 w-7" />
            <span className="font-semibold text-navy">Eldoreth</span>
          </div>
          <div className="hidden md:block">
            <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              Process Intelligence Suite
            </div>
            <h1 className="text-lg font-semibold text-navy capitalize">
              {section.replace("-", " ")}
            </h1>
          </div>
          <div className="flex md:hidden gap-1">
            {NAV.map((n) => (
              <button
                key={n.id}
                onClick={() => setSection(n.id)}
                className={cn(
                  "p-2 rounded-md",
                  section === n.id ? "bg-electric/15 text-electric" : "text-muted-foreground",
                )}
                aria-label={n.label}
              >
                <n.icon className="h-4 w-4" />
              </button>
            ))}
          </div>
        </header>
        <main className="flex-1 overflow-auto p-6 lg:p-8">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
