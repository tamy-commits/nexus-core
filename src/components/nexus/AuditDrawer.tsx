import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { useNexus } from "@/lib/nexus-store";

export function AuditDrawer() {
  const { auditOpen, setAuditOpen, scenario } = useNexus();
  return (
    <Sheet open={auditOpen} onOpenChange={setAuditOpen}>
      <SheetContent className="w-[440px] sm:max-w-[460px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Audit Timeline</SheetTitle>
          <SheetDescription>
            Trilha de eventos do caso {scenario?.caseId ?? "—"}.
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6 px-4 pb-8">
          {!scenario ? (
            <p className="text-sm text-muted-foreground">Nenhum caso ativo.</p>
          ) : (
            <ol className="relative border-l border-border pl-5">
              {scenario.audit.map((e) => (
                <li key={e.id} className="mb-5 last:mb-0">
                  <span className="absolute -left-[5px] mt-1.5 h-2.5 w-2.5 rounded-full bg-primary" />
                  <div className="flex items-baseline gap-2">
                    <span className="font-mono text-xs text-muted-foreground">{e.time}</span>
                    <span className="text-xs uppercase tracking-wide text-muted-foreground">
                      {e.actor}
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
                  </div>
                </li>
              ))}
            </ol>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
