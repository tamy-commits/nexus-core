import { useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useNexus } from "@/lib/nexus-store";
import { toast } from "sonner";
import { PolicyBadge } from "./Badges";

export function HumanReviewDrawer() {
  const { reviewOpen, setReviewOpen, scenario, submitHumanReview, humanReviewRecord } = useNexus();
  const [decision, setDecision] = useState<string>("");
  const [justification, setJustification] = useState("");
  const [actor, setActor] = useState("");

  useEffect(() => {
    if (!reviewOpen) return;
    setDecision("");
    setJustification("");
    setActor("");
  }, [reviewOpen, scenario?.caseId]);

  const canSubmit = !!decision && justification.trim().length > 0 && actor.trim().length > 0;

  const submit = () => {
    if (!canSubmit) return;
    submitHumanReview({ decision, justification, actor });
    toast.success("Decisão de revisão registrada na trilha de auditoria.");
  };

  const options =
    scenario?.key === "B"
      ? [
          "Aplicar POL-DOC-PJ-02 com exceção justificada",
          "Aplicar POL-KYC-PJ-04 (exigência reforçada)",
          "Encaminhar para instância superior",
        ]
      : [
          "Ratificar encaminhamento para validação em sombra",
          "Solicitar ajuste antes do handoff",
          "Encaminhar para instância superior",
        ];

  return (
    <Sheet open={reviewOpen} onOpenChange={setReviewOpen}>
      <SheetContent className="w-[540px] sm:max-w-[560px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Revisão humana</SheetTitle>
          <SheetDescription>
            Adjudicação obrigatória sobre o caso {scenario?.caseId ?? "—"}.
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
                <h4 className="text-xs uppercase tracking-wide text-muted-foreground">
                  Recomendação do agente
                </h4>
                <p className="mt-1 text-sm text-foreground">
                  {scenario.humanReview?.recommendation ?? scenario.recommendation}
                </p>
              </section>

              <section>
                <h4 className="text-xs uppercase tracking-wide text-muted-foreground">
                  Políticas envolvidas
                </h4>
                <ul className="mt-2 space-y-2">
                  {scenario.policies.map((p) => (
                    <li key={p.code} className="rounded-md border border-border bg-card p-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-xs">
                          {p.code} · v{p.version}
                        </span>
                        <PolicyBadge badge={p.badge} />
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">{p.title}</p>
                    </li>
                  ))}
                </ul>
              </section>

              <section className="space-y-4 rounded-md border border-border bg-card p-4">
                <div>
                  <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                    Decisão
                  </Label>
                  <RadioGroup
                    value={decision}
                    onValueChange={setDecision}
                    className="mt-2 space-y-1.5"
                  >
                    {options.map((opt, i) => (
                      <div key={opt} className="flex items-center gap-2">
                        <RadioGroupItem value={opt} id={`d${i}`} />
                        <Label htmlFor={`d${i}`} className="text-sm font-normal">
                          {opt}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                <div>
                  <Label
                    htmlFor="actor"
                    className="text-xs uppercase tracking-wide text-muted-foreground"
                  >
                    Responsável / papel <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="actor"
                    value={actor}
                    onChange={(e) => setActor(e.target.value)}
                    placeholder="Ex.: Ana Souza — Analista PJ Sênior"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label
                    htmlFor="just"
                    className="text-xs uppercase tracking-wide text-muted-foreground"
                  >
                    Justificativa <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="just"
                    value={justification}
                    onChange={(e) => setJustification(e.target.value)}
                    placeholder="Registre a fundamentação da decisão. Campo obrigatório."
                    className="mt-1 min-h-24 text-sm"
                  />
                  {!justification.trim() && (
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      A justificativa é obrigatória para registrar a decisão.
                    </p>
                  )}
                </div>

                <Button onClick={submit} disabled={!canSubmit} size="sm">
                  Registrar decisão
                </Button>
              </section>

              <section>
                <h4 className="text-xs uppercase tracking-wide text-muted-foreground">
                  Decisão adjudicada
                </h4>
                <div className="mt-1 min-h-10 rounded-md border border-dashed border-border bg-muted/40 p-3 text-sm text-foreground">
                  {humanReviewRecord ? (
                    <div className="space-y-1">
                      <div>
                        <span className="text-muted-foreground text-xs">Decisão:</span>{" "}
                        {humanReviewRecord.decision}
                      </div>
                      <div>
                        <span className="text-muted-foreground text-xs">Responsável:</span>{" "}
                        {humanReviewRecord.actor}
                      </div>
                      <div>
                        <span className="text-muted-foreground text-xs">Registrada às</span>{" "}
                        <span className="font-mono">{humanReviewRecord.time}</span>
                      </div>
                      <div className="mt-1 text-xs italic text-foreground/80">
                        "{humanReviewRecord.justification}"
                      </div>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">Aguardando registro.</span>
                  )}
                </div>
              </section>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
