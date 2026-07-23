import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, FileText, ShieldAlert, UserCog, ArrowRight, Sparkles } from "lucide-react";
import { useNexus } from "@/lib/nexus-store";
import { STEPS, STATE_LABEL } from "@/lib/scenarios";
import { Button } from "@/components/ui/button";
import { DocStatusBadge, PolicyBadge, NeutralBadge } from "@/components/nexus/Badges";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/workspace")({
  head: () => ({
    meta: [
      { title: "Case Workspace — NEXUS" },
      { name: "description", content: "Área de trabalho de caso de prontidão documental." },
      { property: "og:title", content: "Case Workspace — NEXUS" },
      { property: "og:description", content: "Contexto, política, documentos e trilha de decisão em um só lugar." },
    ],
  }),
  component: Workspace,
});

function Workspace() {
  const { scenario, currentStepIndex, simulateDocResend, setReviewOpen } = useNexus();

  if (!scenario) {
    return (
      <div className="mx-auto max-w-xl px-8 py-24 text-center">
        <div className="text-display text-2xl text-foreground">Nenhum caso ativo</div>
        <p className="mt-2 text-sm text-muted-foreground">
          Selecione um cenário no Scenario Lab para instanciar um caso.
        </p>
        <Button asChild className="mt-6" size="sm">
          <Link to="/">Ir para o Scenario Lab</Link>
        </Button>
      </div>
    );
  }

  const showReview = scenario.key === "B" || scenario.key === "D";

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-6">
      {/* Progress */}
      <div className="mb-6 rounded-xl border border-border bg-card px-6 py-5">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
              {scenario.client}
            </div>
            <h2 className="text-lg font-semibold text-foreground">
              {scenario.requestType}
            </h2>
          </div>
          <div className="text-right text-xs text-muted-foreground">
            <div>Segmento <span className="text-foreground font-medium">{scenario.segment}</span> · Canal <span className="text-foreground font-medium">{scenario.channel}</span></div>
            <div className="font-mono mt-0.5">{scenario.caseId}</div>
          </div>
        </div>

        <ol className="flex items-center gap-1 overflow-x-auto">
          {STEPS.map((step, i) => {
            const done = i < currentStepIndex;
            const current = i === currentStepIndex;
            return (
              <li key={step} className="flex flex-1 items-center gap-2 min-w-0">
                <div className={cn(
                  "grid h-6 w-6 shrink-0 place-items-center rounded-full text-[11px] font-semibold transition-colors",
                  done && "bg-success text-success-foreground",
                  current && "bg-primary text-primary-foreground ring-4 ring-primary/15",
                  !done && !current && "bg-muted text-muted-foreground",
                )}>
                  {done ? <Check className="h-3 w-3" /> : i + 1}
                </div>
                <span className={cn(
                  "text-xs truncate transition-colors",
                  current ? "font-semibold text-foreground" : "text-muted-foreground",
                )}>
                  {step}
                </span>
                {i < STEPS.length - 1 && (
                  <div className={cn(
                    "h-px flex-1 transition-colors",
                    done ? "bg-success/50" : "bg-border",
                  )} />
                )}
              </li>
            );
          })}
        </ol>
      </div>

      {/* Three columns */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        {/* Column 1 — Context + Policy */}
        <div className="space-y-4 lg:col-span-4">
          <section className="rounded-xl border border-border bg-card p-5">
            <h3 className="text-[11px] uppercase tracking-wider text-muted-foreground">Contexto</h3>
            <dl className="mt-3 space-y-2 text-sm">
              <Row label="Empresa" value={scenario.client} />
              <Row label="Segmento" value={scenario.segment} />
              <Row label="Canal" value={scenario.channel} />
              <Row label="Tipo" value={scenario.requestType} />
              <Row label="Origem" value={scenario.origin} />
              <Row label="Case ID" value={scenario.caseId} mono />
            </dl>
          </section>

          <section className="rounded-xl border border-border bg-card p-5">
            <h3 className="text-[11px] uppercase tracking-wider text-muted-foreground">
              Política recuperada
            </h3>
            <div className="mt-3 space-y-4">
              {scenario.policies.map((p) => (
                <div key={p.code} className="rounded-lg border border-border bg-background/60 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-mono text-xs text-muted-foreground">{p.code} · v{p.version}</div>
                      <div className="mt-0.5 text-sm font-medium text-foreground">{p.title}</div>
                      <div className="mt-0.5 text-xs text-muted-foreground">Vigência {p.validity}</div>
                    </div>
                    <PolicyBadge badge={p.badge} />
                  </div>
                  <ul className="mt-3 space-y-1.5">
                    {p.excerpts.map((e, i) => (
                      <li key={i} className="border-l-2 border-primary/30 pl-3 text-xs italic text-foreground/75">
                        {e}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              <Button variant="ghost" size="sm" className="w-full justify-between">
                Ver evidências
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </section>
        </div>

        {/* Column 2 — Documents */}
        <div className="lg:col-span-5">
          <section className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-[11px] uppercase tracking-wider text-muted-foreground">
                  Document Readiness
                </h3>
                <p className="mt-0.5 text-sm text-foreground">
                  Checklist obrigatório para {scenario.requestType.toLowerCase()}.
                </p>
              </div>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </div>

            <ul className="mt-4 divide-y divide-border">
              {scenario.documents.map((d) => (
                <li
                  key={d.id}
                  className={cn(
                    "py-3.5 transition-colors",
                    d.highlight && "highlight-flash rounded-md -mx-2 px-2",
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground">{d.label}</span>
                        <DocStatusBadge status={d.status} />
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                        <span className="font-mono truncate">{d.file}</span>
                        <span>v{d.version}</span>
                        {d.validity && <span>Validade {d.validity}</span>}
                      </div>
                      {d.finding && (
                        <div className="mt-2 rounded-md border border-warning/30 bg-warning/8 px-3 py-2 text-xs">
                          <div className="text-warning-foreground font-medium">{d.finding}</div>
                          <div className="mt-0.5 text-muted-foreground">
                            {d.reasonCode && <><span className="font-mono">{d.reasonCode}</span> · </>}
                            {d.rule && <>Regra <span className="font-mono">{d.rule}</span></>}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  {d.action && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-3 gap-1.5"
                      onClick={simulateDocResend}
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      {d.action}
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* Column 3 — Decision Trace */}
        <div className="space-y-4 lg:col-span-3">
          <section className="rounded-xl border border-border bg-card p-5">
            <h3 className="text-[11px] uppercase tracking-wider text-muted-foreground">
              Decision Trace
            </h3>

            <dl className="mt-3 space-y-2 text-xs">
              <Row label="Estado atual" value={STATE_LABEL[scenario.initialState]} />
              <Row label="Condição técnica" value={scenario.tech} mono />
              <Row label="Próximo estado" value={STATE_LABEL[scenario.nextState]} />
            </dl>

            <div className="mt-4">
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Findings ativos</div>
              {scenario.findings.length === 0 ? (
                <div className="mt-1 text-xs text-muted-foreground">Nenhum finding ativo.</div>
              ) : (
                <ul className="mt-1 space-y-1">
                  {scenario.findings.map((f, i) => (
                    <li key={i} className="text-xs text-foreground">• {f}</li>
                  ))}
                </ul>
              )}
            </div>

            <div className="mt-4">
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Regras executadas</div>
              <div className="mt-1.5 flex flex-wrap gap-1">
                {scenario.rulesExecuted.map((r) => (
                  <NeutralBadge key={r}>{r}</NeutralBadge>
                ))}
              </div>
            </div>

            <div className="mt-5 space-y-3">
              <div className="rounded-md border border-info/25 bg-info/5 p-3">
                <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-info">
                  <Sparkles className="h-3 w-3" /> Recomendação do agente
                </div>
                <p className="mt-1 text-xs text-foreground">{scenario.recommendation}</p>
              </div>

              <div className="rounded-md border border-primary/30 bg-primary/5 p-3">
                <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-primary">
                  <ShieldAlert className="h-3 w-3" /> Decisão autorizada
                </div>
                <p className="mt-1 text-xs text-foreground">{scenario.authorizedAction}</p>
              </div>
            </div>

            <div className="mt-4 rounded-md border border-border bg-muted/30 p-3">
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Grounding</div>
              <p className="mt-1 text-xs text-foreground">{scenario.grounding}</p>
            </div>

            <Button variant="ghost" size="sm" className="mt-4 w-full justify-between">
              Abrir trilha completa
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </section>

          {showReview && (
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={() => setReviewOpen(true)}
            >
              <UserCog className="h-4 w-4" />
              Abrir revisão humana
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-xs text-muted-foreground shrink-0">{label}</dt>
      <dd className={cn("text-right text-sm text-foreground truncate", mono && "font-mono text-xs")}>
        {value}
      </dd>
    </div>
  );
}
