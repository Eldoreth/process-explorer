import { ProcessTemplate } from "./process-templates";

export type EventRow = {
  case_id: string;
  activity: string;
  timestamp: string; // ISO
  resource: string;
};

export type GenerateParams = {
  template: ProcessTemplate;
  cases: number;
  reworkRate: number; // 0-40 %
  skipRate: number; // 0-20 %
  avgDelayHours: number; // 1-72
  delayVariance: number; // 0-30 %
  seed?: number;
};

// simple deterministic PRNG
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function generateEventLog(p: GenerateParams): EventRow[] {
  const rng = mulberry32(p.seed ?? Date.now() & 0xffff);
  const rows: EventRow[] = [];
  const start = new Date();
  start.setDate(start.getDate() - 60);

  for (let c = 1; c <= p.cases; c++) {
    const caseId = `C-${String(c).padStart(5, "0")}`;
    let cursor = new Date(
      start.getTime() + rng() * 60 * 24 * 60 * 60 * 1000,
    );

    for (let i = 0; i < p.template.activities.length; i++) {
      const activity = p.template.activities[i];
      // skip
      if (i > 0 && i < p.template.activities.length - 1 && rng() * 100 < p.skipRate) {
        continue;
      }
      const resource =
        p.template.resources[Math.floor(rng() * p.template.resources.length)];
      rows.push({
        case_id: caseId,
        activity,
        timestamp: cursor.toISOString(),
        resource,
      });
      // rework: repeat current activity
      if (rng() * 100 < p.reworkRate && i > 0) {
        const variance = (rng() * 2 - 1) * (p.delayVariance / 100);
        const delay = p.avgDelayHours * (1 + variance) * 0.5;
        cursor = new Date(cursor.getTime() + delay * 3600 * 1000);
        rows.push({
          case_id: caseId,
          activity,
          timestamp: cursor.toISOString(),
          resource,
        });
      }
      const variance = (rng() * 2 - 1) * (p.delayVariance / 100);
      const delay = p.avgDelayHours * (1 + variance);
      cursor = new Date(cursor.getTime() + delay * 3600 * 1000);
    }
  }
  rows.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
  return rows;
}

export function rowsToCsv(rows: EventRow[]): string {
  const header = "case_id,activity,timestamp,resource";
  const body = rows
    .map(
      (r) =>
        `${r.case_id},"${r.activity.replace(/"/g, '""')}",${r.timestamp},${r.resource}`,
    )
    .join("\n");
  return header + "\n" + body;
}

export function parseCsv(text: string): EventRow[] {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  const header = lines[0].split(",").map((h) => h.trim().toLowerCase());
  const idx = (n: string) => header.indexOf(n);
  const ci = idx("case_id");
  const ai = idx("activity");
  const ti = idx("timestamp");
  const ri = idx("resource");
  const out: EventRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = splitCsvLine(lines[i]);
    if (cols.length < 3) continue;
    out.push({
      case_id: cols[ci] ?? "",
      activity: (cols[ai] ?? "").replace(/^"|"$/g, ""),
      timestamp: cols[ti] ?? "",
      resource: ri >= 0 ? (cols[ri] ?? "") : "",
    });
  }
  return out;
}

function splitCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQ = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQ && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQ = !inQ;
      }
    } else if (ch === "," && !inQ) {
      out.push(cur);
      cur = "";
    } else {
      cur += ch;
    }
  }
  out.push(cur);
  return out;
}
