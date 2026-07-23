import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useNexus } from "@/lib/nexus-store";
import { toast } from "sonner";
import { PolicyBadge } from "./Badges";

export function HumanReviewDrawer() {
  const { reviewOpen, setReviewOpen, scenario } = useNexus();
  const [decision, setDecision] = useState<string>("");
  const [justification, setJustification] = useState("");
  const [adjudicated, setAdjudicated] = useState<string | null>(null);

  const submit = () => {
    if (!decision) return;
    setAdjudicated(`${decision} — registrado localmente`);
    toast.success("Decisão de revisão registrada (simulação local).");
  };

  return (
    <Sheet open={reviewOpen} onOpenChange={setReviewOpen}>
      <SheetContent className="w-[520px] sm:max-w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Human Review</SheetTitle>
          <SheetDescription>
            Adjudicação humana sobre o caso {scenario?.caseId ?? "—"}.
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6 space-y-6 px-4 pb-10">
          {!scenario ? (
            <p className="text-sm text-muted-foreground">Nenhum caso ativo.</p>
          ) : (
            <>
              <section>
                <h4 className="text-xs uppercase tracking-wide text-muted-foreground">Motivo</h4>
                <p className="mt-1 text-sm text-foreground">
                  {scenario.humanReview?.reason ?? "Revisão preparada para este caso."}
                </p>
              </section>

              <section>
                <h4 className="text-xs uppercase tracking-wide text-muted-foreground">Recomendação do agente</h4>
                <p className="mt-1 text-sm text-foreground">
                  {scenario.humanReview?.recommendation ?? scenario.recommendation}
                </p>
              </section>

              <section>
                <h4 className="text-xs uppercase tracking-wide text-muted-foreground">Políticas e evidências</h4>
                <ul className="mt-2 space-y-2">
                  {scenario.policies.map((p) => (
                    <li key={p.code} className="rounded-md border border-border bg-card p-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-xs">{p.code} · v{p.version}</span>
                        <PolicyBadge badge={p.badge} />
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">{p.title}</p>
                    </li>
                  ))}
                </ul>
              </section>

              <section>
                <h4 className="text-xs uppercase tracking-wide text-muted-foreground">Findings</h4>
                {scenario.findings.length === 0 ? (
                  <p className="mt-1 text-sm text-muted-foreground">Sem findings ativos.</p>
                ) : (
                  <ul className="mt-1 list-disc pl-5 text-sm text-foreground">
                    {scenario.findings.map((f, i) => (
                      <li key={i}>{f}</li>
                    ))}
                  </ul>
                )}
              </section>

              <section className="space-y-3 rounded-md border border-border bg-card p-4">
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">Decisão</Label>
                <RadioGroup value={decision} onValueChange={setDecision}>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="Aprovar exceção" id="d1" />
                    <Label htmlFor="d1" className="text-sm font-normal">Aprovar exceção justificada</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="Adotar exigência mais restritiva" id="d2" />
                    <Label htmlFor="d2" className="text-sm font-normal">Adotar exigência mais restritiva</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="Encaminhar para instância superior" id="d3" />
                    <Label htmlFor="d3" className="text-sm font-normal">Encaminhar para instância superior</Label>
                  </div>
                </RadioGroup>

                <div>
                  <Label htmlFor="just" className="text-xs uppercase tracking-wide text-muted-foreground">
                    Justificativa
                  </Label>
                  <Textarea
                    id="just"
                    value={justification}
                    onChange={(e) => setJustification(e.target.value)}
                    placeholder="Registre a fundamentação da decisão."
                    className="mt-1 min-h-20 text-sm"
                  />
                </div>

                <Button onClick={submit} disabled={!decision} size="sm">
                  Registrar decisão
                </Button>
              </section>

              <section>
                <h4 className="text-xs uppercase tracking-wide text-muted-foreground">Decisão adjudicada</h4>
                <div className="mt-1 min-h-10 rounded-md border border-dashed border-border bg-muted/40 p-3 text-sm text-foreground">
                  {adjudicated ?? <span className="text-muted-foreground">Aguardando registro.</span>}
                </div>
              </section>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
