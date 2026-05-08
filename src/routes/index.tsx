import { createFileRoute } from "@tanstack/react-router";
import { LogProvider, useLog } from "@/lib/log-context";
import { AppShell } from "@/components/app-shell";
import { GeneratorSection } from "@/components/sections/generator";
import { InspectorSection } from "@/components/sections/inspector";
import { InsightsSection, UseCasesSection } from "@/components/sections/coming-soon";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Eldoreth · Process Intelligence Suite" },
      {
        name: "description",
        content:
          "Generate, inspect, and explore process mining event logs. Built for presales demos and process intelligence teams.",
      },
      { property: "og:title", content: "Eldoreth · Process Intelligence Suite" },
      {
        property: "og:description",
        content: "Unified tool for process mining demos and presales.",
      },
    ],
  }),
  component: Index,
});

function SectionRouter() {
  const { section } = useLog();
  switch (section) {
    case "generator": return <GeneratorSection />;
    case "inspector": return <InspectorSection />;
    case "insights": return <InsightsSection />;
    case "use-cases": return <UseCasesSection />;
  }
}

function Index() {
  return (
    <LogProvider>
      <AppShell>
        <SectionRouter />
      </AppShell>
    </LogProvider>
  );
}
