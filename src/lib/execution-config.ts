import type { Scenario } from "./scenarios";

export interface ExecutionConfig {
  runId: string;
  mode: string;
  orchestration: string;
  retrieval: string;
  communication: string;
  ruleset: string;
  stateMachine: string;
  knowledgeBase: string;
  model: string;
  dataClassification: string;
  scopeNote: string;
}

const communicationByScenario: Record<Scenario["key"], string> = {
  A: "COM-PENDING v1.0",
  B: "HITL-SUMMARY v1.0",
  C: "COM-TECH-FAILURE v1.0",
  D: "COM-READY v1.0",
};

export function getExecutionConfig(
  caseId: string,
  scenarioKey: Scenario["key"],
): ExecutionConfig {
  const caseSuffix = caseId.replace("NXS-2026-", "");

  return {
    runId: `NXS-RUN-${caseSuffix}-01`,
    mode: "Demonstração controlada",
    orchestration: "ORCH-PJ v1.0 — orquestração assistida simulada",
    retrieval: "RET-POLICY v1.0 — recuperação controlada",
    communication: communicationByScenario[scenarioKey],
    ruleset: "RULESET-PJ v1.0",
    stateMachine: "STATE-MACHINE-PJ v1.0",
    knowledgeBase: "KB-DEMO-2026.07 — base sintética",
    model: "Não conectado no MVP",
    dataClassification: "Dados sintéticos",
    scopeNote:
      "Metadados demonstrativos. O MVP não executa modelo de linguagem, RAG vetorial ou integração produtiva.",
  };
}
