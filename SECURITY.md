# Security policy

## Prototype status

NEXUS is a public engineering-evidence MVP. It is not a production banking service and is not approved to process real customer, employee, financial, identity, document, or confidential case data.

The public deployment exists only to demonstrate a controlled synthetic vertical slice.

## Supported security scope

Security fixes are accepted for the current `main` branch. The prototype does not publish versioned production releases or long-term support commitments.

## Reporting a vulnerability

Do not create a public issue containing exploit details, credentials, personal data, or sensitive logs.

Report a suspected vulnerability privately to the repository owner through the contact channel associated with the recruitment delivery. Include:

- affected component;
- reproduction steps using synthetic data;
- expected and observed behavior;
- potential impact;
- suggested mitigation, if known.

Do not test against third-party systems or attempt to access data that does not belong to you.

## Data policy

Only synthetic data may be used.

Prohibited data includes:

- customer or employee personal data;
- identity documents;
- account or payment information;
- credentials, tokens, or API keys;
- confidential business-case files;
- production logs;
- real policy documents that are not approved for publication.

The repository must not contain source spreadsheets, candidate instructions, confidential attachments, or recruiter communications.

## Secrets

Secrets must never be committed.

Use:

- an ignored local `.env` file for local development;
- the hosting platform's secret manager for deployed environments;
- environment variables documented without real values in `.env.example`.

Public frontend variables such as `VITE_NEXUS_API_URL` are not secrets. Any variable exposed through a frontend build must be treated as public.

If a secret is committed:

1. revoke or rotate it immediately;
2. remove it from the current tree;
3. assess whether history rewrite is required;
4. review logs and access;
5. document the incident privately.

Deleting the file in a later commit does not invalidate an exposed secret.

## Current controls

The MVP includes:

- synthetic scenarios;
- typed request and response contracts;
- explicit CORS allowlist;
- non-root API container;
- pinned Python dependencies;
- deterministic document gates;
- fail-closed behavior when grounding is insufficient;
- controlled allowed actions;
- Human-in-the-Loop;
- shadow validation;
- no automatic account submission;
- state validation and idempotency in the integration mock;
- automated API and container checks.

## Known security limitations

The public MVP does not include:

- user authentication;
- role-based authorization;
- rate limiting;
- tenant isolation;
- production secrets-management integration;
- encryption-key management;
- secure raw-document upload;
- malware scanning;
- durable audit storage;
- Web Application Firewall configuration;
- penetration-test evidence;
- Security Information and Event Management integration;
- formal incident-response operation;
- production availability or recovery objectives.

CORS limits browser origins; it does not authenticate callers or prevent direct API requests.

## Safe deployment requirements

Before any use beyond a controlled synthetic demonstration, require:

- private network and access design;
- enterprise identity and authorization;
- secrets management;
- data classification and privacy assessment;
- encryption in transit and at rest;
- secure upload and malware scanning;
- durable, immutable audit storage;
- rate limits and abuse protection;
- dependency and container scanning;
- monitoring and incident response;
- backup, recovery, retention, and deletion controls;
- legal, compliance, security, architecture, and operational approval.

## Generative AI security

The current runtime does not call a generative model.

If generative assistance is added, security review must include:

- approved provider and data-flow assessment;
- prompt-injection and indirect-injection defenses;
- sensitive-data filtering;
- grounded output and source references;
- structured-output validation;
- abstention and fail-closed behavior;
- model and prompt versioning;
- adversarial evaluation;
- cost, latency, availability, and token controls;
- Human-in-the-Loop;
- prevention of autonomous submission or approval.

## Responsible demonstration

A demonstration must not:

- upload real files;
- use real customer identifiers;
- attempt to bypass state controls;
- present the mock integration as a real banking connection;
- represent the prototype as production ready.

Use the scenarios in [docs/demo-runbook.md](docs/demo-runbook.md).
