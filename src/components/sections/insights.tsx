import { useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useLog } from "@/lib/log-context";
import { parseCsv } from "@/lib/generate-log";
import { eventLogToCsvFile, postFile, type InsightReport } from "@/lib/api";
import { cn } from "@/lib/utils";
import {
  Sparkles,
  Upload,
  FileCheck2,
  Loader2,
  AlertTriangle,
  TrendingUp,
  Target,
  ListChecks,
} from "lucide-react";

export function InsightsSection() {
  const { log, setLog } = useLog();
  const [report, setReport] = useState<InsightReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checked, setChecked] = useState<Set<number>>(new Set());
  const fileRef = useRef<HTMLInputElement>(null);

  async function run(file: File) {
    setLoading(true);
    setError(null);
    setReport(null);
    setChecked(new Set());
    try {
      const data = await postFile<InsightReport>("/insights", file);
      setReport(data);
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

  function toggleChecked(i: number) {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-navy">Executive Insights</h2>
        <p className="text-sm text-muted-foreground mt-1">
          AI-generated executive summary, findings, and recommended actions — board-ready in
          seconds.
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
            Calling Claude…
          </span>
        )}
      </Card>

      {error && (
        <Card className="p-4 border-destructive/40 bg-destructive/5 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
          <div>
            <div className="font-medium text-destructive">Insights request failed</div>
            <div className="text-xs text-muted-foreground mt-0.5">{error}</div>
          </div>
        </Card>
      )}

      {!report && !loading && !error && <EmptyState />}
      {report && <Report report={report} checked={checked} onToggle={toggleChecked} />}
    </div>
  );
}

function EmptyState() {
  return (
    <Card className="p-12 text-center border-dashed">
      <p className="text-muted-foreground">
        Generate or upload an event log to produce executive insights.
      </p>
    </Card>
  );
}

function Report({
  report,
  checked,
  onToggle,
}: {
  report: InsightReport;
  checked: Set<number>;
  onToggle: (i: number) => void;
}) {
  return (
    <div className="space-y-5">
      <Card className="relative p-6 overflow-hidden border-electric/30 bg-gradient-to-br from-electric/5 via-white to-transparent">
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-electric mb-2">
          <Sparkles className="h-3.5 w-3.5" />
          Executive summary
        </div>
        <p className="text-lg leading-relaxed text-navy">{report.executive_summary}</p>
      </Card>

      <Card className="p-5">
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-muted-foreground mb-2">
          <TrendingUp className="h-3.5 w-3.5" />
          Estimated value
        </div>
        <div className="text-xl font-semibold text-navy">{report.estimated_value}</div>
      </Card>

      <Card className="p-5">
        <div className="flex items-center gap-2 text-sm font-semibold text-navy mb-4">
          <Target className="h-4 w-4 text-electric" />
          Top findings
        </div>
        <ol className="space-y-3">
          {report.top_findings.map((f, i) => (
            <li key={i} className="flex gap-3">
              <span className="shrink-0 h-6 w-6 rounded-full bg-electric/10 text-electric text-xs font-semibold flex items-center justify-center mt-0.5 tabular-nums">
                {i + 1}
              </span>
              <p className="text-sm text-navy/90 leading-relaxed">{f}</p>
            </li>
          ))}
        </ol>
      </Card>

      <div>
        <div className="flex items-center gap-2 text-sm font-semibold text-navy mb-3">
          <ListChecks className="h-4 w-4 text-electric" />
          Recommended actions
        </div>
        <div className="grid gap-3">
          {report.recommended_actions.map((a, i) => {
            const done = checked.has(i);
            return (
              <Card
                key={i}
                className={cn(
                  "p-4 flex items-start gap-3 transition-colors cursor-pointer hover:border-electric/40",
                  done && "bg-success/5 border-success/30",
                )}
                onClick={() => onToggle(i)}
              >
                <Checkbox
                  checked={done}
                  onCheckedChange={() => onToggle(i)}
                  className="mt-0.5"
                  onClick={(e) => e.stopPropagation()}
                />
                <p
                  className={cn(
                    "text-sm leading-relaxed",
                    done ? "text-muted-foreground line-through" : "text-navy",
                  )}
                >
                  {a}
                </p>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
