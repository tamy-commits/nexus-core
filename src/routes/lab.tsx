import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  AlertTriangle,
  GitBranch,
  WifiOff,
  CheckCircle2,
  FlaskConical,
} from "lucide-react";
import { SCENARIOS, STATE_LABEL } from "@/lib/scenarios";
import { useNexus } from "@/lib/nexus-store";
import { StateBadge } from "@/components/nexus/Badges";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/lab")({
  head: () => ({
    meta: [
      { title: "Scenario Lab — NEXUS" },
      {
        name: "description",
        content: "Ambiente demonstrativo com dados e respostas sintéticas controladas.",
      },
      { property: "og:title", content: "Scenario Lab — NEXUS" },
      {
        property: "og:description",
        content: "Ambiente demonstrativo com dados e respostas sintéticas controladas.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
  component: ScenarioLab,
});

const iconMap = {
  A: AlertTriangle,
  B: GitBranch,
  C: WifiOff,
  D: CheckCircle2,
} as const;

function ScenarioLab() {
  const { loadScenario } = useNexus();
  const navigate = useNavigate();

  const open = (key: "A" | "B" | "C" | "D") => {
    loadScenario(key);
    navigate({ to: "/workspace" });
  };

  return (
    <div className="mx-auto max-w-6xl px-8 py-10">
      <div className="mb-6 flex items-center gap-2 rounded-md border border-info/25 bg-info/8 px-3 py-2 text-xs text-info">
        <FlaskConical className="h-3.5 w-3.5" />
        Ambiente demonstrativo com dados e respostas sintéticas controladas.
      </div>

      <div className="mb-8">
        <div className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
          Laboratório de cenários
        </div>
        <h2 className="text-display mt-1 text-3xl text-foreground">
          Selecione um cenário para instanciar um caso
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Cada cenário carrega dados pré-configurados que reproduzem uma condição representativa da
          operação de prontidão documental.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {SCENARIOS.map((s) => {
          const Icon = iconMap[s.key];
          const featured = s.featured;
          return (
            <button
              key={s.key}
              onClick={() => open(s.key)}
              className={cn(
                "group relative flex flex-col rounded-xl border bg-card p-6 text-left transition-all",
                "hover:border-primary/40 hover:shadow-[0_4px_24px_-8px_color-mix(in_oklab,var(--color-primary)_25%,transparent)]",
                featured
                  ? "border-primary/40 ring-1 ring-primary/20 md:col-span-2"
                  : "border-border",
              )}
            >
              {featured && (
                <span className="absolute -top-2.5 left-6 rounded-full border border-primary/30 bg-card px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
                  Demonstração principal
                </span>
              )}

              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      "grid h-10 w-10 shrink-0 place-items-center rounded-lg",
                      featured ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground",
                    )}
                  >
                    <Icon className="h-5 w-5" strokeWidth={1.6} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                      {s.category}
                    </div>
                    <h3 className="mt-0.5 text-lg font-semibold text-foreground">{s.title}</h3>
                  </div>
                </div>
                <StateBadge state={s.initialState} label={STATE_LABEL[s.initialState]} />
              </div>

              <p className="mt-4 text-sm text-foreground/80">{s.short}</p>

              <dl className="mt-5 grid grid-cols-2 gap-y-2 text-xs">
                <dt className="text-muted-foreground">Risco demonstrado</dt>
                <dd className="text-foreground">{s.risk}</dd>
                <dt className="text-muted-foreground">Duração estimada</dt>
                <dd className="text-foreground">{s.duration}</dd>
                <dt className="text-muted-foreground">Case ID</dt>
                <dd className="font-mono text-foreground">{s.caseId}</dd>
              </dl>

              <div className="mt-6 flex items-center justify-end">
                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-primary group-hover:gap-2 transition-all">
                  Abrir caso <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
