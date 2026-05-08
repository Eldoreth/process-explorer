import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { PROCESS_TEMPLATES } from "@/lib/process-templates";
import { generateEventLog, rowsToCsv } from "@/lib/generate-log";
import { useLog } from "@/lib/log-context";
import { Download, Sparkles, ArrowRight } from "lucide-react";

export function GeneratorSection() {
  const { log, setLog } = useLog();
  const [tplId, setTplId] = useState(PROCESS_TEMPLATES[0].id);
  const [cases, setCases] = useState(150);
  const [rework, setRework] = useState(10);
  const [skip, setSkip] = useState(5);
  const [delay, setDelay] = useState(12);
  const [variance, setVariance] = useState(15);

  const template = PROCESS_TEMPLATES.find((t) => t.id === tplId)!;

  const summary = useMemo(() => {
    if (!log) return null;
    const cases = new Set(log.map((r) => r.case_id));
    const variants = new Set<string>();
    const byCase = new Map<string, string[]>();
    log.forEach((r) => {
      const arr = byCase.get(r.case_id) ?? [];
      arr.push(r.activity);
      byCase.set(r.case_id, arr);
    });
    byCase.forEach((acts) => variants.add(acts.join("→")));
    return { events: log.length, cases: cases.size, variants: variants.size };
  }, [log]);

  function handleGenerate() {
    const rows = generateEventLog({
      template,
      cases,
      reworkRate: rework,
      skipRate: skip,
      avgDelayHours: delay,
      delayVariance: variance,
    });
    setLog(rows);
  }

  function handleDownload() {
    if (!log) return;
    const csv = rowsToCsv(log);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `eldoreth_${template.id}_${log.length}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-navy">Synthetic Event Log Generator</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Spin up a realistic process mining dataset in seconds. Tune the noise to mirror your demo
          narrative.
        </p>
      </div>

      <Card className="p-6 border-border/70 shadow-sm">
        <div className="space-y-5">
          <div>
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">
              Process template
            </Label>
            <Select value={tplId} onValueChange={setTplId}>
              <SelectTrigger className="mt-2 h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PROCESS_TEMPLATES.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="mt-3 flex flex-wrap items-center gap-x-1 gap-y-2 rounded-md bg-secondary/60 p-3">
              {template.activities.map((a, i) => (
                <span key={a} className="flex items-center text-xs">
                  <span className="rounded-md bg-white border border-border px-2 py-1 text-navy font-medium">
                    {a}
                  </span>
                  {i < template.activities.length - 1 && (
                    <ArrowRight className="h-3 w-3 mx-1 text-muted-foreground" />
                  )}
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <SliderRow label="Number of cases" min={50} max={500} step={10} value={cases} onChange={setCases} unit="" />
            <SliderRow label="Rework rate" min={0} max={40} step={1} value={rework} onChange={setRework} unit="%" />
            <SliderRow label="Skip rate" min={0} max={20} step={1} value={skip} onChange={setSkip} unit="%" />
            <SliderRow label="Avg delay" min={1} max={72} step={1} value={delay} onChange={setDelay} unit="h" />
            <SliderRow label="Delay variance" min={0} max={30} step={1} value={variance} onChange={setVariance} unit="%" />
          </div>

          <Button onClick={handleGenerate} size="lg" className="w-full md:w-auto bg-electric hover:bg-electric/90 text-white">
            <Sparkles className="h-4 w-4 mr-2" />
            Generate event log
          </Button>
        </div>
      </Card>

      {log && summary && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard label="Total events" value={summary.events.toLocaleString()} />
            <StatCard label="Unique cases" value={summary.cases.toLocaleString()} />
            <StatCard label="Variants" value={summary.variants.toLocaleString()} />
          </div>

          <Card className="overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-secondary/40">
              <div className="text-sm font-semibold text-navy">Preview · first 10 rows</div>
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Download CSV
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-secondary/30 text-muted-foreground">
                  <tr>
                    <th className="text-left font-medium px-4 py-2">case_id</th>
                    <th className="text-left font-medium px-4 py-2">activity</th>
                    <th className="text-left font-medium px-4 py-2">timestamp</th>
                    <th className="text-left font-medium px-4 py-2">resource</th>
                  </tr>
                </thead>
                <tbody>
                  {log.slice(0, 10).map((r, i) => (
                    <tr key={i} className="border-t border-border">
                      <td className="px-4 py-2 font-mono text-xs text-navy">{r.case_id}</td>
                      <td className="px-4 py-2">{r.activity}</td>
                      <td className="px-4 py-2 font-mono text-xs text-muted-foreground">
                        {r.timestamp}
                      </td>
                      <td className="px-4 py-2">{r.resource}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}

function SliderRow({
  label, min, max, step, value, onChange, unit,
}: {
  label: string; min: number; max: number; step: number;
  value: number; onChange: (v: number) => void; unit: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <Label className="text-xs uppercase tracking-wider text-muted-foreground">{label}</Label>
        <span className="text-sm font-mono font-semibold text-navy">
          {value}
          {unit}
        </span>
      </div>
      <Slider
        min={min}
        max={max}
        step={step}
        value={[value]}
        onValueChange={(v) => onChange(v[0])}
      />
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Card className="p-5">
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-2 text-3xl font-bold text-navy tabular-nums">{value}</div>
    </Card>
  );
}
