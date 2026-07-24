# NEXUS demo runbook

## Purpose

This runbook provides a reproducible demonstration of the NEXUS document-readiness vertical slice. All examples are synthetic.

## Public endpoints

- Frontend: https://nexus-blueprint-core.lovable.app
- API: https://nexus-executable-evidence-api.onrender.com
- Health: https://nexus-executable-evidence-api.onrender.com/health
- OpenAPI: https://nexus-executable-evidence-api.onrender.com/docs

## Before the demonstration

1. Open the health endpoint.
2. Allow up to one minute for the Render Free instance to wake.
3. Confirm the response:

```json
{
  "status": "ok",
  "mode": "DEMO"
}
```

4. Open the frontend.
5. Confirm that the execution indicator is visible.
6. Use only the synthetic scenarios included in the prototype.

Do not enter customer, employee, identity, financial, or confidential case data.

## Executive narrative

The demonstration should make four boundaries clear:

1. the upstream Document AI layer is simulated;
2. the API receives structured document metadata, not raw documents;
3. document-readiness decisions are deterministic and auditable;
4. no real account-opening request is submitted.

Suggested opening:

> NEXUS demonstrates a controlled document-readiness vertical slice. The MVP receives structured signals from a simulated capture layer, retrieves the applicable policy, executes deterministic gates, and returns an auditable next step with Human-in-the-Loop.

## Scenario 1: Valid document set

### Objective

Demonstrate that a valid synthetic dossier can reach shadow validation, but not automatic submission.

### Expected evidence

- a unique Run ID;
- decision `PRONTA_PARA_SUBMISSAO`;
- current state `PRONTA_PARA_SUBMISSAO`;
- next state `EM_VALIDACAO_SOMBRA`;
- policy `POL-DOC-PJ-02`, version `3.1`;
- `human_review_required: true`;
- no real submission action.

### API request

Use `POST /v1/cases/analyze-demo`:

```json
{
  "case_id": "NXS-2026-0148",
  "segment": "Silver",
  "request_type": "Abertura de conta empresarial",
  "documents": [
    {
      "id": "contrato",
      "label": "Contrato social",
      "file": "contrato.pdf"
    },
    {
      "id": "repr",
      "label": "Representantes",
      "file": "representantes.zip"
    },
    {
      "id": "endereco",
      "label": "Comprovante de endereço",
      "file": "endereco.pdf",
      "issued_at": "2026-08-15"
    },
    {
      "id": "form",
      "label": "Formulário",
      "file": "formulario.pdf"
    },
    {
      "id": "poderes",
      "label": "Poderes de representação",
      "file": "poderes.pdf"
    }
  ]
}
```

## Scenario 2: Illegible document

### Objective

Demonstrate controlled correction when the upstream capture signal marks a document as illegible.

Change one document to:

```json
{
  "id": "endereco",
  "label": "Comprovante de endereço",
  "file": "endereco.pdf",
  "issued_at": "2026-08-15",
  "readable": false
}
```

### Expected evidence

- decision `CORRECAO_NECESSARIA`;
- reason code `DOC_ILEGIVEL`;
- state `AGUARDANDO_CORRECAO`;
- applicable policy evidence;
- recommendation to replace or correct the document;
- no downstream submission.

## Scenario 3: Expired address document

### Objective

Demonstrate a date-dependent policy rule using the reproducible demo clock.

Set the address issue date to:

```json
{
  "id": "endereco",
  "label": "Comprovante de endereço",
  "file": "endereco.pdf",
  "issued_at": "2026-05-15"
}
```

### Expected evidence

- decision `CORRECAO_NECESSARIA`;
- reason code `DOC_VENCIDO`;
- policy `POL-DOC-PJ-02`;
- state `AGUARDANDO_CORRECAO`;
- no automatic progress.

## Scenario 4: Missing required document

### Objective

Demonstrate a completeness gate.

Remove the `contrato` document from the request.

### Expected evidence

- decision `CORRECAO_NECESSARIA`;
- reason code `DOC_INCOMPLETO`;
- state `AGUARDANDO_CORRECAO`;
- controlled correction recommendation.

## Scenario 5: Insufficient grounding

### Objective

Explain the fail-closed architecture.

The public deployment includes the policy corpus, so this scenario is primarily demonstrated by the automated test that initializes the orchestrator with an empty knowledge directory.

Expected behavior:

- decision `REVISAO_HUMANA`;
- reason code `GROUNDING_INSUFICIENTE`;
- empty evidence list;
- `human_review_required: true`;
- automatic progress blocked.

Reference test:

```text
tests/test_orchestrator.py
test_insufficient_grounding_requires_human_review
```

## Scenario 6: Controlled banking handoff

### Objective

Demonstrate integration behavior without a real banking operation.

Use:

```http
POST /v1/integrations/banking/validate-handoff
```

Valid synthetic request:

```json
{
  "case_id": "NXS-2026-0148",
  "state": "PRONTA_PARA_SUBMISSAO",
  "idempotency_key": "NXS-2026-0148-v1",
  "failures_before_success": 2
}
```

Expected behavior:

- retries are represented;
- repeated use of the same idempotency key returns the same result;
- unapproved states return HTTP 409;
- nothing is submitted to a banking platform.

## API-unavailable fallback

If the API is unavailable:

- the frontend displays `FALLBACK`;
- the scenario records `API_INDISPONIVEL`;
- the case receives a technical block;
- documents are not changed;
- state progression is prevented.

The fallback is a safety behavior, not a successful analysis.

## Recommended 5-minute technical sequence

| Time | Demonstration |
|---:|---|
| 0:00–0:40 | Explain the process problem and vertical-slice boundary |
| 0:40–1:20 | Show the frontend and execution mode |
| 1:20–2:20 | Run the valid scenario and show Run ID, evidence, and shadow validation |
| 2:20–3:15 | Run an illegible or expired document scenario |
| 3:15–4:00 | Show the audit timeline and policy version |
| 4:00–4:35 | Explain fail-closed and Human-in-the-Loop |
| 4:35–5:00 | Clarify limitations and production evolution |

## Troubleshooting

### Render is waking up

Symptom: first request is slow or times out.

Action:

1. open `/health`;
2. wait for the service to return `status: ok`;
3. refresh the frontend;
4. run the scenario again.

### Frontend displays FALLBACK

Action:

1. confirm the API health endpoint;
2. confirm browser connectivity;
3. retry after the Render service wakes;
4. do not present the fallback result as an API decision.

### Unexpected document-date result

Use `/v1/cases/analyze-demo` for reproducibility. The endpoint pins the analysis date to the controlled interview scenario.

### CORS error

The public frontend origin must remain in `ALLOWED_ORIGINS`. Unknown origins are intentionally not authorized.

## Claims to avoid

Do not state that the MVP:

- reads the content of PDFs or images;
- performs OCR;
- detects fraud;
- performs KYC;
- contains a generative model in runtime;
- autonomously approves accounts;
- submits data to a real banking system;
- is production ready.

## Closing statement

> The MVP proves the controlled operating core: integration contract, policy grounding, deterministic gates, evidence, auditability, fail-closed behavior, and Human-in-the-Loop. Document extraction, production identity, durable observability, and generative assistance remain governed evolution stages.
