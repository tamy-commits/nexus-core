# NEXUS

NEXUS is a controlled document-readiness MVP for business-account onboarding. It receives structured metadata from a simulated document-capture layer, retrieves the applicable policy, evaluates deterministic document rules, and returns an auditable recommendation with evidence, a unique Run ID, state transitions, and Human-in-the-Loop controls.

The prototype demonstrates a functional vertical slice from the user interface to the API and a controlled banking-integration mock. It is designed for interview and engineering-evidence purposes; it is not a production banking service and must not process real customer data.

- **Frontend:** https://nexus-blueprint-core.lovable.app
- **API:** https://nexus-executable-evidence-api.onrender.com
- **Health check:** https://nexus-executable-evidence-api.onrender.com/health

> The Render Free instance can spin down after inactivity. The first request may take about one minute while the service wakes up.

## What the MVP proves

- a working frontend-to-API flow;
- deterministic checks for document presence, legibility, and validity;
- retrieval of versioned policy evidence;
- fail-closed behavior when grounding is insufficient;
- unique Run IDs, reason codes, executed rules, and audit events;
- controlled state transitions and mandatory shadow validation;
- Human-in-the-Loop for cases that require supervision;
- an idempotent banking-handoff mock with retry behavior;
- automated API tests and container validation;
- a public, controlled deployment for demonstration.

## Scope boundary

NEXUS does **not** upload, read, or extract information directly from PDF or image files. The vertical slice assumes that an upstream Document AI or capture service has already produced structured signals such as:

- document type and identifier;
- presence;
- legibility;
- issue date and validity;
- document version.

The current runtime does not call a generative model. The decision path is intentionally deterministic so the MVP can validate the process, integration, evidence, guardrails, and shadow-mode behavior before introducing generative variability.

See:

- [Architecture](docs/architecture.md)
- [MVP scope and limitations](docs/mvp-scope-and-limitations.md)
- [Deterministic decision ADR](docs/decisions/ADR-001-deterministic-document-decision.md)
- [Demo runbook](docs/demo-runbook.md)
- [Security policy](SECURITY.md)

## Architecture at a glance

```text
Frontend
   │
   ▼
FastAPI contract
   │
   ├── Policy retriever ──► Versioned policy evidence
   │
   ├── Deterministic document rules
   │
   ├── State machine and guardrails
   │
   └── Run ID and audit trail
            │
            ▼
   Human review / shadow validation
            │
            ▼
   Controlled banking-handoff mock
```

## Repository structure

```text
.
├── .github/workflows/        Continuous integration
├── api/                      FastAPI service, rules and orchestration
├── docs/                     Architecture, scope, decisions and demo guidance
├── knowledge/                Versioned policy used for grounding
├── src/                      React/TanStack frontend
├── tests/                    API and orchestration tests
├── .env.example              Safe local configuration example
├── Dockerfile.api            Non-root API container
├── docker-compose.yml        Local API and frontend composition
├── render.yaml               Render Blueprint definition
├── requirements.txt          Python dependencies
└── package.json              Frontend dependencies and scripts
```

## Decision flow

1. The API receives a synthetic case and structured document metadata.
2. The retriever searches the controlled policy corpus.
3. If no applicable evidence is found, the flow fails closed and opens human review.
4. Deterministic rules evaluate required documents, legibility, and validity.
5. The orchestrator creates a decision, reason code, recommendation, allowed action, state transition, evidence, and audit trail.
6. A case that passes the document gates can only proceed to shadow validation.
7. The mock banking handoff blocks unapproved states and never submits an account-opening request.

## API contract

### Health check

```http
GET /health
```

Expected response:

```json
{
  "status": "ok",
  "mode": "DEMO"
}
```

### Analyze a case

```http
POST /v1/cases/analyze
Content-Type: application/json
```

Example using synthetic data:

```json
{
  "case_id": "NXS-2026-0148",
  "segment": "Silver",
  "request_type": "Abertura de conta empresarial",
  "documents": [
    {
      "id": "contrato",
      "label": "Contrato social",
      "file": "contrato.pdf",
      "version": 1,
      "present": true,
      "readable": true
    },
    {
      "id": "repr",
      "label": "Representantes",
      "file": "representantes.zip",
      "version": 1,
      "present": true,
      "readable": true
    },
    {
      "id": "endereco",
      "label": "Comprovante de endereço",
      "file": "endereco.pdf",
      "version": 1,
      "issued_at": "2026-08-15",
      "present": true,
      "readable": true
    },
    {
      "id": "form",
      "label": "Formulário",
      "file": "formulario.pdf",
      "version": 1,
      "present": true,
      "readable": true
    },
    {
      "id": "poderes",
      "label": "Poderes de representação",
      "file": "poderes.pdf",
      "version": 1,
      "present": true,
      "readable": true
    }
  ]
}
```

For the controlled interview scenario, use:

```http
POST /v1/cases/analyze-demo
```

The demo endpoint pins the reference date so the expected outcome remains reproducible.

### Validate a simulated banking handoff

```http
POST /v1/integrations/banking/validate-handoff
```

Only the approved preparation state is accepted. The mock supports retry and idempotency evidence but never performs a real banking operation.

Interactive API documentation is available at:

- https://nexus-executable-evidence-api.onrender.com/docs

## Local execution

### Prerequisites

- Python 3.12
- Node.js 22
- npm or Bun
- Docker, optional

### API

```sh
python -m venv .venv
. .venv/bin/activate
python -m pip install -r requirements.txt
uvicorn api.main:app --host 0.0.0.0 --port 8000
```

On Windows PowerShell, activate the environment with:

```powershell
.venv\Scripts\Activate.ps1
```

### Frontend

```sh
npm install
npm run dev
```

The local frontend uses the values documented in [`.env.example`](.env.example).

### Docker Compose

```sh
docker compose up --build
```

## Tests and validation

Run the Python test suite:

```sh
python -m pytest -q
```

Build the frontend:

```sh
npm run build
```

Build the API container:

```sh
docker build --file Dockerfile.api --tag nexus-api:local .
```

The GitHub Actions workflow validates the Python tests and the API container for relevant changes.

## Configuration

| Variable | Purpose | Example |
|---|---|---|
| `VITE_NEXUS_API_URL` | Public or local API base URL | `http://localhost:8000` |
| `VITE_NEXUS_EXECUTION_MODE` | Frontend execution indicator | `DEMO` |
| `ALLOWED_ORIGINS` | Comma-separated CORS allowlist | `http://localhost:3000` |

Never commit credentials or customer data. Local secrets belong in an ignored `.env` file or in the hosting platform's secret manager.

## Deployment

[`render.yaml`](render.yaml) defines a Docker web service with:

- `/health` as the health-check path;
- deployment after repository checks pass;
- an explicit CORS allowlist;
- the platform-provided `PORT`;
- execution as a non-root container user;
- a Free instance suitable only for the controlled demonstration.

The production frontend configuration points to the published Render API while preserving `DEMO` execution.

## Safety model

The current controls include:

- synthetic data only;
- deterministic document gates;
- fail-closed grounding;
- explicit allowed actions;
- restricted CORS;
- no credentials in the repository;
- no automatic account submission;
- mandatory human review for shadow validation;
- audit events tied to the runtime Run ID;
- idempotent simulated handoff.

Read [SECURITY.md](SECURITY.md) before adapting the prototype for another environment.

## Known limitations

- no raw document upload, OCR, or image-quality model;
- no production authentication or authorization;
- no durable database or distributed telemetry;
- lexical retrieval over a small, local policy corpus;
- no generative model in the current runtime;
- no real core-banking integration;
- no production service-level objective;
- Human-in-the-Loop represented as a controlled prototype gate.

These limitations are deliberate and are documented in detail in [MVP scope and limitations](docs/mvp-scope-and-limitations.md).

## Evolution path

A controlled evolution would:

1. integrate a governed Document AI service;
2. persist cases, evidence, policies, and audit events;
3. implement enterprise identity and authorization;
4. introduce generative assistance first for explanation and summarization;
5. evaluate groundedness, abstention, false positives, and false negatives;
6. run shadow validation before increasing autonomy;
7. integrate with real banking services only after security and operational approval.

## Technology

- React and TypeScript
- TanStack Start
- Tailwind CSS
- FastAPI and Pydantic
- Pytest and HTTPX
- Docker and Docker Compose
- GitHub Actions
- Render
- Lovable
