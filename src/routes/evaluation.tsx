import { createFileRoute } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/evaluation")({
  head: () => ({
    meta: [
      { title: "Evaluation Studio — NEXUS" },
      { name: "description", content: "Comparação entre baseline baseada em regras e fluxo agentivo controlado." },
      { property: "og:title", content: "Evaluation Studio — NEXUS" },
      { property: "og:description", content: "Comparação lado a lado, sem declaração de vencedor." },
    ],
  }),
  component: Evaluation,
});

type Verdict = "Empate" | "Agente agregou contexto" | "Baseline suficiente" | "Revisão necessária" | "Inconclusivo";

const rows: Array<{ dim: string; baseline: string; agent: string; verdict: Verdict }> = [
  { dim: "Tratamento do contexto", baseline: "Aplica regras uniformes ao caso.", agent: "Incorpora segmento, canal e origem na leitura.", verdict: "Agente agregou contexto" },
  { dim: "Checklist", baseline: "Checagem determinística por item.", agent: "Reexecuta apenas controles afetados por mudanças.", verdict: "Empate" },
  { dim: "Coordenação", baseline: "Etapas sequenciais rígidas.", agent: "Ordena etapas conforme dependências detectadas.", verdict: "Agente agregou contexto" },
  { dim: "Comunicação", baseline: "Mensagens padronizadas por reason code.", agent: "Explica finding com citação de política vigente.", verdict: "Agente agregou contexto" },
  { dim: "Abstenção", baseline: "Sem mecanismo de abstenção; decide sempre.", agent: "Abstém-se sob conflito ou grounding insuficiente.", verdict: "Revisão necessária" },
  { dim: "Necessidade humana", baseline: "Escalonamento por SLA excedido.", agent: "Escalonamento por critério de arbitragem.", verdict: "Empate" },
  { dim: "Resultado", baseline: "Encaminha para submissão quando checklist fecha.", agent: "Encaminha para validação em sombra antes da submissão.", verdict: "Baseline suficiente" },
  { dim: "Limitação", baseline: "Não trata conflitos entre políticas.", agent: "Depende de política recuperável e íntegra.", verdict: "Inconclusivo" },
];

const verdictStyle: Record<Verdict, string> = {
  Empate: "bg-muted text-muted-foreground border-border",
  "Agente agregou contexto": "bg-accent text-accent-foreground border-accent",
  "Baseline suficiente": "bg-info/12 text-info border-info/25",
  "Revisão necessária": "bg-warning/15 text-warning-foreground border-warning/35",
  Inconclusivo: "bg-secondary text-secondary-foreground border-border",
};

function Evaluation() {
  return (
    <div className="mx-auto max-w-6xl px-8 py-10">
      <div className="mb-8">
        <div className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
          Comparação controlada
        </div>
        <h2 className="text-display mt-1 text-3xl text-foreground">
          Baseline vs. fluxo agentivo
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Comparação lado a lado sobre dimensões operacionais. Esta versão não
          declara vencedor — apresenta observações qualificadas por badge.
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="grid grid-cols-12 border-b border-border bg-muted/40 px-5 py-3 text-[11px] uppercase tracking-wider text-muted-foreground">
          <div className="col-span-3">Dimensão</div>
          <div className="col-span-4">Baseline baseada em regras</div>
          <div className="col-span-4">Fluxo agentivo controlado</div>
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
