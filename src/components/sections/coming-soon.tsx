import { Card } from "@/components/ui/card";
import { Sparkles, Lightbulb } from "lucide-react";

function ComingSoon({
  title, description, Icon,
}: { title: string; description: string; Icon: React.ComponentType<{ className?: string }> }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-navy">{title}</h2>
      </div>
      <Card className="relative p-12 text-center overflow-hidden border-dashed">
        <div className="absolute inset-0 bg-gradient-to-br from-electric/5 via-transparent to-transparent pointer-events-none" />
        <div className="relative flex flex-col items-center gap-4">
          <div className="h-16 w-16 rounded-2xl bg-electric/10 flex items-center justify-center">
            <Icon className="h-8 w-8 text-electric" />
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-navy text-white text-[10px] uppercase tracking-wider px-3 py-1 font-semibold">
            Coming soon
          </span>
          <p className="max-w-md text-muted-foreground">{description}</p>
        </div>
      </Card>
    </div>
  );
}

export function InsightsSection() {
  return (
    <ComingSoon
      title="Executive Insights"
      description="Upload an event log or use the Generator to get AI-powered executive insights — bottlenecks, root causes, and savings opportunities translated into board-ready language."
      Icon={Sparkles}
    />
  );
}

export function UseCasesSection() {
  return (
    <ComingSoon
      title="AI Use Case Discovery"
      description="Describe your process to discover AI use cases ranked by ICE score (Impact · Confidence · Ease). Perfect for shaping presales conversations."
      Icon={Lightbulb}
    />
  );
}
