import { LogProvider, useLog } from "@/lib/log-context";
import { AppShell } from "@/components/app-shell";
import { GeneratorSection } from "@/components/sections/generator";
import { InspectorSection } from "@/components/sections/inspector";
import { InsightsSection } from "@/components/sections/insights";
import { UseCasesSection } from "@/components/sections/use-cases";

function SectionRouter() {
  const { section } = useLog();
  switch (section) {
    case "generator":
      return <GeneratorSection />;
    case "inspector":
      return <InspectorSection />;
    case "insights":
      return <InsightsSection />;
    case "use-cases":
      return <UseCasesSection />;
  }
}

export function Home() {
  return (
    <LogProvider>
      <AppShell>
        <SectionRouter />
      </AppShell>
    </LogProvider>
  );
}
