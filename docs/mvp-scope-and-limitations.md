# MVP scope and limitations

## Objective

The NEXUS MVP validates a controlled document-readiness flow for business-account onboarding. It demonstrates that a small, high-impact journey can operate from frontend to API with policy evidence, deterministic rules, audit information, Human-in-the-Loop, and a simulated downstream integration.

The MVP is an engineering-evidence prototype. It is not a production banking service.

## Implemented scope

### Functional scope

The current vertical slice:

- receives a synthetic case through a typed API contract;
- receives structured metadata that represents upstream document analysis;
- retrieves applicable policy paragraphs from a local, controlled corpus;
- checks required-document presence;
- checks the supplied legibility signal;
- validates the supplied issue date for the address document;
- produces a controlled decision and reason code;
- returns policy code, version, excerpt, and retrieval score;
- creates a unique Run ID;
- returns executed rules and audit events;
- controls the current and next process state;
- requires shadow validation before any future submission;
- validates a simulated, idempotent downstream handoff.

### Technical scope

The repository includes:

- React/TanStack frontend;
- FastAPI backend;
- Pydantic contracts;
- deterministic document rules;
- lexical policy retrieval;
- orchestration and state controls;
- automated API and orchestration tests;
- Docker container;
- Docker Compose;
- GitHub Actions;
- Render Blueprint.

## Simulated boundaries

### Document AI

The MVP does not upload or inspect raw documents. It assumes an upstream capability has already produced metadata such as:

- document identifier and type;
- file reference;
- version;
- presence;
- legibility;
- issue date.

In production, those signals would require a governed Document AI service, OCR, extraction confidence, provenance, secure file handling, and human review for uncertain results.

### Banking integration

The downstream integration is a controlled mock. It demonstrates state validation, idempotency, and retries, but it has no access to a real banking system and cannot submit an account request.

### Human workflow

Human review is represented as a required process gate. The MVP does not implement production task queues, workforce assignment, escalation, access control, or reviewer authentication.

## Deliberate architectural decisions

### Deterministic decisioning

The document-readiness decision is rule-based. This was chosen to prioritize:

- predictability;
- inspectability;
- repeatability;
- explicit reason codes;
- straightforward testing;
- safe shadow-mode validation.

A generative model does not participate in the current runtime decision.

### Lexical retrieval

The retriever uses lexical overlap over a small Markdown corpus. It provides inspectable grounding evidence without external infrastructure.

This mechanism is suitable for the controlled prototype but does not represent an enterprise search or vector-retrieval platform. It is also not a complete generative RAG pipeline because the retrieved context is not supplied to a generative model.

### Fail-closed progression

When no applicable policy is retrieved, the system blocks automatic progression and opens human review. The prototype favors false blocks over unsupported automated decisions.

### Synthetic data only

Case IDs, filenames, dates, and business attributes used in the public demonstration are synthetic. Real customer, employee, financial, identity, or confidential case data must not be entered.

## Known limitations

### Data and document processing

- no secure document upload;
- no OCR;
- no image-quality model;
- no document classification model;
- no field extraction;
- no extraction-confidence calibration;
- no malware scanning;
- no real customer data.

### Artificial intelligence

- no generative model in runtime;
- no runtime prompt;
- no generated response evaluation;
- no embedding model;
- no vector database;
- lexical retrieval only;
- no model-monitoring or model-risk workflow.

The architecture can evolve toward generative assistance, but the current MVP should be described as a controlled intelligent-automation prototype with grounding and Human-in-the-Loop.

### Identity and security

- no user authentication;
- no role-based authorization;
- no tenant isolation;
- no production secrets-management integration;
- no rate limiting;
- no Web Application Firewall configuration;
- no penetration-test evidence.

Restricted CORS is not an authentication mechanism.

### Data persistence and observability

- no durable database;
- no immutable audit repository;
- no distributed tracing;
- no production metrics pipeline;
- no alerting;
- no formal retention or deletion policy;
- no service-level objective.

Run IDs and audit events are generated for the response but are not persisted across restarts.

### Operations

- Render Free instances can sleep after inactivity;
- cold starts can delay the first request;
- the demo has no availability commitment;
- in-memory mock state can be lost;
- deployment topology is not designed for scale or high availability.

### Business and process validation

- operational benefits remain hypotheses until measured in shadow mode;
- the MVP does not establish causal impact;
- document rules represent a limited synthetic policy;
- no real policy-owner approval is represented;
- no controlled user pilot has been completed;
- no production integration has been certified.

## Safe-use rules

The public MVP must only be used to:

- demonstrate the flow with synthetic scenarios;
- inspect API contracts;
- validate deterministic rules;
- demonstrate evidence and audit structures;
- discuss architecture and roadmap.

It must not be used to:

- upload real documents;
- process personal or banking data;
- make a real eligibility or account-opening decision;
- perform KYC or fraud determination;
- submit or approve an account request;
- claim production readiness.

## Exit criteria for the next stage

A controlled pilot should require, at minimum:

1. approved document-policy corpus and ownership;
2. governed integration with document capture;
3. authentication and authorization;
4. durable storage for cases, evidence, and audit events;
5. data-protection and retention controls;
6. operational dashboards and alerting;
7. reviewer workflow and escalation;
8. labeled evaluation dataset;
9. false-positive and false-negative thresholds;
10. shadow-mode acceptance criteria;
11. security, compliance, legal, and model-risk review;
12. rollback and incident-response procedures.

## Evolution of generative assistance

If generative capability is introduced, it should begin with lower-risk functions:

- explain the deterministic decision;
- summarize the dossier for the reviewer;
- identify missing information already evidenced by the rules;
- draft customer-facing correction guidance;
- support policy search.

It must not initially:

- override deterministic blocks;
- invent policy;
- approve a case;
- make a fraud or KYC determination;
- submit an account request.

Any generative output should include source evidence, prompt and model versions, validation, abstention behavior, evaluation metrics, and Human-in-the-Loop.
