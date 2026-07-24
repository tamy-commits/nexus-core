import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { useNexus } from "@/lib/nexus-store";

export function EvidenceDrawer() {
  const { evidenceOpen, setEvidenceOpen, scenario } = useNexus();
  return (
    <Sheet open={evidenceOpen} onOpenChange={setEvidenceOpen}>
      <SheetContent className="w-[520px] sm:max-w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Evidências</SheetTitle>
          <SheetDescription>
            Fundamentação por afirmação — {scenario?.caseId ?? "—"}.
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6 space-y-4 px-4 pb-10">
          {!scenario ? (
            <p className="text-sm text-muted-foreground">Nenhum caso ativo.</p>
          ) : scenario.groundingStatus === "insuficiente" ? (
            <div className="rounded-md border border-warning/35 bg-warning/10 p-4 text-sm text-warning-foreground">
              Sem evidência suficiente — decisão automática bloqueada.
            </div>
          ) : scenario.evidences.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sem evidências registradas.</p>
          ) : (
            scenario.evidences.map((e) => (
              <article key={e.id} className="rounded-lg border border-border bg-card p-4">
                <div className="text-sm font-medium text-foreground">{e.claim}</div>
                <dl className="mt-3 grid grid-cols-3 gap-y-1.5 text-xs">
                  {e.finding && (
                    <>
                      <dt className="text-muted-foreground">Finding</dt>
                      <dd className="col-span-2 font-mono text-foreground">{e.finding}</dd>
                    </>
                  )}
                  {e.rule && (
                    <>
                      <dt className="text-muted-foreground">Regra</dt>
                      <dd className="col-span-2 font-mono text-foreground">{e.rule}</dd>
                    </>
                  )}
                  <dt className="text-muted-foreground">Política</dt>
                  <dd className="col-span-2 font-mono text-foreground">
                    {e.policyCode} · v{e.policyVersion}
                  </dd>
                  <dt className="text-muted-foreground">Vigência</dt>
                  <dd className="col-span-2 text-foreground">{e.policyValidity}</dd>
                  <dt className="text-muted-foreground">Registrado</dt>
                  <dd className="col-span-2 font-mono text-foreground">{e.timestamp}</dd>
                </dl>
                <blockquote className="mt-3 border-l-2 border-primary/40 pl-3 text-xs italic text-foreground/80">
                  {e.excerpt}
                </blockquote>
              </article>
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
