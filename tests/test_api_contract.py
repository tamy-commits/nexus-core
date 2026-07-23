from fastapi.testclient import TestClient

from api.main import app


client = TestClient(app)


def payload() -> dict:
    return {
        "case_id": "NXS-2026-0148",
        "segment": "Silver",
        "request_type": "Abertura de conta empresarial",
        "documents": [
            {"id": "contrato", "label": "Contrato", "file": "c.pdf"},
            {"id": "repr", "label": "Representantes", "file": "r.zip"},
            {
                "id": "endereco",
                "label": "Comprovante",
                "file": "e.pdf",
                "issued_at": "2026-08-15",
            },
            {"id": "form", "label": "Formulário", "file": "f.pdf"},
            {"id": "poderes", "label": "Poderes", "file": "p.pdf"},
        ],
    }


def test_health_and_demo_contract():
    assert client.get("/health").json() == {"status": "ok", "mode": "DEMO"}
    response = client.post("/v1/cases/analyze-demo", json=payload())
    assert response.status_code == 200
    body = response.json()
    assert body["current_state"] == "PRONTA_PARA_SUBMISSAO"
    assert body["next_state"] == "EM_VALIDACAO_SOMBRA"
    assert body["human_review_required"] is True
    assert body["evidence"][0]["policy_code"] == "POL-DOC-PJ-02"


def test_cors_allows_the_public_frontend():
    response = client.options(
        "/v1/cases/analyze-demo",
        headers={
            "Origin": "https://nexus-blueprint-core.lovable.app",
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "content-type",
        },
    )
    assert response.status_code == 200
    assert (
        response.headers["access-control-allow-origin"]
        == "https://nexus-blueprint-core.lovable.app"
    )


def test_cors_does_not_authorize_unknown_origins():
    response = client.options(
        "/v1/cases/analyze-demo",
        headers={
            "Origin": "https://untrusted.example",
            "Access-Control-Request-Method": "POST",
        },
    )
    assert "access-control-allow-origin" not in response.headers


def test_gateway_retries_and_is_idempotent():
    request = {
        "case_id": "NXS-2026-0148",
        "state": "PRONTA_PARA_SUBMISSAO",
        "idempotency_key": "NXS-2026-0148-v1",
        "failures_before_success": 2,
    }
    first = client.post("/v1/integrations/banking/validate-handoff", json=request)
    second = client.post("/v1/integrations/banking/validate-handoff", json=request)
    assert first.status_code == 200
    assert first.json()["attempts"] == 3
    assert second.json() == first.json()


def test_gateway_blocks_unapproved_state():
    response = client.post(
        "/v1/integrations/banking/validate-handoff",
        json={
            "case_id": "NXS-2026-0148",
            "state": "AGUARDANDO_CORRECAO",
            "idempotency_key": "blocked",
        },
    )
    assert response.status_code == 409
