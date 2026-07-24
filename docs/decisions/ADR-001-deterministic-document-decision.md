# ADR-001: Keep the document-readiness decision deterministic in the MVP

- **Status:** Accepted
- **Date:** 2026-07-24
- **Decision owners:** NEXUS prototype team
- **Scope:** Document-readiness vertical slice

## Context

The NEXUS MVP supports a sensitive business-account onboarding journey. Document errors can create rework and delay, but an unsupported automated decision can also introduce customer, operational, compliance, and reputational risk.

The prototype needed to demonstrate a functional flow within a limited delivery window:

- receive structured document metadata;
- retrieve applicable policy evidence;
- identify incomplete, illegible, or expired documents;
- return an auditable recommendation;
- control the next process state;
- require human supervision;
- simulate a downstream integration.

A generative model was considered as a possible component. However, the public MVP has no approved customer data, production policy corpus, model-risk process, prompt-evaluation dataset, durable audit repository, or production identity controls.

## Decision

The MVP will keep the critical document-readiness decision deterministic.

The runtime will:

1. retrieve policy evidence from a controlled local corpus;
2. execute explicit document rules;
3. produce controlled reason codes;
4. fail closed when grounding is insufficient;
5. expose policy evidence and executed rules;
6. require shadow validation and Human-in-the-Loop;
7. prevent automatic account submission.

A generative model will not be allowed to create, modify, or override the critical decision in this version.

## Rationale

### Predictability

The same structured input and reference date produce the same decision. This is important for demonstration, testing, and investigation.

### Auditability

The response identifies the reason code, policy code and version, retrieved excerpt, executed rules, state transition, and Run ID.

### Controlled risk

The architecture avoids introducing unmeasured hallucination, prompt sensitivity, or model availability into the critical path.

### Efficient validation

The vertical slice can validate process integration, decision boundaries, evidence, fallback behavior, and Human-in-the-Loop before expanding technical complexity.

### Honest scope

The prototype does not label deterministic output as generative AI. Retrieval is described as lexical grounding, not as a complete generative RAG pipeline.

## Alternatives considered

### Alternative 1: Generative model as the final decision maker

**Rejected for the MVP.**

This would require model and prompt evaluation, calibrated confidence, stronger observability, policy controls, adversarial testing, data-protection review, and a clear accountability model. It would also create unnecessary autonomy in a sensitive decision.

### Alternative 2: Generative explanation after deterministic decision

**Deferred.**

This is the preferred first generative evolution because it can improve reviewer and customer communication without controlling the decision. It still requires grounded prompts, structured output validation, abstention, evaluation, versioning, and monitoring.

### Alternative 3: Local model embedded in the API

**Deferred.**

A local model would reduce external-provider dependency but increase container size, memory consumption, cold-start time, build complexity, and operational risk in the current Render Free environment.

### Alternative 4: External model provider

**Deferred.**

This could provide higher-quality generation with lower runtime infrastructure requirements, but it would introduce credentials, third-party data-flow assessment, cost controls, availability dependency, and provider governance.

### Alternative 5: Templates presented as generated responses

**Rejected.**

Rule-based text templates are useful for controlled messages, but presenting them as generative AI would be technically inaccurate.

## Consequences

### Positive

- stable and reproducible demonstration;
- straightforward automated testing;
- explicit reason codes;
- explainable state transitions;
- limited operational dependency;
- safe fallback behavior;
- no model credentials;
- no generated output influencing a critical decision.

### Negative

- the current runtime does not satisfy a literal requirement for a functioning generative model;
- retrieved policy context is not used in generation;
- there are no runtime prompts to version;
- natural-language explanations are limited to controlled recommendations;
- the prototype demonstrates the foundation for generative assistance rather than generative execution.

## Guardrails preserved

- fail closed on insufficient grounding;
- Human-in-the-Loop;
- shadow validation;
- explicit allowed action;
- no automatic submission;
- synthetic data only;
- controlled downstream mock;
- audit events linked to the Run ID.

## Future evolution

The first generative capability should be an optional, non-authoritative assistance layer after deterministic decisioning.

Target flow:

```text
Structured case
      │
      ▼
Policy retrieval
      │
      ▼
Deterministic rules
      │
      ▼
Controlled decision
      │
      ▼
Grounded generative explanation
      │
      ▼
Output validation and abstention
      │
      ▼
Human review
```

Required controls include:

- versioned prompts;
- model and provider version;
- retrieved-source references;
- schema validation;
- grounding and abstention evaluation;
- timeout and fallback;
- prompt-injection testing;
- privacy and data-flow approval;
- quality, risk, latency, and cost metrics;
- immutable audit records.

## Review trigger

This decision must be reviewed before:

- introducing a generative model;
- processing real documents or customer data;
- integrating a production policy corpus;
- increasing automated autonomy;
- connecting to a real banking system.
