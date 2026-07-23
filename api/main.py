from datetime import date
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.orchestrator import NexusOrchestrator
from api.schemas import CaseRequest, DecisionResponse

ROOT = Path(__file__).resolve().parents[1]
orchestrator = NexusOrchestrator(ROOT / "knowledge")

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
