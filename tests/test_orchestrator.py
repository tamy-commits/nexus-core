from datetime import date
from pathlib import Path

from api.orchestrator import NexusOrchestrator
from api.schemas import CaseRequest, Document

ROOT = Path(__file__).resolve().parents[1]
orchestrator = NexusOrchestrator(ROOT / "knowledge")


def case(address_date: str, *, readable: bool = True, missing_document: str | None = None) -> CaseRequest:
    documents = [
        Document(id="contrato", label="Contrato social", file="contrato.pdf"),
        Document(id="repr", label="Representantes", file="repr.zip"),
        Document(id="endereco", label="Comprovante de endereço", file="endereco.pdf", issued_at=address_date, readable=readable),
        Document(id="form", label="Formulário", file="form.pdf"),
        Document(id="poderes", label="Poderes", file="poderes.pdf"),
    ]
    return CaseRequest(case_id="NXS-2026-0148", segment="Silver", request_type="Abertura de conta empresarial", documents=[d for d in documents if d.id != missing_document])


def test_expired_document_is_blocked_with_policy_evidence():
    result = orchestrator.analyze(case("2026-05-15"), today=date(2026, 8, 20))
    assert result.decision == "CORRECAO_NECESSARIA"
    assert result.reason_code == "DOC_VENCIDO"
    assert result.current_state == "AGUARDANDO_CORRECAO"
    assert result.evidence[0].policy_code == "POL-DOC-PJ-02"


def test_replacement_document_reaches_shadow_validation_gate():
    result = orchestrator.analyze(case("2026-08-15"), today=date(2026, 8, 20))
    assert result.decision == "PRONTA_PARA_SUBMISSAO"
    assert result.reason_code is None
    assert result.current_state == "PRONTA_PARA_SUBMISSAO"
    assert result.next_state == "EM_VALIDACAO_SOMBRA"
    assert result.human_review_required is True
    assert result.evidence[0].policy_code == "POL-DOC-PJ-02"
    assert result.evidence[0].policy_version == "3.1"
    assert result.evidence[0].excerpt
    assert all("submet" not in event.action.lower() for event in result.audit)


def test_unreadable_document_never_advances():
    result = orchestrator.analyze(case("2026-08-15", readable=False), today=date(2026, 8, 20))
    assert result.reason_code == "DOC_ILEGIVEL"
    assert result.current_state == "AGUARDANDO_CORRECAO"


def test_incomplete_document_never_advances():
    result = orchestrator.analyze(case("2026-08-15", missing_document="contrato"), today=date(2026, 8, 20))
    assert result.reason_code == "DOC_INCOMPLETO"
    assert result.current_state == "AGUARDANDO_CORRECAO"


def test_insufficient_grounding_requires_human_review(tmp_path):
    result = NexusOrchestrator(tmp_path).analyze(case("2026-08-15"), today=date(2026, 8, 20))
    assert result.reason_code == "GROUNDING_INSUFICIENTE"
    assert result.decision == "REVISAO_HUMANA"
    assert result.human_review_required is True
    assert result.evidence == []
    assert all("submet" not in event.action.lower() for event in result.audit)
