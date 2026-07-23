import { useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Search } from "lucide-react";
import { STATE_LABEL, TECH_LABEL, type ProcessState, type TechCondition } from "@/lib/scenarios";
import { useNexus } from "@/lib/nexus-store";
import { StateBadge, TechBadge } from "@/components/nexus/Badges";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Central de Prontidão Documental — NEXUS" },
      { name: "description", content: "Acompanhamento de solicitações, pendências, revisões e prontidão para submissão." },
      { property: "og:title", content: "Central de Prontidão Documental — NEXUS" },
      { property: "og:description", content: "Acompanhamento de solicitações, pendências, revisões e prontidão para submissão." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CaseCenter,
});

function CaseCenter() {
  const { cases, loadScenario } = useNexus();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [stateFilter, setStateFilter] = useState<ProcessState | "ALL">("ALL");
  const [techFilter, setTechFilter] = useState<TechCondition | "ALL">("ALL");

  const indicators = useMemo(() => {
    return {
      total: cases.length,
      aguardando: cases.filter((c) => c.currentState === "AGUARDANDO_CORRECAO").length,
      revisao: cases.filter((c) => c.currentState === "EM_REVISAO_HUMANA").length,
      bloqueadoTec: cases.filter((c) => c.tech === "BLOQUEADO_TECNICO").length,
      prontas: cases.filter(
        (c) => c.currentState === "PRONTA_PARA_SUBMISSAO" || c.currentState === "EM_VALIDACAO_SOMBRA",
      ).length,
    };
  }, [cases]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return cases.filter((c) => {
      if (stateFilter !== "ALL" && c.currentState !== stateFilter) return false;
      if (techFilter !== "ALL" && c.tech !== techFilter) return false;
      if (term && !c.caseId.toLowerCase().includes(term) && !c.client.toLowerCase().includes(term)) return false;
      return true;
    });
  }, [cases, q, stateFilter, techFilter]);

  const open = (key: "A" | "B" | "C" | "D") => {
    loadScenario(key);
    navigate({ to: "/workspace" });
  };

  return (
    <div className="mx-auto max-w-7xl px-8 py-10">
      <div className="mb-8">
        <div className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
          Operação
        </div>
        <h2 className="text-display mt-1 text-3xl text-foreground">
          Central de Prontidão Documental
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Acompanhamento de solicitações, pendências, revisões e prontidão para submissão.
        </p>
      </div>

      {/* Indicators */}
      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-5">
        <Indicator label="Total de casos" value={indicators.total} />
        <Indicator label="Aguardando correção" value={indicators.aguardando} tone="warning" />
        <Indicator label="Em revisão humana" value={indicators.revisao} tone="info" />
        <Indicator label="Bloqueados tecnicamente" value={indicators.bloqueadoTec} tone="destructive" />
        <Indicator label="Prontos p/ submissão" value={indicators.prontas} tone="success" />
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por caso ou empresa"
            className="pl-8"
          />
        </div>
        <Select value={stateFilter} onValueChange={(v) => setStateFilter(v as ProcessState | "ALL")}>
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder="Estado do processo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Todos os estados</SelectItem>
            {(Object.keys(STATE_LABEL) as ProcessState[]).map((s) => (
              <SelectItem key={s} value={s}>{STATE_LABEL[s]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={techFilter} onValueChange={(v) => setTechFilter(v as TechCondition | "ALL")}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Condição técnica" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Todas as condições</SelectItem>
            {(Object.keys(TECH_LABEL) as TechCondition[]).map((t) => (
              <SelectItem key={t} value={t}>{TECH_LABEL[t]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="hidden grid-cols-[1.1fr_1.4fr_1fr_1.2fr_1fr_0.9fr_auto] gap-4 border-b border-border bg-muted/40 px-5 py-3 text-[11px] uppercase tracking-wider text-muted-foreground md:grid">
          <div>Caso</div>
          <div>Empresa</div>
          <div>Etapa atual</div>
          <div>Estado</div>
          <div>Condição técnica</div>
          <div>Atualização</div>
          <div className="text-right">Ação</div>
        </div>
        {filtered.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-muted-foreground">
            Nenhum caso corresponde aos filtros aplicados.
          </div>
        ) : (
          filtered.map((c, i) => (
            <div
              key={c.key}
              className={cn(
                "grid grid-cols-1 gap-2 px-5 py-4 md:grid-cols-[1.1fr_1.4fr_1fr_1.2fr_1fr_0.9fr_auto] md:items-center md:gap-4",
                i > 0 && "border-t border-border",
              )}
            >
              <div>
                <div className="font-mono text-sm text-foreground">{c.caseId}</div>
                <div className="text-[11px] text-muted-foreground">{c.category}</div>
              </div>
              <div className="text-sm text-foreground truncate">{c.client}</div>
              <div className="text-sm text-foreground/80">{c.currentStep}</div>
              <div><StateBadge state={c.currentState} label={STATE_LABEL[c.currentState]} /></div>
              <div><TechBadge tech={c.tech} label={TECH_LABEL[c.tech]} /></div>
              <div className="font-mono text-xs text-muted-foreground">{c.lastUpdate}</div>
              <div className="md:text-right">
                <Button size="sm" variant="outline" className="gap-1.5" onClick={() => open(c.key)}>
                  Abrir caso <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function Indicator({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: number;
  tone?: "neutral" | "warning" | "info" | "destructive" | "success";
}) {
  const toneMap = {
    neutral: "text-foreground",
    warning: "text-warning-foreground",
    info: "text-info",
    destructive: "text-destructive",
    success: "text-success",
  } as const;
  return (
    <div className="rounded-xl border border-border bg-card px-4 py-3">
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={cn("mt-1 text-2xl font-semibold tabular-nums", toneMap[tone])}>{value}</div>
    </div>
  );
}
