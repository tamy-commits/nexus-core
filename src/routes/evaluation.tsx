import { createFileRoute } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/evaluation")({
  head: () => ({
    meta: [
      { title: "Evaluation Studio — NEXUS" },
      { name: "description", content: "Comparação controlada entre baseline determinística e orquestração assistida pelo agente." },
      { property: "og:title", content: "Evaluation Studio — NEXUS" },
      { property: "og:description", content: "Comparação lado a lado, sem declaração de vencedor." },
    ],
  }),
  component: Evaluation,
});

type Verdict = "Equivalente" | "Agente agrega contexto" | "Revisão humana necessária" | "Não avaliado";

const rows: Array<{ dim: string; baseline: string; agent: string; verdict: Verdict }> = [
  { dim: "Regras objetivas (checklist, validade, formatos)", baseline: "Determinística — executa os gates sobre os dados estruturados.", agent: "Determinística — executa os mesmos gates sobre os mesmos dados estruturados.", verdict: "Equivalente" },
  { dim: "Recuperação contextual (política, versão, vigência)", baseline: "Consulta por chave fixa; sem síntese.", agent: "Recupera política vigente e cita trechos aplicáveis por afirmação.", verdict: "Agente agrega contexto" },
  { dim: "Coordenação de etapas", baseline: "Sequência rígida; reexecuta tudo em caso de mudança.", agent: "Reexecuta apenas gates afetados por mudanças detectadas.", verdict: "Agente agrega contexto" },
  { dim: "Comunicação com o operador", baseline: "Mensagens padronizadas por reason code.", agent: "Explica finding referenciando cláusula e vigência da política.", verdict: "Agente agrega contexto" },
  { dim: "Conflito entre políticas", baseline: "Não trata — segue a primeira política recuperada.", agent: "Abstém-se e encaminha para revisão humana.", verdict: "Revisão humana necessária" },
  { dim: "Grounding insuficiente / baixa confiança", baseline: "Sem sinalização — decide de qualquer forma.", agent: "Bloqueia decisão automática e sinaliza ausência de evidência.", verdict: "Revisão humana necessária" },
  { dim: "Falha técnica (timeout, indisponibilidade)", baseline: "Sem estado técnico separado; risco de estado inconsistente.", agent: "Separa estado técnico do estado de negócio; nunca trata timeout como aprovação.", verdict: "Agente agrega contexto" },
  { dim: "Handoff para submissão", baseline: "Encaminha diretamente quando o checklist fecha.", agent: "Encaminha para validação em sombra (N1) antes da submissão.", verdict: "Revisão humana necessária" },
  { dim: "Ganho quantitativo de negócio", baseline: "—", agent: "—", verdict: "Não avaliado" },
];

const verdictStyle: Record<Verdict, string> = {
  Equivalente: "bg-muted text-muted-foreground border-border",
  "Agente agrega contexto": "bg-accent text-accent-foreground border-accent",
  "Revisão humana necessária": "bg-warning/15 text-warning-foreground border-warning/35",
  "Não avaliado": "bg-secondary text-secondary-foreground border-border",
};

function Evaluation() {
  return (
    <div className="mx-auto max-w-6xl px-8 py-10">
      <div className="mb-8">
        <div className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
          Comparação controlada
        </div>
        <h2 className="text-display mt-1 text-3xl text-foreground">
          Baseline determinística vs. orquestração assistida pelo agente
        </h2>
        <p className="mt-3 max-w-3xl text-sm text-muted-foreground">
          Ambas as abordagens executam as mesmas regras objetivas sobre os mesmos dados estruturados.
          O agente auxilia na recuperação contextual, síntese, comunicação e no tratamento de
          ambiguidades dentro de limites. Decisões críticas, conflitos e baixa confiança exigem
          revisão humana. Esta comparação não declara vencedor geral nem apresenta ganhos
          estatísticos ou de negócio não medidos.
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="grid grid-cols-12 border-b border-border bg-muted/40 px-5 py-3 text-[11px] uppercase tracking-wider text-muted-foreground">
          <div className="col-span-3">Dimensão</div>
          <div className="col-span-4">Baseline determinística</div>
          <div className="col-span-4">Orquestração assistida pelo agente</div>
          <div className="col-span-1 text-right">Leitura</div>
        </div>

        {rows.map((r, i) => (
          <div
            key={r.dim}
            className={cn(
              "grid grid-cols-12 items-start gap-3 px-5 py-4",
              i > 0 && "border-t border-border",
            )}
          >
            <div className="col-span-3 text-sm font-medium text-foreground">{r.dim}</div>
            <div className="col-span-4 text-sm text-foreground/80">{r.baseline}</div>
            <div className="col-span-4 text-sm text-foreground/80">{r.agent}</div>
            <div className="col-span-1 flex justify-end">
              <span className={cn(
                "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium tracking-wide whitespace-nowrap",
                verdictStyle[r.verdict],
              )}>
                {r.verdict}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
