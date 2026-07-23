import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import {
  SCENARIOS,
  STEPS,
  type AuditEvent,
  type Scenario,
  type ProcessState,
  type TechCondition,
} from "./scenarios";

export interface CaseSnapshot {
  key: Scenario["key"];
  caseId: string;
  client: string;
  currentStep: string;
  currentState: ProcessState;
  initialState: ProcessState;
  tech: TechCondition;
  lastUpdate: string;
  category: string;
}

interface HumanReviewSubmission {
  decision: string;
  justification: string;
  actor: string;
}

interface NexusState {
  activeKey: Scenario["key"] | null;
  scenario: Scenario | null;
  cases: CaseSnapshot[];
  auditOpen: boolean;
  reviewOpen: boolean;
  evidenceOpen: boolean;
  loadScenario: (key: Scenario["key"]) => void;
  resetScenario: () => void;
  simulateDocResend: () => void;
  retryIntegration: () => void;
  submitHumanReview: (input: HumanReviewSubmission) => void;
  setAuditOpen: (v: boolean) => void;
  setReviewOpen: (v: boolean) => void;
  setEvidenceOpen: (v: boolean) => void;
  currentStepIndex: number;
  humanReviewRecord: (HumanReviewSubmission & { time: string }) | null;
  retryInFlight: boolean;
}

const Ctx = createContext<NexusState | null>(null);

function clone<T>(v: T): T {
  return JSON.parse(JSON.stringify(v));
}

function now() {
  return new Date().toTimeString().slice(0, 5);
}

function snapshot(s: Scenario): CaseSnapshot {
  return {
    key: s.key,
    caseId: s.caseId,
    client: s.client,
    currentStep: s.currentStep,
    currentState: s.currentState,
    initialState: s.initialState,
    tech: s.tech,
    lastUpdate: s.lastUpdate,
    category: s.category,
  };
}

export function NexusProvider({ children }: { children: ReactNode }) {
  const [activeKey, setActiveKey] = useState<Scenario["key"] | null>(null);
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [cases, setCases] = useState<CaseSnapshot[]>(() => SCENARIOS.map(snapshot));
  const [auditOpen, setAuditOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [evidenceOpen, setEvidenceOpen] = useState(false);
  const [humanReviewRecord, setHumanReviewRecord] = useState<
    (HumanReviewSubmission & { time: string }) | null
  >(null);
  const [retryInFlight, setRetryInFlight] = useState(false);

  const syncCase = useCallback((s: Scenario) => {
    setCases((prev) => prev.map((c) => (c.key === s.key ? snapshot(s) : c)));
  }, []);

  const loadScenario = useCallback((key: Scenario["key"]) => {
    const base = SCENARIOS.find((s) => s.key === key);
    if (!base) return;
    setActiveKey(key);
    setScenario(clone(base));
    setHumanReviewRecord(null);
  }, []);

  const resetScenario = useCallback(() => {
    if (!activeKey) return;
    const base = SCENARIOS.find((s) => s.key === activeKey);
    if (!base) return;
    const fresh = clone(base);
    setScenario(fresh);
    syncCase(fresh);
    setHumanReviewRecord(null);
    setRetryInFlight(false);
  }, [activeKey, syncCase]);

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

      // Transição: AGUARDANDO_CORRECAO → EM_PREPARACAO (revalidando dependências)
      next.currentState = "EM_PREPARACAO";
      next.currentStep = "Documentos";
      next.findings = ["Reexecução em andamento — revalidando gates R-DOC-04."];
      next.lastUpdate = now();

      const t = now();
      const events: AuditEvent[] = [
        { id: `ev-${Date.now()}-1`, time: t, actor: "Gerente PJ", action: "Envio de nova versão do documento", version: "v2" },
        { id: `ev-${Date.now()}-2`, time: t, actor: "Regra", action: "Reexecução parcial (R-DOC-04)", rule: "R-DOC-04" },
        { id: `ev-${Date.now()}-3`, time: t, actor: "Sistema", action: "Transição de estado", from: "AGUARDANDO_CORRECAO", to: "EM_PREPARACAO" },
      ];
      next.audit = [...next.audit, ...events];
      syncCase(next);

      setTimeout(() => {
        setScenario((s) => {
          if (!s || s.key !== "A") return s;
          const n = clone(s);
          const d = n.documents.find((x) => x.id === "endereco");
          if (d) {
            d.status = "Atendido";
            d.highlight = false;
          }
          // Apenas após todos os gates aplicáveis aprovados
          n.currentState = "PRONTA_PARA_SUBMISSAO";
          n.currentStep = "Revisão";
          n.findings = [];
          n.recommendation = "Encaminhar para validação em sombra (N1) antes de qualquer submissão.";
          n.authorizedAction = "Handoff controlado para validação em sombra.";
          n.nextState = "EM_VALIDACAO_SOMBRA";
          n.lastUpdate = now();
          const t2 = now();
          n.audit.push(
            { id: `ev-${Date.now()}-4`, time: t2, actor: "Regra", action: "Gate R-DOC-04 aprovado", rule: "R-DOC-04", finding: "OK" },
            { id: `ev-${Date.now()}-5`, time: t2, actor: "Sistema", action: "Transição de estado", from: "EM_PREPARACAO", to: "PRONTA_PARA_SUBMISSAO" },
          );
          syncCase(n);
          return n;
        });
      }, 1600);

      return next;
    });
  }, [syncCase]);

  const retryIntegration = useCallback(() => {
    if (retryInFlight) return;
    setRetryInFlight(true);
    setScenario((prev) => {
      if (!prev || prev.key !== "C") return prev;
      const next = clone(prev);
      next.audit.push({
        id: `ev-${Date.now()}-r1`,
        time: now(),
        actor: "Sistema",
        action: "Tentativa de reexecução da consulta externa",
        rule: "R-INT-01",
      });
      next.lastUpdate = now();
      syncCase(next);
      return next;
    });

    setTimeout(() => {
      setScenario((s) => {
        if (!s || s.key !== "C") return s;
        const n = clone(s);
        // Sucesso sintético controlado
        n.tech = "NORMAL";
        n.findings = [];
        n.currentStep = "Revisão";
        n.currentState = "PRONTA_PARA_SUBMISSAO";
        n.nextState = "EM_VALIDACAO_SOMBRA";
        n.recommendation = "Consulta reexecutada com sucesso. Encaminhar para validação em sombra.";
        n.authorizedAction = "Handoff controlado para validação em sombra.";
        n.lastUpdate = now();
        const t = now();
        n.audit.push(
          { id: `ev-${Date.now()}-r2`, time: t, actor: "Sistema", action: "Consulta externa retornou com sucesso", finding: "OK" },
          { id: `ev-${Date.now()}-r3`, time: t, actor: "Regra", action: "Condição técnica normalizada", rule: "R-INT-03" },
          { id: `ev-${Date.now()}-r4`, time: t, actor: "Sistema", action: "Transição de estado", from: "EM_PREPARACAO", to: "PRONTA_PARA_SUBMISSAO" },
        );
        syncCase(n);
        return n;
      });
      setRetryInFlight(false);
    }, 1400);
  }, [retryInFlight, syncCase]);

  const submitHumanReview = useCallback(
    ({ decision, justification, actor }: HumanReviewSubmission) => {
      if (!decision || !justification.trim() || !actor.trim()) return;
      const record = { decision, justification: justification.trim(), actor: actor.trim(), time: now() };
      setHumanReviewRecord(record);
      setScenario((prev) => {
        if (!prev) return prev;
        const next = clone(prev);
        next.audit.push({
          id: `ev-${Date.now()}-h`,
          time: record.time,
          actor: `Revisão humana — ${record.actor}`,
          action: `Decisão registrada: ${record.decision}`,
          justification: record.justification,
        });
        if (prev.key === "B") {
          next.currentState = "EM_REVISAO_HUMANA";
          next.currentStep = "Revisão";
        }
        if (prev.key === "D") {
          next.currentState = "EM_VALIDACAO_SOMBRA";
          next.currentStep = "Handoff";
          next.audit.push({
            id: `ev-${Date.now()}-h2`,
            time: record.time,
            actor: "Sistema",
            action: "Transição autorizada",
            from: "PRONTA_PARA_SUBMISSAO",
            to: "EM_VALIDACAO_SOMBRA",
          });
        }
        next.lastUpdate = record.time;
        syncCase(next);
        return next;
      });
    },
    [syncCase],
  );

  const currentStepIndex = useMemo(() => {
    if (!scenario) return 0;
    return STEPS.indexOf(scenario.currentStep as (typeof STEPS)[number]);
  }, [scenario]);

  const value: NexusState = {
    activeKey,
    scenario,
    cases,
    auditOpen,
    reviewOpen,
    evidenceOpen,
    loadScenario,
    resetScenario,
    simulateDocResend,
    retryIntegration,
    submitHumanReview,
    setAuditOpen,
    setReviewOpen,
    setEvidenceOpen,
    currentStepIndex,
    humanReviewRecord,
    retryInFlight,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useNexus() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useNexus must be used within NexusProvider");
  return v;
}
