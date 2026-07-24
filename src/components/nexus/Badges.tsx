import { cn } from "@/lib/utils";
import type { ProcessState, TechCondition, DocStatus } from "@/lib/scenarios";

const stateStyles: Record<ProcessState, string> = {
  CRIADA: "bg-muted text-muted-foreground border-border",
  EM_PREPARACAO: "bg-warning/15 text-warning-foreground border-warning/30",
  AGUARDANDO_CORRECAO: "bg-warning/15 text-warning-foreground border-warning/35",
  EM_REVISAO_HUMANA: "bg-info/15 text-info border-info/30",
  PRONTA_PARA_SUBMISSAO: "bg-success/15 text-success border-success/30",
  EM_VALIDACAO_SOMBRA: "bg-accent text-accent-foreground border-accent",
  ENCAMINHADA_AO_N2: "bg-info/15 text-info border-info/30",
  ENCAMINHADA_TRATAMENTO_ESPECIALIZADO: "bg-info/15 text-info border-info/30",
  CANCELADA: "bg-muted text-muted-foreground border-border",
};

const techStyles: Record<TechCondition, string> = {
  NORMAL: "bg-muted text-muted-foreground border-border",
  AGUARDANDO_RETRY: "bg-warning/15 text-warning-foreground border-warning/30",
  BLOQUEADO_TECNICO: "bg-destructive/10 text-destructive border-destructive/30",
};

const docStyles: Record<DocStatus, string> = {
  Atendido: "bg-success/12 text-success border-success/25",
  "Correção necessária": "bg-warning/15 text-warning-foreground border-warning/35",
  "Em revalidação": "bg-info/12 text-info border-info/25",
  Pendente: "bg-muted text-muted-foreground border-border",
  Bloqueado: "bg-destructive/10 text-destructive border-destructive/30",
};

function base(extra?: string) {
  return cn(
    "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium tracking-wide transition-colors",
    extra,
  );
}

export function StateBadge({ state, label }: { state: ProcessState; label: string }) {
  return <span className={base(stateStyles[state])}>{label}</span>;
}

export function TechBadge({ tech, label }: { tech: TechCondition; label: string }) {
  return <span className={base(techStyles[tech])}>{label}</span>;
}

export function DocStatusBadge({ status }: { status: DocStatus }) {
  return <span className={base(docStyles[status])}>{status}</span>;
}

export function PolicyBadge({
  badge,
}: {
  badge: "Fonte utilizável" | "Conflito" | "Revisão necessária";
}) {
  const map = {
    "Fonte utilizável": "bg-success/12 text-success border-success/25",
    Conflito: "bg-destructive/10 text-destructive border-destructive/30",
    "Revisão necessária": "bg-warning/15 text-warning-foreground border-warning/35",
  } as const;
  return <span className={base(map[badge])}>{badge}</span>;
}

export function NeutralBadge({ children }: { children: React.ReactNode }) {
  return <span className={base("bg-muted text-muted-foreground border-border")}>{children}</span>;
}
