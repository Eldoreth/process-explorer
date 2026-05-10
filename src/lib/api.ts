import { rowsToCsv, type EventRow } from "./generate-log";

export const API_BASE = "https://api.eldoreth.com/api/v1";

export function eventLogToCsvFile(rows: EventRow[], name = "log.csv"): File {
  const csv = rowsToCsv(rows);
  return new File([csv], name, { type: "text/csv" });
}

export async function postFile<T>(path: string, file: File): Promise<T> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch(`${API_BASE}${path}`, { method: "POST", body: fd });
  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = (await res.json()) as { detail?: unknown };
      if (body?.detail) detail = String(body.detail);
    } catch {
      // body wasn't JSON; keep statusText
    }
    throw new Error(`${res.status} · ${detail}`);
  }
  return (await res.json()) as T;
}

export type ProcessModel = {
  algorithm: string;
  num_activities: number;
  num_transitions: number;
  fitness_score: number;
};

export type Bottleneck = {
  activity: string;
  avg_wait_time_seconds: number;
  frequency: number;
  rework_rate: number;
};

export type InsightReport = {
  executive_summary: string;
  top_findings: string[];
  recommended_actions: string[];
  estimated_value: string;
};
