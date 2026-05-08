import { createContext, useContext, useState, ReactNode } from "react";
import type { EventRow } from "./generate-log";

type Section = "generator" | "inspector" | "insights" | "use-cases";

type Ctx = {
  log: EventRow[] | null;
  setLog: (rows: EventRow[] | null) => void;
  section: Section;
  setSection: (s: Section) => void;
};

const LogCtx = createContext<Ctx | null>(null);

export function LogProvider({ children }: { children: ReactNode }) {
  const [log, setLog] = useState<EventRow[] | null>(null);
  const [section, setSection] = useState<Section>("generator");
  return (
    <LogCtx.Provider value={{ log, setLog, section, setSection }}>
      {children}
    </LogCtx.Provider>
  );
}

export function useLog() {
  const c = useContext(LogCtx);
  if (!c) throw new Error("useLog must be inside LogProvider");
  return c;
}

export type { Section };
