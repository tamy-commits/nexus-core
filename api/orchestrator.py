import uuid
from datetime import date
from pathlib import Path

from api.document_rules import evaluate_documents
from api.retrieval import PolicyRetriever
from api.schemas import AuditEvent, CaseRequest, DecisionResponse, Evidence


class NexusOrchestrator:
    def __init__(self, knowledge_dir: Path):
        self.retriever = PolicyRetriever(knowledge_dir)

    def analyze(self, request: CaseRequest, today: date | None = None) -> DecisionResponse:
        run_id = f"NXS-RUN-{uuid.uuid4().hex[:12].upper()}"
        today = today or date.today()
        chunks = self.retriever.retrieve(f"{request.request_type} comprovante endereço validade documentos {request.segment}")
        evidence = [Evidence(policy_code=c.code, policy_version=c.version, excerpt=c.text, score=c.score) for c in chunks if c.score > 0]
        audit = [AuditEvent(actor="Sistema", action="Caso recebido para análise"), AuditEvent(actor="Retriever", action=f"{len(evidence)} evidência(s) de política recuperada(s)", rule="RET-POLICY-v1")]
        if not evidence:
            audit.append(AuditEvent(actor="Guardrail", action="Avanço automático bloqueado por grounding insuficiente", rule="G-GROUNDING-01", finding="GROUNDING_INSUFICIENTE"))
            return DecisionResponse(run_id=run_id, case_id=request.case_id, mode="DEMO", decision="REVISAO_HUMANA", reason_code="GROUNDING_INSUFICIENTE", confidence=0, current_state="EM_REVISAO_HUMANA", next_state="EM_REVISAO_HUMANA", recommendation="Revisar manualmente: nenhuma política aplicável foi recuperada.", authorized_action="Bloquear submissão e abrir revisão humana.", human_review_required=True, rules_executed=["RET-POLICY-v1", "G-GROUNDING-01"], evidence=[], audit=audit)
        reason_code, finding = evaluate_documents(request.documents, today)
        if reason_code:
            audit.extend([AuditEvent(actor="Regra", action="Validação documental", rule="R-DOC-04", finding=reason_code), AuditEvent(actor="Máquina de estados", action="Correção documental requerida", from_state="EM_PREPARACAO", to_state="AGUARDANDO_CORRECAO")])
            return DecisionResponse(run_id=run_id, case_id=request.case_id, mode="DEMO", decision="CORRECAO_NECESSARIA", reason_code=reason_code, confidence=0.99, current_state="AGUARDANDO_CORRECAO", next_state="EM_PREPARACAO", recommendation=finding or "Corrigir documentação.", authorized_action="Aguardar nova versão antes da submissão.", human_review_required=False, rules_executed=["RET-POLICY-v1", "R-DOC-01", "R-DOC-04"], evidence=evidence, audit=audit)
        audit.extend([AuditEvent(actor="Regra", action="Gates documentais aprovados", rule="R-DOC-04", finding="OK"), AuditEvent(actor="Máquina de estados", action="Caso preparado para validação em sombra", from_state="EM_PREPARACAO", to_state="PRONTA_PARA_SUBMISSAO")])
        return DecisionResponse(run_id=run_id, case_id=request.case_id, mode="DEMO", decision="PRONTA_PARA_SUBMISSAO", reason_code=None, confidence=0.99, current_state="PRONTA_PARA_SUBMISSAO", next_state="EM_VALIDACAO_SOMBRA", recommendation="Encaminhar para validação em sombra antes da submissão.", authorized_action="Handoff controlado para validação em sombra.", human_review_required=True, rules_executed=["RET-POLICY-v1", "R-DOC-01", "R-DOC-04", "G-HITL-01"], evidence=evidence, audit=audit)
