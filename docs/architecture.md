# NEXUS architecture

## Purpose

NEXUS demonstrates a controlled vertical slice for document readiness in business-account onboarding. The architecture separates document capture, policy grounding, deterministic decisioning, human supervision, and downstream integration so that each responsibility can evolve independently.

The prototype uses synthetic data and does not perform a real banking operation.

## Context

The operational problem is document-related rework discovered after a customer dossier has entered the backoffice flow. The target design moves document-readiness checks closer to the source while preserving human judgment for risk, KYC, exceptions, and any action that could affect a real account-opening process.

## System context

```text
Customer channel
      │
      ▼
Document capture / Document AI
(simulated in this MVP)
      │ structured metadata
      ▼
NEXUS frontend
      │ HTTPS/JSON
      ▼
NEXUS FastAPI
      │
      ├── Policy retrieval
      ├── Document rules
      ├── Orchestration and state control
      ├── Evidence and audit construction
      └── Controlled handoff validation
               │
               ▼
       Human review / shadow mode
               │
               ▼
       Banking services
       (mocked in this MVP)
```

## Components and responsibilities

### 1. Simulated document-capture layer

This layer is outside the implemented vertical slice. In a production design it would be responsible for:

- secure file upload;
- malware scanning;
- OCR and field extraction;
- document classification;
- image-quality assessment;
- document-date extraction;
- confidence scores and provenance.

The MVP represents this boundary through structured metadata sent to the API. It does not claim to read or classify raw documents.

### 2. Frontend

The React/TanStack frontend:

- presents controlled synthetic scenarios;
- calls the NEXUS API asynchronously;
- displays execution mode and the latest Run ID;
- prevents repeated execution while a request is in progress;
- records a technical fallback when the API is unavailable;
- does not submit a real account-opening request.

The production build uses the published Render API URL and remains in `DEMO` mode.

### 3. FastAPI contract

The API exposes:

| Endpoint | Responsibility |
|---|---|
| `GET /health` | Service availability and execution mode |
| `POST /v1/cases/analyze` | Analyze structured document metadata |
| `POST /v1/cases/analyze-demo` | Reproducible analysis with a pinned reference date |
| `POST /v1/integrations/banking/validate-handoff` | Validate a controlled downstream handoff |

Pydantic schemas enforce input and output contracts.

### 4. Policy retriever

The retriever:

- reads Markdown policies from the controlled `knowledge/` directory;
- extracts policy code and version;
- tokenizes the query and policy paragraphs;
- ranks paragraphs by lexical overlap;
- returns a limited set of evidence chunks and scores.

If no applicable evidence reaches the threshold, the orchestrator blocks automatic progress and requires human review.

This is an inspectable lexical retrieval mechanism. The current runtime does not send the retrieved context to a generative model.

### 5. Deterministic document rules

The rule layer checks the structured signals for:

- required document presence;
- document legibility;
- address-document validity;
- other explicitly implemented document gates.

Rules return controlled reason codes such as:

- `DOC_INCOMPLETO`;
- `DOC_ILEGIVEL`;
- `DOC_VENCIDO`.

The rule layer does not infer fraud, KYC risk, or information that was not provided in the structured input.

### 6. Orchestrator

The orchestrator coordinates:

1. Run ID creation;
2. policy retrieval;
3. grounding guardrail;
4. deterministic rule evaluation;
5. decision and reason-code construction;
6. recommendation and allowed-action construction;
7. state transition;
8. evidence packaging;
9. audit-event packaging.

The orchestrator can produce three controlled decisions:

| Decision | Meaning |
|---|---|
| `CORRECAO_NECESSARIA` | A document issue must be corrected before continuation |
| `PRONTA_PARA_SUBMISSAO` | Document gates passed, but only shadow validation is allowed |
| `REVISAO_HUMANA` | Evidence or certainty is insufficient for automatic progress |

A successful document check does not authorize a real submission.

### 7. State and Human-in-the-Loop controls

State transitions prevent the MVP from presenting document readiness as final banking approval.

The maximum automated preparation state is followed by:

```text
PRONTA_PARA_SUBMISSAO
          │
          ▼
EM_VALIDACAO_SOMBRA
          │
          ▼
Human decision
```

Human review remains responsible for exceptions, risk, KYC, policy ambiguity, and any future increase in autonomy.

### 8. Audit and observability evidence

Each analysis returns:

- unique Run ID;
- case ID;
- mode;
- decision;
- reason code;
- confidence indicator;
- current and next state;
- recommendation;
- allowed action;
- human-review flag;
- executed rules;
- policy evidence;
- audit events.

The current audit trail is response-scoped and not durably persisted. Production evolution requires immutable storage, access control, retention rules, distributed tracing, and operational alerting.

### 9. Controlled banking gateway

The mock gateway demonstrates:

- state validation;
- idempotency;
- retry behavior;
- rejection of unapproved states;
- isolation from any real banking system.

It never creates or submits an account-opening request.

## Key design principles

### Fail closed

Insufficient grounding, invalid state, or integration failure must block progression instead of guessing.

### Deterministic critical decision

Document readiness is calculated from explicit rules and structured inputs. The runtime does not allow unconstrained generation to change the decision.

### Evidence before autonomy

Every recommendation must carry policy evidence, reason codes, and executed rules before any future increase in automation.

### Human supervision

Human review is part of the architecture, not an exception added after implementation.

### Synthetic data boundary

The public demonstration uses synthetic case data only. Real customer information is outside the approved scope.

## Deployment topology

```text
Lovable-hosted frontend
          │
          │ HTTPS
          ▼
Render Free web service
   Docker / FastAPI
          │
          ├── Local policy files
          └── In-memory mock state
```

The Render service:

- runs as a non-root user;
- uses an explicit CORS allowlist;
- exposes `/health`;
- uses the platform-provided port;
- can spin down after inactivity;
- has no production service-level objective.

## Trust boundaries

| Boundary | Main concern | MVP control |
|---|---|---|
| Browser → API | Untrusted input and origin | Pydantic validation and CORS allowlist |
| API → knowledge | Incorrect or absent policy | Versioned evidence and fail-closed retrieval |
| Rules → state transition | Unauthorized progress | Controlled decisions and shadow-mode gate |
| NEXUS → banking integration | Duplicate or invalid handoff | Idempotency, retries, and state validation |
| Public demo → customer data | Confidentiality | Synthetic data only |

## Production prerequisites

Before production use, the architecture would require:

- enterprise authentication and authorization;
- secure upload and governed Document AI;
- encryption and secrets management;
- durable case, evidence, and audit storage;
- policy approval and publishing workflow;
- data classification, retention, and deletion controls;
- monitoring, tracing, alerting, and service objectives;
- model governance if generative assistance is introduced;
- security, legal, compliance, model-risk, and operational approval;
- controlled shadow validation with measurable exit criteria.
