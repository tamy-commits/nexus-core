from datetime import date
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from api.orchestrator import NexusOrchestrator
from api.banking_gateway import BankingTimeoutError, MockBankingGateway
from api.schemas import CaseRequest, DecisionResponse, HandoffRequest, HandoffResponse

ROOT = Path(__file__).resolve().parents[1]
orchestrator = NexusOrchestrator(ROOT / "knowledge")
banking_gateway = MockBankingGateway()

app = FastAPI(title="NEXUS Executable Evidence API", version="0.1.0")
app.add_middleware(CORSMiddleware, allow_origins=["http://localhost:3000", "http://localhost:5173"], allow_methods=["*"], allow_headers=["*"])


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "mode": "DEMO"}


@app.post("/v1/cases/analyze", response_model=DecisionResponse)
def analyze_case(request: CaseRequest) -> DecisionResponse:
    return orchestrator.analyze(request)


@app.post("/v1/cases/analyze-demo", response_model=DecisionResponse)
def analyze_demo_case(request: CaseRequest) -> DecisionResponse:
    """Pins the clock so the interview scenario remains deterministic."""
    return orchestrator.analyze(request, today=date(2026, 8, 20))


@app.post("/v1/integrations/banking/validate-handoff", response_model=HandoffResponse)
def validate_handoff(request: HandoffRequest) -> HandoffResponse:
    try:
        result = banking_gateway.validate_handoff(
            case_id=request.case_id,
            state=request.state,
            idempotency_key=request.idempotency_key,
            failures_before_success=request.failures_before_success,
        )
    except ValueError as error:
        raise HTTPException(status_code=409, detail=str(error)) from error
    except BankingTimeoutError as error:
        raise HTTPException(status_code=503, detail=str(error)) from error
    return HandoffResponse(
        status=result.status,
        idempotency_key=result.idempotency_key,
        attempts=result.attempts,
    )
