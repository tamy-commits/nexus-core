export type ProcessState =
  | "CRIADA"
  | "EM_PREPARACAO"
  | "AGUARDANDO_CORRECAO"
  | "EM_REVISAO_HUMANA"
  | "PRONTA_PARA_SUBMISSAO"
  | "EM_VALIDACAO_SOMBRA"
  | "ENCAMINHADA_AO_N2"
  | "ENCAMINHADA_TRATAMENTO_ESPECIALIZADO"
  | "CANCELADA";

export type TechCondition = "NORMAL" | "AGUARDANDO_RETRY" | "BLOQUEADO_TECNICO";

export type StepKey =
  | "Contexto"
  | "Política"
  | "Documentos"
  | "Decisão"
  | "Revisão"
  | "Handoff";

export const STEPS: StepKey[] = [
  "Contexto",
  "Política",
  "Documentos",
  "Decisão",
  "Revisão",
  "Handoff",
];

export type DocStatus =
  | "Atendido"
  | "Correção necessária"
  | "Em revalidação"
  | "Pendente"
  | "Bloqueado";

export interface DocItem {
  id: string;
  label: string;
  file: string;
  version: number;
  validity?: string;
  status: DocStatus;
  finding?: string;
  rule?: string;
  reasonCode?: string;
  action?: string;
  highlight?: boolean;
}

export interface PolicyRef {
  code: string;
  title: string;
  version: string;
  validity: string;
  badge: "Fonte utilizável" | "Conflito" | "Revisão necessária";
  excerpts: string[];
}

export interface AuditEvent {
  id: string;
  time: string;
  actor: string;
  action: string;
  from?: string;
  to?: string;
  rule?: string;
  finding?: string;
  version?: string;
  justification?: string;
}

export interface EvidenceItem {
  id: string;
  claim: string;
  finding?: string;
  rule?: string;
  policyCode: string;
  policyVersion: string;
  policyValidity: string;
  excerpt: string;
  timestamp: string;
}

export interface Scenario {
  key: "A" | "B" | "C" | "D";
  featured?: boolean;
  category: string;
  title: string;
  short: string;
  risk: string;
  /** Estado ao instanciar o caso — nunca é alterado durante a execução. */
  initialState: ProcessState;
  /** Estado corrente do processo — muda por ação autorizada. */
  currentState: ProcessState;
  /** Próxima transição proposta pelo agente (não executada automaticamente). */
  nextState: ProcessState;
  duration: string;
  caseId: string;
  client: string;
  segment: "Silver" | "Gold";
  channel: string;
  requestType: string;
  origin: string;
  tech: TechCondition;
  currentStep: StepKey;
  policies: PolicyRef[];
  documents: DocItem[];
  findings: string[];
  rulesExecuted: string[];
  recommendation: string;
  authorizedAction: string;
  grounding: string;
  groundingStatus: "ok" | "insuficiente";
  evidences: EvidenceItem[];
  audit: AuditEvent[];
  lastUpdate: string;
  humanReview?: {
    reason: string;
    recommendation: string;
  };
}

const basePolicyDoc: PolicyRef = {
  code: "POL-DOC-PJ-02",
  title: "Documentação para abertura de conta PJ",
  version: "3.1",
  validity: "01/07/2026 a 31/12/2026",
  badge: "Fonte utilizável",
  excerpts: [
    "Comprovante de endereço deve ter emissão inferior a 90 dias na data da submissão.",
    "Contrato social consolidado é obrigatório e deve refletir a composição societária vigente.",
  ],
};

export const SCENARIOS: Scenario[] = [
  {
    key: "A",
    featured: true,
    category: "Correção documental",
    title: "Correção documental",
    short:
      "Cliente com documentação quase pronta, exceto por um comprovante de endereço vencido.",
    risk: "Submissão bloqueada por documento fora de validade.",
    initialState: "AGUARDANDO_CORRECAO",
    currentState: "AGUARDANDO_CORRECAO",
    nextState: "EM_PREPARACAO",
    duration: "≈ 3 min",
    caseId: "NXS-2026-0148",
    client: "Aurora Comércio Digital Ltda.",
    segment: "Silver",
    channel: "Agência",
    requestType: "Abertura de conta empresarial",
    origin: "Agência 0421 — Gerente PJ",
    tech: "NORMAL",
    currentStep: "Documentos",
    policies: [basePolicyDoc],
    documents: [
      { id: "contrato", label: "Contrato social", file: "contrato_social_v2.pdf", version: 2, status: "Atendido" },
      { id: "repr", label: "Documento dos representantes", file: "documentos_representantes.zip", version: 1, status: "Atendido" },
      {
        id: "endereco",
        label: "Comprovante de endereço",
        file: "comprovante_endereco_v1.pdf",
        version: 1,
        validity: "15/05/2026",
        status: "Correção necessária",
        finding: "Documento emitido há mais de 90 dias.",
        rule: "R-DOC-04",
        reasonCode: "DOC_VENCIDO",
        action: "Simular envio de nova versão",
        highlight: true,
      },
      { id: "form", label: "Formulário de abertura", file: "formulario_abertura.pdf", version: 1, status: "Atendido" },
      { id: "poderes", label: "Evidência de poderes de representação", file: "procuracao_v1.pdf", version: 1, status: "Atendido" },
    ],
    findings: ["DOC_VENCIDO — Comprovante de endereço fora da janela de 90 dias."],
    rulesExecuted: ["R-DOC-01", "R-DOC-04", "R-KYC-02"],
    recommendation:
      "Solicitar reenvio do comprovante de endereço com emissão recente.",
    authorizedAction: "Aguardar nova versão do documento antes da submissão.",
    grounding: "Finding fundamentado em POL-DOC-PJ-02 v3.1, cláusula de validade de 90 dias.",
    groundingStatus: "ok",
    evidences: [
      {
        id: "ev-a-1",
        claim: "Comprovante de endereço fora da janela de 90 dias.",
        finding: "DOC_VENCIDO",
        rule: "R-DOC-04",
        policyCode: "POL-DOC-PJ-02",
        policyVersion: "3.1",
        policyValidity: "01/07/2026 a 31/12/2026",
        excerpt: "Comprovante de endereço deve ter emissão inferior a 90 dias na data da submissão.",
        timestamp: "09:13",
      },
    ],
    lastUpdate: "09:13",
    audit: [
      { id: "a1", time: "09:12", actor: "Agente", action: "Caso instanciado", to: "AGUARDANDO_CORRECAO" },
      { id: "a2", time: "09:12", actor: "Regra", action: "Recuperação de política", rule: "POL-DOC-PJ-02 v3.1" },
      { id: "a3", time: "09:13", actor: "Regra", action: "Validação de documentos", rule: "R-DOC-04", finding: "DOC_VENCIDO" },
    ],
  },
  {
    key: "B",
    category: "Política conflitante",
    title: "Política conflitante",
    short:
      "Duas políticas recuperadas apresentam exigências divergentes para o mesmo caso.",
    risk: "Decisão automática inviável sem arbitragem humana.",
    initialState: "EM_PREPARACAO",
    currentState: "EM_PREPARACAO",
    nextState: "EM_REVISAO_HUMANA",
    duration: "≈ 4 min",
    caseId: "NXS-2026-0151",
    client: "Horizonte Serviços Integrados Ltda.",
    segment: "Gold",
    channel: "Agência",
    requestType: "Abertura de conta empresarial",
    origin: "Agência 0132 — Gerente PJ Gold",
    tech: "NORMAL",
    currentStep: "Política",
    policies: [
      { ...basePolicyDoc, badge: "Conflito" },
      {
        code: "POL-KYC-PJ-04",
        title: "Diligência reforçada para clientes Gold",
        version: "2.2",
        validity: "01/03/2026 a 28/02/2027",
        badge: "Conflito",
        excerpts: [
          "Clientes Gold exigem verificação presencial adicional do responsável legal.",
          "Exceção documental de POL-DOC-PJ-02 não se aplica ao segmento Gold.",
        ],
      },
    ],
    documents: [
      { id: "contrato", label: "Contrato social", file: "contrato_social_v3.pdf", version: 3, status: "Atendido" },
      { id: "repr", label: "Documento dos representantes", file: "docs_repr.zip", version: 1, status: "Atendido" },
      { id: "endereco", label: "Comprovante de endereço", file: "comprovante_endereco_v1.pdf", version: 1, validity: "10/07/2026", status: "Atendido" },
      { id: "form", label: "Formulário de abertura", file: "formulario_abertura.pdf", version: 1, status: "Atendido" },
      { id: "poderes", label: "Evidência de poderes de representação", file: "procuracao_v2.pdf", version: 2, status: "Pendente", finding: "Verificação presencial pendente." },
    ],
    findings: [
      "POL_CONFLITO — POL-DOC-PJ-02 e POL-KYC-PJ-04 divergem sobre verificação presencial.",
    ],
    rulesExecuted: ["R-POL-01", "R-POL-07"],
    recommendation:
      "Não foi possível determinar de forma segura a política aplicável. Encaminhar para revisão humana.",
    authorizedAction: "Bloquear avanço automático e abrir revisão humana.",
    grounding: "Sem evidência suficiente — decisão automática bloqueada.",
    groundingStatus: "insuficiente",
    evidences: [
      {
        id: "ev-b-1",
        claim: "Divergência entre políticas sobre verificação presencial.",
        finding: "POL_CONFLITO",
        rule: "R-POL-07",
        policyCode: "POL-DOC-PJ-02",
        policyVersion: "3.1",
        policyValidity: "01/07/2026 a 31/12/2026",
        excerpt: "Contrato social consolidado é obrigatório e deve refletir a composição societária vigente.",
        timestamp: "10:05",
      },
      {
        id: "ev-b-2",
        claim: "Exceção documental não se aplica ao segmento Gold.",
        finding: "POL_CONFLITO",
        rule: "R-POL-07",
        policyCode: "POL-KYC-PJ-04",
        policyVersion: "2.2",
        policyValidity: "01/03/2026 a 28/02/2027",
        excerpt: "Exceção documental de POL-DOC-PJ-02 não se aplica ao segmento Gold.",
        timestamp: "10:05",
      },
    ],
    lastUpdate: "10:05",
    humanReview: {
      reason: "Políticas recuperadas apresentam exigências conflitantes.",
      recommendation:
        "Adjudicação humana obrigatória — o agente se abstém de escolher entre políticas em conflito.",
    },
    audit: [
      { id: "b1", time: "10:04", actor: "Agente", action: "Caso instanciado", to: "EM_PREPARACAO" },
      { id: "b2", time: "10:04", actor: "Regra", action: "Recuperação de políticas", rule: "POL-DOC-PJ-02 v3.1 + POL-KYC-PJ-04 v2.2" },
      { id: "b3", time: "10:05", actor: "Regra", action: "Detecção de conflito", rule: "R-POL-07", finding: "POL_CONFLITO" },
    ],
  },
  {
    key: "C",
    category: "Falha de integração",
    title: "Falha de integração",
    short:
      "Consulta simulada a serviço externo excedeu o tempo previsto e aguarda retry.",
    risk: "Caso não pode ser considerado pronto sob condição técnica degradada.",
    initialState: "EM_PREPARACAO",
    currentState: "EM_PREPARACAO",
    nextState: "EM_PREPARACAO",
    duration: "≈ 2 min",
    caseId: "NXS-2026-0157",
    client: "Lumina Tecnologia Aplicada Ltda.",
    segment: "Silver",
    channel: "Agência",
    requestType: "Abertura de conta empresarial",
    origin: "Agência 0289 — Gerente PJ",
    tech: "AGUARDANDO_RETRY",
    currentStep: "Decisão",
    policies: [basePolicyDoc],
    documents: [
      { id: "contrato", label: "Contrato social", file: "contrato_social_v1.pdf", version: 1, status: "Atendido" },
      { id: "repr", label: "Documento dos representantes", file: "docs_repr.zip", version: 1, status: "Atendido" },
      { id: "endereco", label: "Comprovante de endereço", file: "comprovante_endereco_v1.pdf", version: 1, validity: "20/07/2026", status: "Atendido" },
      { id: "form", label: "Formulário de abertura", file: "formulario_abertura.pdf", version: 1, status: "Atendido" },
      { id: "poderes", label: "Evidência de poderes de representação", file: "procuracao_v1.pdf", version: 1, status: "Atendido" },
    ],
    findings: ["INT_TIMEOUT — Timeout na consulta simulada ao serviço de dados cadastrais."],
    rulesExecuted: ["R-INT-01", "R-INT-03"],
    recommendation:
      "Executar retry controlado; não classificar como pronto até estabilização.",
    authorizedAction: "Aguardar retry — decisão suspensa. Timeout nunca é tratado como aprovação.",
    grounding: "Recomendação restrita ao domínio técnico; sem sobrescrita de política.",
    groundingStatus: "ok",
    evidences: [
      {
        id: "ev-c-1",
        claim: "Timeout na consulta externa impede avaliação completa.",
        finding: "INT_TIMEOUT",
        rule: "R-INT-03",
        policyCode: "POL-INT-OPS-01",
        policyVersion: "1.4",
        policyValidity: "01/01/2026 a 31/12/2026",
        excerpt: "Falhas técnicas não devem alterar o estado de negócio; classificar condição técnica separadamente.",
        timestamp: "11:21",
      },
    ],
    lastUpdate: "11:21",
    audit: [
      { id: "c1", time: "11:20", actor: "Agente", action: "Caso instanciado", to: "EM_PREPARACAO" },
      { id: "c2", time: "11:21", actor: "Sistema", action: "Consulta externa", finding: "INT_TIMEOUT" },
      { id: "c3", time: "11:21", actor: "Regra", action: "Marcada condição técnica AGUARDANDO_RETRY", rule: "R-INT-03" },
    ],
  },
  {
    key: "D",
    category: "Caso pronto",
    title: "Caso pronto",
    short: "Documentação completa e política estável; segue para validação em sombra.",
    risk: "Baixo — encaminhamento controlado, sem aprovação final automática.",
    initialState: "PRONTA_PARA_SUBMISSAO",
    currentState: "PRONTA_PARA_SUBMISSAO",
    nextState: "EM_VALIDACAO_SOMBRA",
    duration: "≈ 2 min",
    caseId: "NXS-2026-0144",
    client: "Vértice Soluções Ambientais Ltda.",
    segment: "Silver",
    channel: "Agência",
    requestType: "Abertura de conta empresarial",
    origin: "Agência 0154 — Gerente PJ",
    tech: "NORMAL",
    currentStep: "Revisão",
    policies: [basePolicyDoc],
    documents: [
      { id: "contrato", label: "Contrato social", file: "contrato_social_v4.pdf", version: 4, status: "Atendido" },
      { id: "repr", label: "Documento dos representantes", file: "docs_repr.zip", version: 2, status: "Atendido" },
      { id: "endereco", label: "Comprovante de endereço", file: "comprovante_endereco_v2.pdf", version: 2, validity: "12/09/2026", status: "Atendido" },
      { id: "form", label: "Formulário de abertura", file: "formulario_abertura.pdf", version: 1, status: "Atendido" },
      { id: "poderes", label: "Evidência de poderes de representação", file: "procuracao_v1.pdf", version: 1, status: "Atendido" },
    ],
    findings: [],
    rulesExecuted: ["R-DOC-01", "R-DOC-04", "R-KYC-02", "R-POL-01"],
    recommendation:
      "Encaminhar para validação em sombra (N1). O agente não encaminha diretamente ao N2 no MVP.",
    authorizedAction: "Handoff controlado para validação em sombra — obrigatória antes de qualquer submissão.",
    grounding: "Cada checagem obrigatória possui evidência associada à política vigente.",
    groundingStatus: "ok",
    evidences: [
      {
        id: "ev-d-1",
        claim: "Comprovante de endereço dentro da janela de 90 dias.",
        rule: "R-DOC-04",
        policyCode: "POL-DOC-PJ-02",
        policyVersion: "3.1",
        policyValidity: "01/07/2026 a 31/12/2026",
        excerpt: "Comprovante de endereço deve ter emissão inferior a 90 dias na data da submissão.",
        timestamp: "08:47",
      },
      {
        id: "ev-d-2",
        claim: "Contrato social consolidado presente e vigente.",
        rule: "R-DOC-01",
        policyCode: "POL-DOC-PJ-02",
        policyVersion: "3.1",
        policyValidity: "01/07/2026 a 31/12/2026",
        excerpt: "Contrato social consolidado é obrigatório e deve refletir a composição societária vigente.",
        timestamp: "08:47",
      },
    ],
    lastUpdate: "08:47",
    humanReview: {
      reason: "Confirmação de handoff para validação em sombra.",
      recommendation: "Ratificar encaminhamento; sem alteração de política aplicada.",
    },
    audit: [
      { id: "d1", time: "08:45", actor: "Agente", action: "Caso instanciado", to: "EM_PREPARACAO" },
      { id: "d2", time: "08:46", actor: "Regra", action: "Checklist documental", rule: "R-DOC-01" },
      { id: "d3", time: "08:47", actor: "Regra", action: "Prontidão confirmada", from: "EM_PREPARACAO", to: "PRONTA_PARA_SUBMISSAO" },
    ],
  },
];

export const STATE_LABEL: Record<ProcessState, string> = {
  CRIADA: "Criada",
  EM_PREPARACAO: "Em preparação",
  AGUARDANDO_CORRECAO: "Aguardando correção",
  EM_REVISAO_HUMANA: "Em revisão humana",
  PRONTA_PARA_SUBMISSAO: "Pronta para submissão",
  EM_VALIDACAO_SOMBRA: "Em validação em sombra",
  ENCAMINHADA_AO_N2: "Encaminhada ao N2",
  ENCAMINHADA_TRATAMENTO_ESPECIALIZADO: "Tratamento especializado",
  CANCELADA: "Cancelada",
};

export const TECH_LABEL: Record<TechCondition, string> = {
  NORMAL: "Técnico normal",
  AGUARDANDO_RETRY: "Aguardando retry",
  BLOQUEADO_TECNICO: "Bloqueado técnico",
};
