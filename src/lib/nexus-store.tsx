import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import {
  SCENARIOS,
  STEPS,
  type AuditEvent,
  type Scenario,
  type StepKey,
} from "./scenarios";

interface NexusState {
  activeKey: Scenario["key"] | null;
  scenario: Scenario | null;
  auditOpen: boolean;
  reviewOpen: boolean;
  loadScenario: (key: Scenario["key"]) => void;
  resetScenario: () => void;
  simulateDocResend: () => void;
  setAuditOpen: (v: boolean) => void;
  setReviewOpen: (v: boolean) => void;
  currentStepIndex: number;
}

const Ctx = createContext<NexusState | null>(null);

function clone<T>(v: T): T {
  return JSON.parse(JSON.stringify(v));
}

export function NexusProvider({ children }: { children: ReactNode }) {
  const [activeKey, setActiveKey] = useState<Scenario["key"] | null>(null);
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [auditOpen, setAuditOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);

  const loadScenario = useCallback((key: Scenario["key"]) => {
    const base = SCENARIOS.find((s) => s.key === key);
    if (!base) return;
    setActiveKey(key);
    setScenario(clone(base));
  }, []);

  const resetScenario = useCallback(() => {
    if (!activeKey) return;
    const base = SCENARIOS.find((s) => s.key === activeKey);
    if (base) setScenario(clone(base));
  }, [activeKey]);

  const simulateDocResend = useCallback(() => {
    setScenario((prev) => {
      if (!prev || prev.key !== "A") return prev;
      const next = clone(prev);
      const doc = next.documents.find((d) => d.id === "endereco");
      if (!doc) return next;
      doc.file = "comprovante_endereco_v2.pdf";
      doc.version = 2;
      doc.validity = "15/08/2026";
      doc.status = "Em revalidação";
      doc.finding = undefined;
      doc.action = undefined;
      doc.highlight = true;

      const now = new Date();
      const t = now.toTimeString().slice(0, 5);
      const events: AuditEvent[] = [
        { id: `ev-${now.getTime()}-1`, time: t, actor: "Gerente PJ", action: "Envio de nova versão do documento", version: "v2" },
        { id: `ev-${now.getTime()}-2`, time: t, actor: "Regra", action: "Reexecução parcial (R-DOC-04)", rule: "R-DOC-04", finding: "OK" },
      ];
      next.audit = [...next.audit, ...events];

      // Mark atendido after simulated revalidation
      setTimeout(() => {
        setScenario((s) => {
          if (!s || s.key !== "A") return s;
          const n = clone(s);
          const d = n.documents.find((x) => x.id === "endereco");
          if (d) {
            d.status = "Atendido";
            d.highlight = false;
          }
          n.initialState = "PRONTA_PARA_SUBMISSAO";
          n.currentStep = "Revisão";
          n.findings = [];
          n.recommendation = "Encaminhar para validação em sombra.";
          n.authorizedAction = "Handoff controlado para validação em sombra.";
          n.nextState = "VALIDACAO_SOMBRA";
          const t2 = new Date().toTimeString().slice(0, 5);
          n.audit.push({
            id: `ev-${Date.now()}-3`,
            time: t2,
            actor: "Regra",
            action: "Estado revalidado",
            from: "EM_PREPARACAO",
            to: "PRONTA_PARA_SUBMISSAO",
          });
          return n;
        });
      }, 1600);

      return next;
    });
  }, []);

  const currentStepIndex = useMemo(() => {
    if (!scenario) return 0;
    return STEPS.indexOf(scenario.currentStep);
  }, [scenario]);

  const value: NexusState = {
    activeKey,
    scenario,
    auditOpen,
    reviewOpen,
    loadScenario,
    resetScenario,
    simulateDocResend,
    setAuditOpen,
    setReviewOpen,
    currentStepIndex,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useNexus() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useNexus must be used within NexusProvider");
  return v;
}
