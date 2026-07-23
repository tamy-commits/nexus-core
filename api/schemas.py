from typing import Literal

from pydantic import BaseModel, Field


class Document(BaseModel):
    id: str
    label: str
    file: str
    version: int = 1
    issued_at: str | None = None
    readable: bool = True
    present: bool = True


class CaseRequest(BaseModel):
    case_id: str
    segment: Literal["Silver", "Gold"]
    request_type: str
    documents: list[Document]


class Evidence(BaseModel):
    policy_code: str
    policy_version: str
    excerpt: str
    score: float = Field(ge=0, le=1)


class AuditEvent(BaseModel):
    actor: str
    action: str
    rule: str | None = None
    finding: str | None = None
    from_state: str | None = None
    to_state: str | None = None


class DecisionResponse(BaseModel):
    run_id: str
    case_id: str
    mode: Literal["LIVE", "DEMO", "FALLBACK"]
    decision: Literal["CORRECAO_NECESSARIA", "PRONTA_PARA_SUBMISSAO", "REVISAO_HUMANA"]
    reason_code: str | None
    confidence: float = Field(ge=0, le=1)
    current_state: str
    next_state: str
    recommendation: str
    authorized_action: str
    human_review_required: bool
    rules_executed: list[str]
    evidence: list[Evidence]
    audit: list[AuditEvent]


class HandoffRequest(BaseModel):
    case_id: str
    state: str
    idempotency_key: str
    failures_before_success: int = Field(default=0, ge=0)


class HandoffResponse(BaseModel):
    status: str
    idempotency_key: str
    attempts: int
