import { useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLog } from "@/lib/log-context";
import { parseCsv } from "@/lib/generate-log";
import {
  eventLogToCsvFile,
  postFile,
  type Bottleneck,
  type ProcessModel,
} from "@/lib/api";
import { cn } from "@/lib/utils";
import {
  Lightbulb,
  Upload,
  FileCheck2,
  Loader2,
  AlertTriangle,
  Bot,
  Zap,
  Workflow,
  GitBranch,
  ShieldAlert,
} from "lucide-react";

type UseCase = {
  id: number;
  title: string;
  category: string;
  description: string;
  impact: number;
  confidence: number;
  ease: number;
  ice: number;
  Icon: React.ComponentType<{ className?: string }>;
};

export function UseCasesSection() {
  const { log, setLog } = useLog();
  const [model, setModel] = useState<ProcessModel | null>(null);
  const [bottlenecks, setBottlenecks] = useState<Bottleneck[] | null>(null);
  const [useCases, setUseCases] = useState<UseCase[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function run(file: File) {
    setLoading(true);
    setError(null);
    setModel(null);
    setBottlenecks(null);
    setUseCases(null);
    try {
      const [m, b] = await Promise.all([
        postFile<ProcessModel>("/discover", file),
        postFile<Bottleneck[]>("/bottlenecks", file),
      ]);
      setModel(m);
      setBottlenecks(b);
      setUseCases(buildUseCases(b));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  function runFromGenerated() {
    if (!log) return;
    void run(eventLogToCsvFile(log, "generated.csv"));
  }

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    f.text().then((t) => setLog(parseCsv(t)));
    void run(f);
    e.target.value = "";
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-navy">AI Use Case Discovery</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Discover AI use cases ranked by ICE score (Impact · Confidence · Ease) — derived
          from process bottlenecks.
        </p>
      </div>

      <Card className="p-5 flex flex-wrap items-center gap-3">
        {log && (
          <Button
            onClick={runFromGenerated}
            disabled={loading}
            className="bg-electric hover:bg-electric/90 text-white"
          >
            <FileCheck2 className="h-4 w-4 mr-2" />
            Use generated log ({log.length.toLocaleString()} events)
          </Button>
        )}
        <Button
          variant="outline"
          onClick={() => fileRef.current?.click()}
          disabled={loading}
        >
          <Upload className="h-4 w-4 mr-2" />
          Upload CSV
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept=".csv,text/csv"
          hidden
          onChange={onFile}
        />
        {loading && (
          <span className="flex items-center gap-2 text-xs text-muted-foreground ml-auto">
            <Loader2 className="h-3 w-3 animate-spin" />
            Discovering process…
          </span>
        )}
      </Card>

      {error && (
        <Card className="p-4 border-destructive/40 bg-destructive/5 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
          <div>
            <div className="font-medium text-destructive">Discovery failed</div>
            <div className="text-xs text-muted-foreground mt-0.5">{error}</div>
          </div>
        </Card>
      )}

      {model && bottlenecks && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <MiniStat label="Algorithm" value={model.algorithm} mono />
          <MiniStat label="Activities" value={model.num_activities.toLocaleString()} />
          <MiniStat
            label="Fitness"
            value={`${(model.fitness_score * 100).toFixed(0)}%`}
          />
          <MiniStat label="Bottlenecks" value={bottlenecks.length.toLocaleString()} />
        </div>
      )}

      {!useCases && !loading && !error && <EmptyState />}

      {useCases && useCases.length > 0 && (
        <div className="space-y-3">
          <div className="text-sm font-semibold text-navy flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-electric" />
            Top {useCases.length} use cases · ranked by ICE
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {useCases.map((uc, rank) => (
              <UseCaseCard key={uc.id} useCase={uc} rank={rank + 1} />
            ))}
          </div>
        </div>
      )}

      {useCases && useCases.length === 0 && (
        <Card className="p-8 text-center border-dashed">
          <p className="text-muted-foreground text-sm">
            No bottlenecks detected — process is already lean. Try a noisier event log.
          </p>
        </Card>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <Card className="p-12 text-center border-dashed">
      <p className="text-muted-foreground">
        Generate or upload an event log to discover AI use cases.
      </p>
    </Card>
  );
}

function MiniStat({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <Card className="p-4">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div
        className={cn(
          "mt-1 text-lg font-bold tabular-nums text-navy",
          mono && "font-mono text-sm capitalize",
        )}
      >
        {value}
      </div>
    </Card>
  );
}

function UseCaseCard({ useCase, rank }: { useCase: UseCase; rank: number }) {
  const tone =
    useCase.ice >= 8
      ? "text-success"
      : useCase.ice >= 6
        ? "text-electric"
        : "text-warning";
  return (
    <Card className="p-5 flex flex-col gap-4 hover:border-electric/40 transition-colors">
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-lg bg-electric/10 flex items-center justify-center shrink-0">
          <useCase.Icon className="h-5 w-5 text-electric" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono text-muted-foreground">
              #{rank}
            </span>
            <Badge variant="secondary" className="text-[10px]">
              {useCase.category}
            </Badge>
          </div>
          <h3 className="font-semibold text-navy leading-tight">{useCase.title}</h3>
        </div>
        <div className="text-right shrink-0">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
            ICE
          </div>
          <div className={cn("text-2xl font-bold tabular-nums", tone)}>
            {useCase.ice.toFixed(1)}
          </div>
        </div>
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed">
        {useCase.description}
      </p>
      <div className="grid grid-cols-3 gap-2 pt-3 border-t border-border">
        <ScoreBar label="Impact" value={useCase.impact} />
        <ScoreBar label="Confidence" value={useCase.confidence} />
        <ScoreBar label="Ease" value={useCase.ease} />
      </div>
    </Card>
  );
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        <span className="text-xs font-mono font-semibold text-navy">{value}</span>
      </div>
      <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
        <div
          className="h-full bg-electric rounded-full"
          style={{ width: `${value * 10}%` }}
        />
      </div>
    </div>
  );
}

const TEMPLATES: {
  category: string;
  Icon: React.ComponentType<{ className?: string }>;
  title: (a: string) => string;
  description: (b: Bottleneck) => string;
  easeAdj: number;
  confAdj: number;
}[] = [
  {
    category: "Automation",
    Icon: Zap,
    title: (a) => `Automate "${a}"`,
    description: (b) =>
      `Replace manual handling of "${b.activity}" with rules-based automation. Currently averages ${fmtWait(b.avg_wait_time_seconds)} of wait time across ${b.frequency.toLocaleString()} executions — a prime candidate for elimination.`,
    easeAdj: 1,
    confAdj: 1,
  },
  {
    category: "Predictive AI",
    Icon: Bot,
    title: (a) => `Predict delays at "${a}"`,
    description: (b) =>
      `Train a model to forecast SLA breaches at "${b.activity}" before they happen. ${(b.rework_rate * 100).toFixed(0)}% rework rate provides enough signal for reliable early-warning detection.`,
    easeAdj: -1,
    confAdj: 0,
  },
  {
    category: "Smart Routing",
    Icon: GitBranch,
    title: (a) => `Route work around "${a}"`,
    description: (b) =>
      `When "${b.activity}" is congested, dynamically reroute eligible cases through parallel paths to reduce queue time during peak load.`,
    easeAdj: 0,
    confAdj: -1,
  },
  {
    category: "AI Copilot",
    Icon: Workflow,
    title: (a) => `AI copilot for "${a}"`,
    description: (b) =>
      `Embed a Claude-powered assistant in the "${b.activity}" workflow — pre-fills context, suggests decisions, and drafts responses. Cuts review time on every touch.`,
    easeAdj: -1,
    confAdj: 0,
  },
  {
    category: "Anomaly Detection",
    Icon: ShieldAlert,
    title: (a) => `Detect anomalies in "${a}"`,
    description: (b) =>
      `Flag cases where "${b.activity}" deviates from the happy path. With ${(b.rework_rate * 100).toFixed(0)}% rework today, anomaly scoring will surface the costliest deviations first.`,
    easeAdj: 0,
    confAdj: 1,
  },
];

function buildUseCases(bottlenecks: Bottleneck[]): UseCase[] {
  if (bottlenecks.length === 0) return [];
  const maxWait = Math.max(...bottlenecks.map((b) => b.avg_wait_time_seconds), 1);
  const maxFreq = Math.max(...bottlenecks.map((b) => b.frequency), 1);

  const cases = TEMPLATES.map((tpl, i) => {
    const b = bottlenecks[i % bottlenecks.length];
    const impactSignal =
      (b.avg_wait_time_seconds / maxWait) * 0.6 +
      (b.frequency / maxFreq) * 0.4;
    const impact = clamp(Math.round(4 + impactSignal * 6), 1, 10);
    const confidence = clamp(
      Math.round(5 + (b.frequency / maxFreq) * 5 + tpl.confAdj),
      1,
      10,
    );
    const ease = clamp(Math.round(8 - b.rework_rate * 8 + tpl.easeAdj), 1, 10);
    const ice = +((impact + confidence + ease) / 3).toFixed(1);
    return {
      id: i,
      title: tpl.title(b.activity),
      category: tpl.category,
      description: tpl.description(b),
      Icon: tpl.Icon,
      impact,
      confidence,
      ease,
      ice,
    };
  });

  return cases.sort((a, b) => b.ice - a.ice);
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}

function fmtWait(s: number): string {
  if (s < 60) return `${s.toFixed(0)}s`;
  if (s < 3600) return `${(s / 60).toFixed(0)}m`;
  if (s < 86400) return `${(s / 3600).toFixed(1)}h`;
  return `${(s / 86400).toFixed(1)}d`;
}
