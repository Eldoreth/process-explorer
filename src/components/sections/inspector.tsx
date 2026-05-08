import { useMemo, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLog } from "@/lib/log-context";
import { parseCsv, type EventRow } from "@/lib/generate-log";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import { Upload, FileCheck2, Download, Check, X } from "lucide-react";

export function InspectorSection() {
  const { log, setLog } = useLog();
  const [active, setActive] = useState<EventRow[] | null>(log);
  const fileRef = useRef<HTMLInputElement>(null);

  // sync if generator log changes
  if (log && !active) {
    // no-op; user must click button
  }

  function useGenerated() {
    if (log) setActive(log);
  }

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    f.text().then((t) => {
      const rows = parseCsv(t);
      setActive(rows);
      setLog(rows);
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-navy">Event Log Inspector</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Validate quality, surface anomalies, and produce a shareable report.
        </p>
      </div>

      <Card className="p-5 flex flex-wrap items-center gap-3">
        {log && (
          <Button onClick={useGenerated} className="bg-electric hover:bg-electric/90 text-white">
            <FileCheck2 className="h-4 w-4 mr-2" />
            Use generated log ({log.length.toLocaleString()} events)
          </Button>
        )}
        <Button variant="outline" onClick={() => fileRef.current?.click()}>
          <Upload className="h-4 w-4 mr-2" />
          Upload CSV
        </Button>
        <input ref={fileRef} type="file" accept=".csv,text/csv" hidden onChange={onFile} />
        {active && (
          <span className="text-xs text-muted-foreground ml-auto">
            Inspecting {active.length.toLocaleString()} events
          </span>
        )}
      </Card>

      {active && active.length > 0 ? <Analysis rows={active} /> : <EmptyState />}
    </div>
  );
}

function EmptyState() {
  return (
    <Card className="p-12 text-center border-dashed">
      <p className="text-muted-foreground">
        No event log loaded. Generate one or upload a CSV with columns:{" "}
        <code className="font-mono text-xs text-navy">case_id, activity, timestamp, resource</code>
      </p>
    </Card>
  );
}

function Analysis({ rows }: { rows: EventRow[] }) {
  const stats = useMemo(() => computeStats(rows), [rows]);

  function downloadReport() {
    const md = buildReport(stats);
    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "eldoreth_inspector_report.md";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <Stat label="Total cases" value={stats.totalCases.toLocaleString()} />
        <Stat label="Total events" value={stats.totalEvents.toLocaleString()} />
        <Stat label="Unique activities" value={stats.uniqueActivities.toLocaleString()} />
        <Stat label="Date range" value={stats.dateRange} mono />
        <Stat
          label="Quality score"
          value={`${stats.qualityScore}/100`}
          accent={stats.qualityScore >= 80 ? "success" : stats.qualityScore >= 60 ? "warning" : "destructive"}
        />
      </div>

      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-navy">Data quality checklist</h3>
          <Button variant="outline" size="sm" onClick={downloadReport}>
            <Download className="h-4 w-4 mr-2" />
            Download report
          </Button>
        </div>
        <ul className="space-y-2">
          {stats.checks.map((c) => (
            <li
              key={c.name}
              className="flex items-start gap-3 text-sm border-b border-border last:border-0 pb-2 last:pb-0"
            >
              <span
                className={`mt-0.5 h-5 w-5 rounded-full flex items-center justify-center ${c.pass ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"}`}
              >
                {c.pass ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
              </span>
              <div className="flex-1">
                <div className="font-medium text-navy">{c.name}</div>
                <div className="text-muted-foreground text-xs">{c.detail}</div>
              </div>
            </li>
          ))}
        </ul>
      </Card>

      <Card className="p-5">
        <h3 className="font-semibold text-navy mb-4">Top 10 activities</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.topActivities} margin={{ left: 10, right: 10, top: 10, bottom: 50 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.012 260)" />
              <XAxis
                dataKey="name"
                interval={0}
                angle={-30}
                textAnchor="end"
                tick={{ fontSize: 11, fill: "oklch(0.5 0.03 260)" }}
              />
              <YAxis tick={{ fontSize: 11, fill: "oklch(0.5 0.03 260)" }} />
              <Tooltip
                contentStyle={{
                  background: "oklch(0.165 0.045 265)",
                  border: "none",
                  borderRadius: 8,
                  color: "white",
                  fontSize: 12,
                }}
              />
              <Bar dataKey="count" fill="oklch(0.62 0.21 258)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-navy">Case duration distribution</h3>
          <div className="flex gap-4 text-xs text-muted-foreground">
            <span>min <b className="text-navy font-mono">{fmtH(stats.duration.min)}</b></span>
            <span>med <b className="text-navy font-mono">{fmtH(stats.duration.median)}</b></span>
            <span>avg <b className="text-navy font-mono">{fmtH(stats.duration.avg)}</b></span>
            <span>max <b className="text-navy font-mono">{fmtH(stats.duration.max)}</b></span>
          </div>
        </div>
        <div className="h-60">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.histogram}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.012 260)" />
              <XAxis dataKey="bucket" tick={{ fontSize: 11, fill: "oklch(0.5 0.03 260)" }} />
              <YAxis tick={{ fontSize: 11, fill: "oklch(0.5 0.03 260)" }} />
              <Tooltip
                contentStyle={{
                  background: "oklch(0.165 0.045 265)",
                  border: "none",
                  borderRadius: 8,
                  color: "white",
                  fontSize: 12,
                }}
              />
              <Bar dataKey="count" fill="oklch(0.72 0.18 250)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}

function Stat({
  label, value, mono, accent,
}: { label: string; value: string; mono?: boolean; accent?: "success" | "warning" | "destructive" }) {
  const color =
    accent === "success" ? "text-success" :
    accent === "warning" ? "text-warning" :
    accent === "destructive" ? "text-destructive" : "text-navy";
  return (
    <Card className="p-4">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`mt-1 text-xl font-bold tabular-nums ${color} ${mono ? "font-mono text-sm" : ""}`}>
        {value}
      </div>
    </Card>
  );
}

function fmtH(h: number) {
  if (h < 24) return `${h.toFixed(1)}h`;
  return `${(h / 24).toFixed(1)}d`;
}

type Stats = ReturnType<typeof computeStats>;

function computeStats(rows: EventRow[]) {
  const cases = new Map<string, EventRow[]>();
  rows.forEach((r) => {
    const arr = cases.get(r.case_id) ?? [];
    arr.push(r);
    cases.set(r.case_id, arr);
  });

  const activityCount = new Map<string, number>();
  rows.forEach((r) => activityCount.set(r.activity, (activityCount.get(r.activity) ?? 0) + 1));
  const totalActivities = activityCount.size;

  // checks
  const missing = rows.filter((r) => !r.case_id || !r.activity || !r.timestamp).length;
  const seen = new Set<string>();
  let dupes = 0;
  rows.forEach((r) => {
    const k = `${r.case_id}|${r.activity}|${r.timestamp}`;
    if (seen.has(k)) dupes++;
    else seen.add(k);
  });
  let singletons = 0;
  cases.forEach((c) => { if (c.length === 1) singletons++; });
  let timestampViolations = 0;
  cases.forEach((c) => {
    const sorted = [...c].sort((a, b) => a.timestamp.localeCompare(b.timestamp));
    if (sorted.map((s) => s.timestamp).join() !== c.map((s) => s.timestamp).join()) {
      timestampViolations++;
    }
  });
  const rare = Array.from(activityCount.values()).filter((v) => v < 3).length;

  const checks = [
    { name: "Missing values", pass: missing === 0, detail: `${missing} rows with empty fields` },
    { name: "Duplicate events", pass: dupes === 0, detail: `${dupes} duplicate (case+activity+timestamp)` },
    { name: "Cases with 1 event", pass: singletons / cases.size < 0.05, detail: `${singletons} of ${cases.size} cases (${pct(singletons / cases.size)})` },
    { name: "Timestamp ordering", pass: timestampViolations === 0, detail: `${timestampViolations} cases with out-of-order events` },
    { name: "Rare activities", pass: rare === 0, detail: `${rare} activities occur fewer than 3 times` },
  ];

  const failPenalty = checks.filter((c) => !c.pass).length * 12;
  const qualityScore = Math.max(0, 100 - failPenalty - Math.min(20, Math.round((singletons / cases.size) * 100)));

  // date range
  const ts = rows.map((r) => r.timestamp).sort();
  const dateRange = ts.length
    ? `${ts[0].slice(0, 10)} → ${ts[ts.length - 1].slice(0, 10)}`
    : "—";

  // top activities
  const topActivities = Array.from(activityCount.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // duration per case in hours
  const durations: number[] = [];
  cases.forEach((c) => {
    if (c.length < 2) return;
    const sorted = [...c].sort((a, b) => a.timestamp.localeCompare(b.timestamp));
    const ms = new Date(sorted[sorted.length - 1].timestamp).getTime() - new Date(sorted[0].timestamp).getTime();
    durations.push(ms / 3600000);
  });
  durations.sort((a, b) => a - b);
  const min = durations[0] ?? 0;
  const max = durations[durations.length - 1] ?? 0;
  const avg = durations.reduce((a, b) => a + b, 0) / (durations.length || 1);
  const median = durations[Math.floor(durations.length / 2)] ?? 0;

  // histogram 10 bins
  const bins = 10;
  const span = (max - min) || 1;
  const histogram = Array.from({ length: bins }, (_, i) => {
    const lo = min + (span * i) / bins;
    const hi = min + (span * (i + 1)) / bins;
    return { bucket: fmtH((lo + hi) / 2), count: 0, lo, hi };
  });
  durations.forEach((d) => {
    let idx = Math.floor(((d - min) / span) * bins);
    if (idx >= bins) idx = bins - 1;
    if (idx < 0) idx = 0;
    histogram[idx].count++;
  });

  return {
    totalCases: cases.size,
    totalEvents: rows.length,
    uniqueActivities: totalActivities,
    dateRange,
    qualityScore,
    checks,
    topActivities,
    duration: { min, max, avg, median },
    histogram,
  };
}

function pct(n: number) {
  return `${(n * 100).toFixed(1)}%`;
}

function buildReport(s: Stats) {
  return `# Eldoreth Inspector Report

## Summary
- Total cases: ${s.totalCases}
- Total events: ${s.totalEvents}
- Unique activities: ${s.uniqueActivities}
- Date range: ${s.dateRange}
- Quality score: **${s.qualityScore}/100**

## Data quality
${s.checks.map((c) => `- [${c.pass ? "x" : " "}] **${c.name}** — ${c.detail}`).join("\n")}

## Top activities
${s.topActivities.map((a, i) => `${i + 1}. ${a.name} — ${a.count}`).join("\n")}

## Case duration
- min ${fmtH(s.duration.min)}
- median ${fmtH(s.duration.median)}
- avg ${fmtH(s.duration.avg)}
- max ${fmtH(s.duration.max)}

_Generated by Eldoreth Process Intelligence Suite_
`;
}
