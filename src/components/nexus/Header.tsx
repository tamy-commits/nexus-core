import { useRouterState } from "@tanstack/react-router";
import { ScrollText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNexus } from "@/lib/nexus-store";
import { STATE_LABEL, TECH_LABEL } from "@/lib/scenarios";
import { StateBadge, TechBadge } from "./Badges";

const titleMap: Record<string, string> = {
  "/": "Central de Prontidão Documental",
  "/lab": "Scenario Lab",
  "/workspace": "Case Workspace",
  "/evaluation": "Evaluation Studio",
};

export function NexusHeader() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { scenario, setAuditOpen, executionMode, lastRunId, analysisInFlight } = useNexus();
  const title = titleMap[pathname] ?? "NEXUS";
  const showCase = pathname.startsWith("/workspace") && !!scenario;

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-card px-6">
      <div className="flex min-w-0 items-center gap-4">
        <h1 className="truncate text-[15px] font-semibold text-foreground">{title}</h1>
        {showCase && scenario && (
          <>
            <span className="h-4 w-px bg-border" />
            <span className="truncate font-mono text-xs text-muted-foreground">{scenario.caseId}</span>
            <StateBadge state={scenario.currentState} label={STATE_LABEL[scenario.currentState]} />
            <TechBadge tech={scenario.tech} label={TECH_LABEL[scenario.tech]} />
            <span className="hidden rounded-full border border-border bg-muted/40 px-2 py-0.5 font-mono text-[10px] font-medium text-muted-foreground xl:inline-flex">
              {analysisInFlight ? "PROCESSANDO" : executionMode}{lastRunId ? ` · ${lastRunId}` : ""}
            </span>
          </>
        )}
      </div>
      <Button variant="outline" size="sm" onClick={() => setAuditOpen(true)} disabled={!scenario} className="gap-2">
        <ScrollText className="h-3.5 w-3.5" />
        Ver auditoria
      </Button>
    </header>
  );
}
