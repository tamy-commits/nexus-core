import { useRouterState } from "@tanstack/react-router";
import { ScrollText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNexus } from "@/lib/nexus-store";
import { STATE_LABEL, TECH_LABEL } from "@/lib/scenarios";
import { StateBadge, TechBadge } from "./Badges";

const titleMap: Record<string, string> = {
  "/": "Scenario Lab",
  "/workspace": "Case Workspace",
  "/evaluation": "Evaluation Studio",
};

export function NexusHeader() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { scenario, setAuditOpen } = useNexus();
  const title = titleMap[pathname] ?? "NEXUS";

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-card px-6">
      <div className="flex items-center gap-4 min-w-0">
        <h1 className="text-[15px] font-semibold text-foreground truncate">{title}</h1>
        {scenario && (
          <>
            <span className="h-4 w-px bg-border" />
            <span className="font-mono text-xs text-muted-foreground truncate">
              {scenario.caseId}
            </span>
            <StateBadge state={scenario.initialState} label={STATE_LABEL[scenario.initialState]} />
            <TechBadge tech={scenario.tech} label={TECH_LABEL[scenario.tech]} />
          </>
        )}
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setAuditOpen(true)}
        disabled={!scenario}
        className="gap-2"
      >
        <ScrollText className="h-3.5 w-3.5" />
        Ver auditoria
      </Button>
    </header>
  );
}
