import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import {
  SCENARIOS,
  STEPS,
  type AuditEvent,
  type Scenario,
  type ProcessState,
  type TechCondition,
} from "./scenarios";
import { analyzeDocumentCase } from "./nexus-api";

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
  analysisInFlight: boolean;
  executionMode: "LIVE" | "DEMO" | "FALLBACK";
  lastRunId: string | null;
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
  const [analysisInFlight, setAnalysisInFlight] = useState(false);
  const [executionMode, setExecutionMode] = useState<"LIVE" | "DEMO" | "FALLBACK">("DEMO");
  const [lastRunId, setLastRunId] = useState<string | null>(null);

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
    setExecutionMode("DEMO");
    setLastRunId(null);
  }, [activeKey, syncCase]);

  const simulateDocResend = useCallback(async () => {
    if (!scenario || scenario.key !== "A" || analysisInFlight) return;
    const original = clone(scenario);
    setAnalysisInFlight(true);
    const working = clone(scenario);
    const doc = working.documents.find((d) => d.id === "endereco");
    if (!doc) {
      setAnalysisInFlight(false);
      return;
    }
    doc.file = "comprovante_endereco_v2.pdf";
    doc.version = 2;
    doc.validity = "15/08/2026";
    doc.status = "Em revalidação";
    doc.finding = undefined;
    doc.action = undefined;
    working.currentState = "EM_PREPARACAO";
    working.findings = ["API NEXUS em execução — revalidando política e gate documental."];
    setScenario(working);
    syncCase(working);
    try {
      const result = await analyzeDocumentCase(working, "2026-08-15");
      const next = clone(working);
      const updated = next.documents.find((d) => d.id === "endereco");
      if (updated) updated.status = "Atendido";
      next.currentState = result.current_state;
      next.nextState = result.next_state;
      next.currentStep = result.decision === "PRONTA_PARA_SUBMISSAO" ? "Revisão" : "Documentos";
      next.findings = result.reason_code ? [result.reason_code] : [];
      next.recommendation = result.recommendation;
      next.authorizedAction = result.authorized_action;
      next.rulesExecuted = result.rules_executed;
      next.grounding = result.evidence.length
        ? `Execução ${result.run_id} fundamentada em ${result.evidence[0].policy_code} v${result.evidence[0].policy_version}.`
        : "Sem evidência recuperada.";
      next.groundingStatus = result.evidence.length ? "ok" : "insuficiente";
      next.evidences = result.evidence.map((evidence, index) => ({
        id: `${result.run_id}-evidence-${index}`,
        claim: evidence.excerpt,
        rule: "RET-POLICY-v1",
        policyCode: evidence.policy_code,
        policyVersion: evidence.policy_version,
        policyValidity: "Consultar fonte versionada",
        excerpt: evidence.excerpt,
        timestamp: now(),
      }));
      if (result.evidence.length) {
        next.policies = [
          {
            code: result.evidence[0].policy_code,
            title: "Política recuperada pela execução",
            version: result.evidence[0].policy_version,
            validity: "Consultar fonte versionada",
            badge: "Fonte utilizável",
            excerpts: result.evidence.map((evidence) => evidence.excerpt),
          },
        ];
      }
      next.audit.push(
        ...result.audit.map((event, index): AuditEvent => ({
          id: `${result.run_id}-${index}`,
          time: now(),
          actor: event.actor,
          action: event.action,
          rule: event.rule,
          finding: event.finding,
          from: event.from_state,
          to: event.to_state,
        })),
      );
      setExecutionMode(result.mode);
      setLastRunId(result.run_id);
      setScenario(next);
      syncCase(next);
    } catch (error) {
      const fallback = clone(original);
      fallback.tech = "BLOQUEADO_TECNICO";
      fallback.currentState = "AGUARDANDO_CORRECAO";
      fallback.findings = ["API_INDISPONIVEL — avanço bloqueado com segurança."];
      fallback.recommendation = "Iniciar a API NEXUS e reexecutar a validação.";
      fallback.audit.push({
        id: `fallback-${Date.now()}`,
        time: now(),
        actor: "Guardrail",
        action: error instanceof Error ? error.message : "Falha desconhecida na API",
        rule: "G-FAIL-CLOSED-01",
        finding: "API_INDISPONIVEL",
      });
      setExecutionMode("FALLBACK");
      setScenario(fallback);
      syncCase(fallback);
    } finally {
      setAnalysisInFlight(false);
    }
  }, [analysisInFlight, scenario, syncCase]);

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
          {
            id: `ev-${Date.now()}-r2`,
            time: t,
            actor: "Sistema",
            action: "Consulta externa retornou com sucesso",
            finding: "OK",
          },
          {
            id: `ev-${Date.now()}-r3`,
            time: t,
            actor: "Regra",
            action: "Condição técnica normalizada",
            rule: "R-INT-03",
          },
          {
            id: `ev-${Date.now()}-r4`,
            time: t,
            actor: "Sistema",
            action: "Transição de estado",
            from: "EM_PREPARACAO",
            to: "PRONTA_PARA_SUBMISSAO",
          },
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
      const record = {
        decision,
        justification: justification.trim(),
        actor: actor.trim(),
        time: now(),
      };
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

  const currentStepIndex = useMemo(
    () => (scenario ? STEPS.indexOf(scenario.currentStep as (typeof STEPS)[number]) : 0),
    [scenario],
  );
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
    analysisInFlight,
    executionMode,
    lastRunId,
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useNexus() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useNexus must be used within NexusProvider");
  return v;
}
