import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { useNexus } from "@/lib/nexus-store";
import { getExecutionConfig } from "@/lib/execution-config";
import type { AuditEvent } from "@/lib/scenarios";

function displayActor(event: AuditEvent) {
  if (event.action === "Caso instanciado") return "Sistema";
  if (event.action.includes("Transição") || event.action === "Prontidão confirmada") {
    return "Máquina de estados";
  }
  if (event.action.includes("Recuperação de política")) return "Recuperação controlada";
  return event.actor;
}

export function AuditDrawer() {
  const { auditOpen, setAuditOpen, scenario } = useNexus();
  const execution = scenario
    ? getExecutionConfig(scenario.caseId, scenario.key)
    : null;

  return (
    <Sheet open={auditOpen} onOpenChange={setAuditOpen}>
      <SheetContent className="w-[520px] sm:max-w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Audit Timeline</SheetTitle>
          <SheetDescription>
            Trilha demonstrativa de eventos do caso {scenario?.caseId ?? "—"}.
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6 px-4 pb-8">
          {!scenario ? (
            <p className="text-sm text-muted-foreground">Nenhum caso ativo.</p>
          ) : (
            <div className="space-y-6">
              {execution && (
                <section className="rounded-lg border border-border bg-muted/25 p-4">
                  <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                    Configuração da execução
                  </div>
                  <dl className="mt-3 grid grid-cols-[130px_1fr] gap-x-3 gap-y-1.5 text-xs">
                    <dt className="text-muted-foreground">Run ID</dt>
                    <dd className="font-mono text-foreground">{execution.runId}</dd>
                    <dt className="text-muted-foreground">Modo</dt>
                    <dd className="text-foreground">{execution.mode}</dd>
                    <dt className="text-muted-foreground">Orquestração</dt>
                    <dd className="text-foreground">{execution.orchestration}</dd>
                    <dt className="text-muted-foreground">Recuperação</dt>
                    <dd className="text-foreground">{execution.retrieval}</dd>
                    <dt className="text-muted-foreground">Comunicação</dt>
                    <dd className="font-mono text-foreground">{execution.communication}</dd>
                    <dt className="text-muted-foreground">Ruleset</dt>
                    <dd className="font-mono text-foreground">{execution.ruleset}</dd>
                    <dt className="text-muted-foreground">Estados</dt>
                    <dd className="font-mono text-foreground">{execution.stateMachine}</dd>
                    <dt className="text-muted-foreground">Base</dt>
                    <dd className="text-foreground">{execution.knowledgeBase}</dd>
                    <dt className="text-muted-foreground">Modelo</dt>
                    <dd className="font-medium text-warning-foreground">{execution.model}</dd>
                    <dt className="text-muted-foreground">Dados</dt>
                    <dd className="text-foreground">{execution.dataClassification}</dd>
                  </dl>
                  <p className="mt-3 border-t border-border pt-3 text-[11px] leading-relaxed text-muted-foreground">
                    {execution.scopeNote}
                  </p>
                </section>
              )}

              <ol className="relative border-l border-border pl-5">
                {scenario.audit.map((e) => (
                  <li key={e.id} className="mb-5 last:mb-0">
                    <span className="absolute -left-[5px] mt-1.5 h-2.5 w-2.5 rounded-full bg-primary" />
                    <div className="flex items-baseline gap-2">
                      <span className="font-mono text-xs text-muted-foreground">{e.time}</span>
                      <span className="text-xs uppercase tracking-wide text-muted-foreground">
                        {displayActor(e)}
                      </span>
                    </div>
                    <div className="mt-1 text-sm font-medium text-foreground">{e.action}</div>
                    <div className="mt-1 space-y-0.5 text-xs text-muted-foreground">
                      {e.from && e.to && (
                        <div>
                          <span className="font-mono">{e.from}</span> → <span className="font-mono">{e.to}</span>
                        </div>
                      )}
                      {!e.from && e.to && <div>estado: <span className="font-mono">{e.to}</span></div>}
                      {e.rule && <div>regra: <span className="font-mono">{e.rule}</span></div>}
                      {e.finding && <div>finding: <span className="font-mono">{e.finding}</span></div>}
                      {e.version && <div>versão: <span className="font-mono">{e.version}</span></div>}
                      {e.justification && (
                        <div>justificativa: <span className="text-foreground">{e.justification}</span></div>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
