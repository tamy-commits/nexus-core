import type { Scenario } from "./scenarios";

export interface NexusDecision {
  run_id: string;
  mode: "LIVE" | "DEMO" | "FALLBACK";
  decision: "CORRECAO_NECESSARIA" | "PRONTA_PARA_SUBMISSAO" | "REVISAO_HUMANA";
  reason_code: string | null;
  confidence: number;
  current_state: Scenario["currentState"];
  next_state: Scenario["nextState"];
  recommendation: string;
  authorized_action: string;
  rules_executed: string[];
  evidence: Array<{ policy_code: string; policy_version: string; excerpt: string; score: number }>;
  audit: Array<{
    actor: string;
    action: string;
    rule?: string;
    finding?: string;
    from_state?: string;
    to_state?: string;
  }>;
}

const API_URL = import.meta.env.VITE_NEXUS_API_URL ?? "http://localhost:8000";

export async function analyzeDocumentCase(
  scenario: Scenario,
  issuedAt: string,
): Promise<NexusDecision> {
  const response = await fetch(`${API_URL}/v1/cases/analyze-demo`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      case_id: scenario.caseId,
      segment: scenario.segment,
      request_type: scenario.requestType,
      documents: scenario.documents.map((document) => ({
        id: document.id,
        label: document.label,
        file: document.file,
        version: document.version,
        issued_at: document.id === "endereco" ? issuedAt : null,
        readable: true,
        present: true,
      })),
    }),
  });
  if (!response.ok) throw new Error(`NEXUS API respondeu ${response.status}`);
  return response.json() as Promise<NexusDecision>;
}
