import { createFileRoute } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/evaluation")({
  head: () => ({
    meta: [
      { title: "Matriz de Avaliação — NEXUS" },
      {
        name: "description",
        content:
          "Comparação de capacidades entre baseline determinística segura e orquestração assistida simulada.",
      },
      { property: "og:title", content: "Matriz de Avaliação — NEXUS" },
      {
        property: "og:description",
        content: "Matriz conceitual controlada, sem benchmark ou ganhos quantitativos medidos.",
      },
    ],
  }),
  component: Evaluation,
});

type Verdict =
  | "Equivalente em segurança"
  | "Orquestração agrega contexto"
  | "Revisão humana necessária"
  | "Não avaliado";

const rows: Array<{ dim: string; baseline: string; agent: string; verdict: Verdict }> = [
  {
    dim: "Regras objetivas (checklist, validade, formatos)",
    baseline: "Executa os gates determinísticos sobre os dados estruturados.",
    agent: "Executa os mesmos gates determinísticos sobre os mesmos dados.",
    verdict: "Equivalente em segurança",
  },
  {
    dim: "Recuperação de política, versão e vigência",
    baseline:
      "Consulta por chaves e precedências previamente configuradas; sem síntese contextual.",
    agent:
      "No desenho-alvo, recupera candidatos e produz síntese fundamentada; no MVP, a recuperação é controlada e sintética.",
    verdict: "Orquestração agrega contexto",
  },
  {
    dim: "Correção e revalidação",
    baseline: "Usa mapa determinístico de dependências para reexecutar apenas os gates afetados.",
    agent:
      "Explica quais dependências foram afetadas e recomenda o próximo passo, sem alterar o estado.",
    verdict: "Orquestração agrega contexto",
  },
  {
    dim: "Comunicação com o operador",
    baseline: "Usa mensagens padronizadas por reason code e política aplicável.",
    agent:
      "No desenho-alvo, redige comunicação contextual a partir da decisão consolidada e das fontes.",
    verdict: "Orquestração agrega contexto",
  },
  {
    dim: "Conflito entre políticas",
    baseline: "Detecta o conflito por regra e bloqueia o avanço, encaminhando para revisão humana.",
    agent: "Também se abstém e prepara uma síntese das políticas e evidências para o revisor.",
    verdict: "Revisão humana necessária",
  },
  {
    dim: "Grounding insuficiente ou baixa confiança",
    baseline: "Aplica fail closed e bloqueia a decisão automática.",
    agent: "Aplica o mesmo bloqueio e explica a ausência de evidência suficiente.",
    verdict: "Equivalente em segurança",
  },
  {
    dim: "Falha técnica (timeout ou indisponibilidade)",
    baseline: "Preserva o estado de negócio, separa a condição técnica e permite retry controlado.",
    agent: "Respeita os mesmos controles e contextualiza o impacto operacional da falha.",
    verdict: "Equivalente em segurança",
  },
  {
    dim: "Handoff para submissão",
    baseline: "A máquina de estados exige validação em sombra antes do N2.",
    agent: "Recomenda e explica o handoff, mas não executa a transição diretamente.",
    verdict: "Equivalente em segurança",
  },
  {
    dim: "Execução de modelo e RAG vetorial",
    baseline: "Não se aplica.",
    agent: "Não conectado no MVP; comportamento representado por simulação controlada.",
    verdict: "Não avaliado",
  },
  {
    dim: "Ganho quantitativo de negócio",
    baseline: "Não medido.",
    agent: "Não medido.",
    verdict: "Não avaliado",
  },
];

const verdictStyle: Record<Verdict, string> = {
  "Equivalente em segurança": "bg-muted text-muted-foreground border-border",
  "Orquestração agrega contexto": "bg-accent text-accent-foreground border-accent",
  "Revisão humana necessária": "bg-warning/15 text-warning-foreground border-warning/35",
  "Não avaliado": "bg-secondary text-secondary-foreground border-border",
};

function Evaluation() {
  return (
    <div className="mx-auto max-w-6xl px-8 py-10">
      <div className="mb-8">
        <div className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
          Matriz conceitual controlada
        </div>
        <h2 className="text-display mt-1 text-3xl text-foreground">
          Baseline determinística segura vs. orquestração assistida simulada
        </h2>
        <p className="mt-3 max-w-3xl text-sm text-muted-foreground">
          Ambas as abordagens recebem os mesmos dados, executam as mesmas regras objetivas e
          preservam os mesmos guardrails. O diferencial esperado da orquestração está na recuperação
          contextual, síntese e comunicação — não na propriedade exclusiva dos mecanismos de
          segurança. No MVP, esse comportamento é representado por simulação controlada: não há
          modelo de linguagem nem RAG vetorial conectado. Esta tela é uma matriz de capacidades, não
          um benchmark executado, e não declara ganhos estatísticos ou de negócio.
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="grid grid-cols-12 border-b border-border bg-muted/40 px-5 py-3 text-[11px] uppercase tracking-wider text-muted-foreground">
          <div className="col-span-3">Dimensão</div>
          <div className="col-span-4">Baseline determinística segura</div>
          <div className="col-span-4">Orquestração assistida simulada</div>
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
              <span
                className={cn(
                  "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium tracking-wide whitespace-nowrap",
                  verdictStyle[r.verdict],
                )}
              >
                {r.verdict}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
