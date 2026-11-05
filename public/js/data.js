// Single source of truth for the selected work. Rendered by home.js (wheel) and case.js (case studies).
// Client names are intentionally omitted throughout.
window.PROJECTS = [
  {
    slug: 'enterprise-agentic-rag',
    name: 'Enterprise Agentic RAG',
    short: 'Agentic RAG',
    kicker: 'Knowledge systems',
    category: 'GenAI · Agentic RAG',
    visual: 'rag',
    icon: '<circle cx="11" cy="11" r="6"/><path d="M20 20l-4.5-4.5"/><path d="M8.5 11h5M11 8.5v5"/>',
    lead: 'From document overload to research reports, live search and executive decks, with every claim cited back to the source page.',
    bullets: [
      ['Grounds', ' reports and answers across 17K+ enterprise documents'],
      ['Streams', ' hybrid real-time search over WebSocket with re-ranking'],
      ['Builds', ' branded slide decks through a vision-QA auto-fix loop']
    ],
    tags: ['Azure OpenAI', 'Agno', 'LangChain', 'pgvector'],
    impact: '17K+ documents · page-level citations',
    summary: 'A multi-agent research platform for a global networking & security enterprise: grounded research reports, real-time intelligent search and automated executive presentations, all inside the client’s own cloud tenant.',
    meta: [
      ['Role', 'Core AI engineer: agent orchestration, RAG pipeline, Azure deployment'],
      ['Client', 'Global networking & security enterprise'],
      ['Platform', 'Azure Container Apps · Azure AI Foundry'],
      ['Scale', '17K+ documents, multi-source']
    ],
    metrics: [
      { value: 17, suffix: 'K+', label: 'Enterprise documents grounded' },
      { value: 3, suffix: '', label: 'Core flows: report, search, deck' },
      { value: 9, suffix: '', label: 'Step deck production pipeline' },
      { value: 4, suffix: '', label: 'Tier context & session memory' }
    ],
    problem: [
      'Strategy and research teams produce executive research reports and decks by hand. Pulling internal documents, analyst briefings and market data together took days per deliverable and depended on analyst availability.',
      'Content was scattered across a document portal, third-party research services and ad-hoc uploads. And because executive communication demands that every number be traceable, a generic chatbot was never an option. All data and inference also had to stay inside the client’s own cloud tenant.'
    ],
    solution: 'An agentic, context-centric platform with three flows. Research report generation produces grounded analysis with page-level citations and suggested follow-ups. Real-time intelligent search streams hybrid vector + keyword + metadata results. Presentation generation has an LLM write slide code, renders it, inspects every slide with a vision model and auto-fixes defects before merging into the brand template. A change listener keeps the vector corpus in sync with the document portal on every add, move, update and delete.',
    architecture: {
      caption: 'Nine zones, left to right: from user intent to traceable output.',
      zones: [
        { title: 'Experience & intake', nodes: ['Chat / deck builder UI', 'Persona & slide preferences', 'Document uploads', 'Real-time search'] },
        { title: 'Orchestration', nodes: ['Agent orchestration layer', 'Request normalisation', 'Source selection', 'Session & cached context'], hot: true },
        { title: 'Evidence pipeline', nodes: ['Portal change listener', 'Text & image extraction', 'Chunk + embed', 'PostgreSQL 16 + pgvector', 'Reference de-duplication'] },
        { title: 'Retrieval & grounding', nodes: ['Search intent extraction', 'Hybrid retrieval', 'Re-rank & de-dupe', 'Reasoning model (grounded)'] },
        { title: 'Content intelligence', nodes: ['Grounded analysis', 'Report synthesis', 'Big idea & outline', 'Audience-aware storyline'] },
        { title: 'Presentation production', nodes: ['Code-gen model', 'PptxGenJS script', 'PPTX → PDF → images', 'Visual QA', 'Auto-fix loop'], hot: true },
        { title: 'Outputs', nodes: ['Research report', 'Executive PPTX + PDF', 'Source traceability'] }
      ],
      bands: [
        { label: 'Platform', items: ['Azure Container Apps', 'PostgreSQL 16 + pgvector', 'Blob Storage', 'Monitor & audit logs'] },
        { label: 'Patterns', items: ['ReAct tool use', 'MCP research source', 'WebSocket search', 'Session memory', 'Async workers', 'Visual QA loop'] },
        { label: 'Guardrails', items: ['Grounded retrieval', 'Upload validation', 'Session isolation', 'Prompt constraints', 'Human review before distribution'] }
      ]
    },
    flow: {
      title: 'Presentation pipeline, step by step',
      steps: [
        ['Choose the audience', 'Persona (executive, cross-functional or expert), slide count and light/dark theme.'],
        ['Plan the story', 'A planning agent sets the big idea, the outline and a slide-by-slide narrative.'],
        ['Write the slides as code', 'The code model receives the content, references and a design skill, and writes a full PptxGenJS script.'],
        ['Build & render', 'Node builds the PPTX, which is rendered to PDF and then to per-slide images.'],
        ['Inspect visually', 'A vision model checks every slide for overflow, overlap and layout defects.'],
        ['Auto-fix', 'The script and the issue list go back to the model and the build re-runs.'],
        ['Merge & validate', 'Slides are merged into the brand template, schema-validated as OOXML and queued for human review.']
      ]
    },
    features: [
      ['Page-level citations', 'Every generated claim links back to its source document and page.'],
      ['Hybrid live search', 'Vector + keyword + metadata filters, re-ranked and streamed over WebSocket with file previews.'],
      ['Incremental sync', 'A change listener re-indexes on every add, move, update and delete in the document portal.'],
      ['Multi-source evidence', 'REST APIs, an MCP-server research source, web sources and uploaded PDF/DOCX/PPTX.'],
      ['Split model roles', 'A cost-efficient reasoning model for analysis; a code + vision model for slides and QA.'],
      ['Persona-aware output', 'Executive brevity, practitioner depth or cross-functional balance, chosen per request.'],
      ['Layered memory', 'Session, cached, long-term and reference stores keep follow-ups consistent.'],
      ['Human in the loop', 'Nothing reaches an executive without a review gate.']
    ],
    highlights: [
      ['Evolved the architecture', 'v1 shipped on LangChain ReAct agents with Azure Document Intelligence and Logic Apps; v3 moves orchestration to Agno with dedicated reasoning and code-generation models.'],
      ['pgvector over a dedicated vector DB', 'Consolidated storage, transactional consistency and more than enough headroom for the corpus.'],
      ['Slides as code, not templates', 'PptxGenJS gives richer native charts, and LLMs write it more reliably than python-pptx. The result is template-merged afterwards.'],
      ['WebSocket over polling', 'Search results stream in as they are ranked, with reconnect and result caching.']
    ],
    security: ['All data and inference inside the client tenant', 'Managed identity & Key Vault: no secrets in code', 'Private endpoints for DB, storage and AI', 'Entra ID RBAC on every API call', 'Every LLM call and document access audited', 'Upload type validation and malware scanning'],
    stack: {
      'AI & agents': ['Azure OpenAI', 'Azure AI Foundry', 'Agno', 'LangChain (v1)', 'ReAct tool use', 'MCP'],
      'Data': ['PostgreSQL 16', 'pgvector', 'Azure Document Intelligence', 'Blob Storage', 'Microsoft Graph'],
      'App & delivery': ['Python', 'FastAPI', 'React + TypeScript', 'WebSocket', 'Node.js', 'PptxGenJS', 'PyMuPDF', 'Azure Container Apps']
    },
    role: 'I built the multi-agent orchestration (intent classification, semantic retrieval, contextual reasoning, and report generation with references and media), then implemented and deployed the Azure AI ecosystem behind it: file-change monitoring with automated indexing, semantic search, PDF/PPT exports and feedback loops.'
  },
  {
    slug: 'smartrfp',
    name: 'SmartRFP',
    short: 'SmartRFP',
    kicker: 'Proposal automation',
    category: 'GenAI · Agentic workflows',
    visual: 'rfp',
    icon: '<path d="M7 3h7l4 4v14H7z"/><path d="M14 3v4h4"/><path d="M9.5 14l2 2 4-4"/>',
    lead: 'An agentic RFP desk: it reads the tender, interviews the bid manager, proves every requirement against company evidence and drafts the response.',
    bullets: [
      ['Extracts', ' requirements in parallel, section by section, with LangGraph'],
      ['Evaluates', ' compliance with hybrid retrieval and cross-encoder re-ranking'],
      ['Drafts', ' a branded proposal, vision-checked and packaged for review']
    ],
    tags: ['LangGraph', 'pgvector', 'Azure', 'RAGAS'],
    impact: '2-phase pipeline · human in the loop',
    summary: 'An agentic RFP response platform. It takes a procurement document, extracts every provable requirement, asks the bid manager the right clarifying questions, checks each requirement against the company’s knowledge base and produces a compliance matrix plus a draft proposal ready for review.',
    meta: [
      ['Role', 'AI engineer: pipelines, retrieval and draft generation'],
      ['Domain', 'Bids, proposals & vendor risk'],
      ['Platform', 'Azure Container Apps · Service Bus'],
      ['Models', 'GPT-5.5 · Claude Opus · local cross-encoder']
    ],
    metrics: [
      { value: 2, suffix: '', label: 'Phase LangGraph pipeline, paused for a human' },
      { value: 70, suffix: '/30', label: 'Vector / full-text fusion weights' },
      { value: 30, prefix: '~', suffix: '%', label: 'Less wall time per batch from one-call re-ranking' },
      { value: 5, suffix: '', label: 'Compliance states with cited reasoning' }
    ],
    problem: [
      'Responding to an RFP means reading a long, often multilingual procurement document and listing every qualification requirement in it. Then someone has to find evidence for each one (certifications, case studies, financials, past proposals) scattered across SharePoint, the CRM and local drives.',
      'It is slow, manual and unforgiving: one missed mandatory requirement can disqualify a bid. Teams still have to write a polished, on-brand response and an effort estimate under tight deadlines.'
    ],
    solution: 'Two LangGraph pipelines with a person in the loop between them. Phase 1 extracts layout, builds a section tree, fans out requirement extraction per section, merges and validates, then pauses for an adaptive clarification interview. Phase 2 resumes with that context, runs hybrid retrieval and batched compliance evaluation, and exports a compliance matrix. A separate draft writer authors the proposal, generates the Word document as code, renders it, checks the pages visually and packages every deliverable.',
    architecture: {
      caption: 'A queue-backed worker runs two graphs; the API only accepts, tracks and serves.',
      zones: [
        { title: 'Intake', nodes: ['React SPA (Entra ID)', 'RFP upload & source picker', 'FastAPI /api/v1', 'Service Bus queue'] },
        { title: 'Phase 1 graph', nodes: ['Layout extraction', 'Section tree', 'Parallel requirement extraction', 'Merge + LLM validation'], hot: true },
        { title: 'Human in the loop', nodes: ['Clarification agent', '6–10 adaptive questions', 'Bid-team roster aware', 'Audit log + Q&A PDF'] },
        { title: 'Phase 2 graph', nodes: ['Hybrid retrieval', 'Cross-encoder re-rank', 'Batched compliance eval', 'Matrix aggregation'], hot: true },
        { title: 'Draft writer', nodes: ['Section authoring', 'DOCX as code', 'PDF render + vision QA', 'Effort estimation'] },
        { title: 'Deliverables', nodes: ['Compliance matrix (xlsx)', 'Proposal (docx + pdf)', 'Evidence pack (zip)'] }
      ],
      bands: [
        { label: 'Knowledge base', items: ['SharePoint (Graph)', 'CRM files', 'Local / ZIP uploads', 'Semantic chunking', 'Image summaries', 'pgvector + tsvector'] },
        { label: 'Quality', items: ['RAGAS scoring', 'Langfuse tracing', 'Prompt caching + cost logging', 'Friendly error surfacing'] }
      ]
    },
    flow: {
      title: 'From tender to deliverables',
      steps: [
        ['Read the document', 'Office files become PDF, then Document Intelligence returns the layout; DOCX headers and footers are merged in natively.'],
        ['Find the structure', 'A rule-based section tree filters page furniture and recovers the heading hierarchy.'],
        ['Extract in parallel', 'One extraction call per section: translate, de-duplicate, flag mandatory items and thresholds.'],
        ['Validate', 'A reviewer model keeps or drops each requirement and flags low-confidence ones for a human.'],
        ['Interview the bid manager', 'One question at a time, multiple choice, with guardrails against bundled or leading questions.'],
        ['Retrieve & re-rank', 'Vector and full-text search fused 0.7 / 0.3, then a local cross-encoder re-ranks the whole batch in one call.'],
        ['Judge compliance', 'Five requirements per call: met, partial, not met, n/a or unknown, with page-cited reasoning and a draft answer.'],
        ['Draft & package', 'Proposal sections, effort workbook and diagrams, rendered, vision-checked and zipped for review.']
      ]
    },
    features: [
      ['Any tender format', 'PDF, DOC/DOCX and PPT/PPTX through Document Intelligence.'],
      ['Clarification agent', 'An adaptive 6–10 question interview whose answers steer both evaluation and drafting.'],
      ['Scoped hybrid search', 'Limit evidence to SharePoint, CRM or local sources, enforced in SQL.'],
      ['Explainable matrix', 'Five statuses, cited documents and pages, needs-review flags, Excel export.'],
      ['Self-checking drafts', 'Generated DOCX code is schema-validated, rendered, vision-QA’d and auto-fixed.'],
      ['No invented facts', 'Missing pricing, legal or timeline details become explicit human-review placeholders.'],
      ['Vendor-risk autofill', 'Security questionnaires are answered and written back into the original file.'],
      ['Live progress', 'Per-agent progress, activity log and cancellation, backed by the database.']
    ],
    highlights: [
      ['Calibrated against over-flagging', 'The evaluator prompt defaults to "met" and spells out when "partial" is not appropriate, so reviewers see fewer false alarms.'],
      ['Skip re-ranking when it is obvious', 'If the top hybrid hit leads the runner-up by 0.20 or more, the cross-encoder is skipped. The threshold was calibrated on real questionnaire data.'],
      ['Graceful failure', 'If a batch’s JSON fails to parse, only the affected rows fall back to "unknown, needs review".'],
      ['Fan-out with reducers', 'LangGraph Send fans extraction out per section, and reducer-annotated state gathers the results.']
    ],
    security: ['Entra ID sign-in with admin-approved access', 'Source filtering enforced in SQL', 'Human review gate on every draft', 'Audit trail of injected clarification context', 'No company facts invented: placeholders instead'],
    stack: {
      'AI & agents': ['LangGraph', 'LangChain', 'Azure OpenAI', 'Anthropic (Foundry)', 'sentence-transformers', 'RAGAS', 'Langfuse'],
      'Data': ['PostgreSQL + pgvector', 'Full-text search', 'Azure Document Intelligence', 'Blob Storage', 'Service Bus', 'Microsoft Graph'],
      'App & delivery': ['Python 3.12', 'FastAPI', 'React 19', 'TypeScript', 'Tailwind 4', 'AG Grid', 'LibreOffice', 'docx (Node)', 'Azure Container Apps']
    },
    role: 'I worked across the pipeline: the LangGraph phases and their human-in-the-loop resume, the hybrid retrieval and re-ranking layer, batched compliance evaluation, and the draft writer’s generate, render, vision-QA and fix loop.'
  },
  {
    slug: 'claimpilot',
    name: 'ClaimPilot',
    short: 'ClaimPilot',
    kicker: 'Insurance AI',
    category: 'Agentic AI · Serverless',
    visual: 'claims',
    icon: '<path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6z"/><path d="M9 12l2 2 4-4"/>',
    lead: 'Agentic claims intake on AWS. Emails, forms, photos and scans become validated, risk-scored, adjuster-ready claims, with humans in the loop wherever confidence is low.',
    bullets: [
      ['Orchestrates', ' seven serverless agents with a LangGraph coordinator'],
      ['Pauses', ' for human review and resumes from a durable checkpoint'],
      ['Scores', ' fraud, severity and propensity with graph context']
    ],
    tags: ['LangGraph', 'AWS Lambda', 'Bedrock', 'Neptune'],
    impact: 'Durable HITL · zero reprocessing on resume',
    summary: 'A serverless multi-agent platform for insurance claims intake. A LangGraph orchestrator coordinates specialised agents, each its own Lambda, to classify, extract, consolidate, validate, risk-score and route every new claim, and checkpoints the workflow whenever a human needs to step in.',
    meta: [
      ['Role', 'Agentic architecture & high-level design'],
      ['Domain', 'Insurance · claims intake'],
      ['Platform', 'AWS serverless · Amazon Bedrock'],
      ['Pattern', 'Orchestrator + specialist agents']
    ],
    metrics: [
      { value: 7, suffix: '', label: 'Independent serverless agents' },
      { value: 7, suffix: '', label: 'Intake channels, one claim model' },
      { value: 11, suffix: '', label: 'Step pause → review → resume flow' },
      { value: 0, suffix: '', label: 'Steps reprocessed after a human resumes' }
    ],
    problem: [
      'Reporting a loss starts the claims lifecycle, and intake has traditionally meant people reading emails, industry claim forms, scans and photos. They re-key the data, check coverage, look for duplicates, judge fraud risk, estimate reserves and pick an adjuster.',
      'Claims arrive from policyholders, brokers, agents and third parties across many channels and lines of business, each with its own rules. The manual path is slow and inconsistent, and it delays claim registration.'
    ],
    solution: 'A central LangGraph orchestrator coordinates specialised agents, each deployed as an independent Lambda. Together they classify and extract any document, consolidate everything into one normalised claim, validate policy and coverage, detect exact and semantic duplicates, score fraud, severity and propensity, and recommend the next action, reserve and adjuster. Every AI output carries a confidence score. Low confidence, conflicts or high risk route the claim to a human review console: the workflow checkpoints to DynamoDB, the Lambda ends cleanly, and the run resumes from that exact point after the human acts.',
    architecture: {
      caption: 'Durable, checkpointed orchestration over independent serverless agents.',
      zones: [
        { title: 'Channels', nodes: ['Email + attachments', 'Web portal', 'Partner API', 'Mobile & IVR', 'Third-party data'] },
        { title: 'Ingestion', nodes: ['Route 53 → WAF', 'API Gateway', 'Mailbox poller', 'SQS intake queue'] },
        { title: 'Orchestrator', nodes: ['LangGraph workflow', 'State & context manager', 'DynamoDB checkpoints'], hot: true },
        { title: 'Serverless agents', nodes: ['Ingest · Extract', 'Classify · Validate', 'Risk assessment', 'Decision · Routing', 'Shared review agent'], hot: true },
        { title: 'Human in the loop', nodes: ['Review console', 'Evidence viewer', 'Approve / override', 'Resume from checkpoint'] },
        { title: 'Systems of record', nodes: ['Policy administration', 'Core claims system', 'Notifications'] }
      ],
      bands: [
        { label: 'Data', items: ['S3 documents', 'RDS PostgreSQL', 'Aurora pgvector', 'DynamoDB', 'ElastiCache', 'Neptune graph'] },
        { label: 'Security', items: ['IAM per agent', 'KMS', 'Secrets Manager', 'Private VPC subnets', 'CloudWatch'] }
      ]
    },
    flow: {
      title: 'How human-in-the-loop works',
      steps: [
        ['Agent runs', 'A specialist agent produces output with a confidence score.'],
        ['Orchestrator checks', 'Thresholds, conflicts, duplicates, risk and client rules decide whether a human is needed.'],
        ['Checkpoint', 'State goes to DynamoDB and evidence to S3; the workflow pauses and the Lambda ends.'],
        ['Review', 'The task appears in the review console with the source side by side with the extracted data.'],
        ['Act', 'The reviewer approves, edits or overrides; the action is saved through the API.'],
        ['Resume', 'LangGraph reloads state from the checkpoint and the next agent continues, with nothing reprocessed.']
      ]
    },
    features: [
      ['Omnichannel intake', 'Email, portal, API, mobile, IVR, uploads and third-party data.'],
      ['Any-document extraction', 'Forms, emails, PDFs, handwriting and photos, each with a confidence score.'],
      ['Claim consolidation', 'Many documents become one normalised claim record.'],
      ['Duplicate detection', 'Exact and embedding-based semantic matching.'],
      ['Risk & propensity', 'Fraud, severity, litigation, total-loss and recovery, with fraud-network context from a graph.'],
      ['Decision support', 'Claim summary, next-best action, reserve recommendation and missing-information list.'],
      ['Smart assignment', 'Workload-, territory- and skills-aware adjuster routing.'],
      ['Configurable by client', 'Rules, prompts, thresholds and line-of-business workflows behind feature flags.']
    ],
    highlights: [
      ['AI complements, rules decide', 'Deterministic services stay the source of truth for policy checks, rules, duplicate matching and registration.'],
      ['Pay-per-execution agents', 'Every agent is its own least-privilege Lambda, so each scales and fails independently.'],
      ['Durable pauses', 'Checkpointing lets a claim wait hours for a human without holding compute.'],
      ['Graph context for fraud', 'A graph database links claims, parties and policies to surface cross-claim patterns.']
    ],
    security: ['OAuth 2.0 / OIDC + JWT with role-based queues', 'Least-privilege IAM for each agent', 'KMS encryption at rest, TLS in transit', 'PII masking and prompt sanitisation', 'Every prompt, decision and override audited', 'WAF at the edge, compute in private subnets'],
    stack: {
      'AI & agents': ['LangGraph', 'Amazon Bedrock', 'Confidence scoring', 'Semantic duplicate detection', 'LLM observability'],
      'Data': ['Amazon S3', 'RDS PostgreSQL', 'Aurora + pgvector', 'DynamoDB', 'ElastiCache Redis', 'Neptune'],
      'Platform': ['AWS Lambda', 'API Gateway', 'SQS', 'SES', 'Route 53', 'WAF', 'KMS', 'CloudWatch', 'React', 'FastAPI']
    },
    role: 'I designed the agentic architecture: the orchestrator-plus-specialists pattern, the agent responsibilities and boundaries, the durable human-in-the-loop checkpoint and resume flow, and the data and security layout on AWS.'
  },
  {
    slug: 'fieldpulse-ai',
    name: 'FieldPulse AI',
    short: 'FieldPulse',
    kicker: 'Sales intelligence',
    category: 'ML + Agentic AI',
    visual: 'field',
    icon: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r=".8"/>',
    lead: 'A trusted daily plan for every field rep: which outlets to visit first, what to do there, and what to know before walking in.',
    bullets: [
      ['Ranks', ' outlets with an explainable XGBoost churn model'],
      ['Coaches', ' through eight specialist agents and an Ask AI analyst'],
      ['Governs', ' every answer with SQL-level row scoping and audit']
    ],
    tags: ['XGBoost', 'LangGraph', 'Azure OpenAI', 'FastAPI'],
    impact: '0.849 ROC-AUC · 541 backend tests',
    summary: 'Agentic decision support for field sales. An ML model ranks every outlet by churn risk, a rule engine picks the next-best action, and generative agents write prep notes, portfolio briefs and conversational answers, without ever showing a user data they are not allowed to see.',
    meta: [
      ['Role', 'Team lead: backend AI, ML pipeline & UI design'],
      ['Domain', 'Fintech · merchant field sales'],
      ['Platform', 'Azure Container Apps · Azure OpenAI'],
      ['Team', '4 engineers']
    ],
    metrics: [
      { value: 0.849, decimals: 3, suffix: '', label: 'Holdout ROC-AUC (target ≥ 0.80)' },
      { value: 8, suffix: '', label: 'Specialist agents behind one orchestrator' },
      { value: 541, suffix: '', label: 'Backend unit tests' },
      { value: 113, suffix: '', label: 'End-to-end tests across devices' }
    ],
    problem: [
      'Field reps each manage dozens of retail merchants whose health changes daily: sales slow, float runs low, shops go quiet. The signals sit in spreadsheets and reports, so visit order follows habit, churn is caught late and managers lack a live view.',
      'Putting AI on raw data creates a second problem: it risks exposing financial fields to people who should not see them, and leadership will not act on black-box scores.'
    ],
    solution: 'Four engines behind one role-aware app. An XGBoost churn classifier scores every outlet 0–100 every six hours and explains its top three drivers. A declarative 21-rule engine picks one next-best action per outlet; an agent rewrites the reason in plain language but cannot change the action. Generative agents produce visit prep notes, a daily portfolio brief and Ask AI, a LangGraph analytics assistant with charts. Governance is by design: JWT, roles, SQL row scoping, layered guardrails, masked exports and a full audit trail. The system recommends; people decide.',
    architecture: {
      caption: 'Four layers, with governance cutting across all of them.',
      zones: [
        { title: 'Experience', nodes: ['Rep workspace', 'Manager workspace', 'Admin console', 'Ask AI (chat + charts)'] },
        { title: 'API & services', nodes: ['FastAPI (JWT)', 'AI service', 'Scoring & actions', 'Notifications (SSE)', 'Exports'] },
        { title: 'AI engine', nodes: ['Master orchestrator', '8 specialist agents', 'Ask AI LangGraph (10 tools)', 'GPT-5.5'], hot: true },
        { title: 'ML & rules', nodes: ['XGBoost priority model', 'Occlusion explanations', '21-rule action engine', 'Drift monitor + retrain'], hot: true },
        { title: 'Data', nodes: ['PostgreSQL', 'Model artifact', '6-month history', 'TTL cache'] }
      ],
      bands: [
        { label: 'Governance', items: ['JWT + bcrypt', 'Role-based access', 'Row-level SQL scoping', 'AI guardrails', 'Masked exports', 'Audit + alerts', 'Langfuse'] },
        { label: 'Delivery', items: ['Docker', 'Azure Container Registry', 'Container Apps', 'OIDC CI/CD, no stored secrets', 'Log Analytics'] }
      ]
    },
    flow: {
      title: 'The safe agent pattern',
      steps: [
        ['Enforce access', 'The same scoping check used by the API runs first, so the agent only sees what the user could see on screen.'],
        ['Compute verified facts', 'SQL, the ML model and the rule engine produce frozen fields the LLM cannot alter.'],
        ['Narrate within bounds', 'A LangGraph ReAct loop: max 4 rounds, 12 s timeout, 2 retries, Pydantic-validated tool arguments.'],
        ['Fall back safely', 'On any failure the user still gets the verified facts, with no hallucinated gap-filling.']
      ]
    },
    chart: {
      title: 'What drives the priority score',
      sub: 'XGBoost feature importance (gain), priority model',
      data: [['Sales trend: declining', 0.62], ['Sales trend: rising', 0.14], ['Days since last visit', 0.08], ['Days of float left', 0.08]],
      note: 'Trained on 120,000 simulated outlet-days; real merchant data could not be used. 5-fold grouped CV AUC 0.850 ± 0.005.'
    },
    features: [
      ['Priority-ranked day', 'A colour-coded risk ring per outlet with plain-language risk drivers.'],
      ['Next-best action', 'Urgent to low, with an AI-written reason and done/skip tracking.'],
      ['Prep notes & briefs', 'A 3–5 bullet visit note and a daily portfolio brief.'],
      ['Ask AI', 'Streaming conversational analytics with visible steps, charts and PDF export.'],
      ['Real-time alerts', 'Server-sent events for high-priority outlets, completions and denied-access attempts.'],
      ['Self-healing model', 'Evidently drift checks trigger retraining and hot reload without a redeploy.'],
      ['Admin cockpit', 'Users, stores, groups, export toggles, financial masking and a searchable audit log.'],
      ['Liquid-glass UI', 'A custom monochrome glass design system across every screen.']
    ],
    highlights: [
      ['The LLM never writes SQL', 'Ask AI picks from 10 read-only, RBAC-scoped tools with parameterised queries and schema-discovered column whitelists.'],
      ['20-pattern input guardrail', 'Prompt-injection, XSS and SQL-injection forms are blocked, audited and alerted.'],
      ['Kill switch', 'A super admin can turn off the entire agent layer at runtime; the app falls back to verified facts.'],
      ['Tested like a product', '541 backend, 67 frontend, 225 API and 113 E2E tests, golden AI evals and a 48-cell auth matrix.']
    ],
    security: ['Role and scope re-read on every request', 'Row-level scoping inside every SQL query', 'Same scoping reused by the AI tools', 'Role-gated, masked and watermarked exports', 'Strict CSP, HSTS and locked CORS', 'Passwordless OIDC-federated CI/CD'],
    stack: {
      'AI & ML': ['Azure OpenAI GPT-5.5', 'LangGraph', 'LangChain', 'Langfuse', 'XGBoost', 'scikit-learn', 'Evidently'],
      'Backend': ['Python 3.11', 'FastAPI', 'SQLAlchemy', 'PostgreSQL 18', 'ReportLab', 'SSE'],
      'Frontend & delivery': ['React 18', 'Vite', 'Recharts', 'Docker', 'Azure Container Apps', 'GitHub Actions', 'Playwright', 'JMeter']
    },
    role: 'I led a four-person team and owned the backend AI: the master orchestrator and eight specialist agents, the Ask AI LangGraph pipeline with its scoped tools, guardrails and memory, prep notes and briefs, the Azure OpenAI integration with reasoning-model support, Langfuse observability, and the ML scoring and drift-retraining pipeline. I also designed the UI and its liquid-glass design system.'
  },
  {
    slug: 'deckbuilder',
    name: 'DeckBuilder',
    short: 'DeckBuilder',
    kicker: 'Document → deck',
    category: 'GenAI · Document intelligence',
    visual: 'deck',
    icon: '<rect x="3" y="4" width="18" height="12" rx="1.5"/><path d="M8 20h8M12 16v4"/><path d="M7 12l3-3 2 2 4-4"/>',
    lead: 'Upload a document, get a finished on-brand PowerPoint where every claim traces to the source. Then refine it in chat or edit it live.',
    bullets: [
      ['Plans', ' a big idea and evidence-cited outline before any slide exists'],
      ['Writes', ' slides as code, merged into the corporate template'],
      ['Edits', ' the real .pptx live in the browser: what you see is what you download']
    ],
    tags: ['Claude', 'PptxGenJS', 'LangGraph', 'FastAPI'],
    impact: '69 s → 11 s analysis · 249 tests',
    summary: 'A document-to-deck platform. It reads the source, proposes a presentation story and an evidence-cited outline, lets you refine it in chat, then generates native, on-template PowerPoint slides with layout and vision QA, and a browser editor that edits the actual file.',
    meta: [
      ['Role', 'AI engineer: generation pipeline & QA'],
      ['Domain', 'Enterprise document automation'],
      ['Platform', 'Azure Container Apps · PostgreSQL 16'],
      ['Models', 'Claude for slides · GPT-4o for ideation']
    ],
    metrics: [
      { value: 11, suffix: ' s', label: 'Analysis of a 15K-character doc (was 69 s)' },
      { value: 2.7, decimals: 1, suffix: '×', label: 'Smaller prompt with an evidence-grouped view' },
      { value: 2, prefix: '~', suffix: ' s', label: 'Slowest status poll (was >10 s timeouts)' },
      { value: 249, suffix: '', label: 'Test functions incl. golden template tests' }
    ],
    problem: [
      'Turning a report or analysis into an executive deck takes hours: finding the story, ordering the slides, pulling the numbers and laying out every slide in the corporate template.',
      'Generic AI slide tools invent facts, ignore brand templates and produce overflowing layouts. Iterating is fragile: one small edit can quietly break the narrative, and the download often differs from the preview.'
    ],
    solution: 'A FastAPI + LangGraph backend parses the source with Document Intelligence, including vision understanding of figures, and writes a presentation summary and outline where every slide cites evidence. That outline is stored as a canonical, versioned deck spec. Chat edits are classified as a question, a local edit or a global replan. Generation has Claude write one PptxGenJS function per slide; Node runs them and the result is merged into the template at the OOXML level. Deterministic layout checks and a vision review then drive one targeted repair round.',
    architecture: {
      caption: 'Three LangGraph graphs over one canonical, versioned deck spec.',
      zones: [
        { title: 'Sources', nodes: ['Up to 3 files (PDF, DOCX, MD)', 'Document Intelligence', 'Figure vision batches', 'User instruction'] },
        { title: 'Analysis graph', nodes: ['Document understanding', 'Story + outline (one call)', 'Grounding validation', 'Markdown view'], hot: true },
        { title: 'Conversation graph', nodes: ['Intent classifier (11 types)', 'Local edit', 'Global replan', 'Versioned deck spec'] },
        { title: 'PPTX graph', nodes: ['Slide JS (parallel, streamed)', 'Node run', 'OOXML template merge', 'Layout + vision QA → repair'], hot: true },
        { title: 'Live editor', nodes: ['Edits the real .pptx', 'Typed AI edit ops', 'Undo / redo', 'Fix overflow'] }
      ],
      bands: [
        { label: 'Platform', items: ['FastAPI', 'PostgreSQL 16', 'Blob Storage', 'LibreOffice worker', 'Node + pptxgenjs', 'Entra ID'] },
        { label: 'Reliability', items: ['Append-only versions', 'Optimistic concurrency', 'Idempotency keys', 'Capped revision loops', 'Versioned prompts', 'Golden-file tests'] }
      ]
    },
    flow: {
      title: 'Generation, step by step',
      steps: [
        ['Understand', 'Short documents in one direct call; long ones via parallel section summaries and a global synthesis.'],
        ['Story & outline', 'Title, audience, a 120–180 word central message and 3–25 slides, each with evidence references.'],
        ['Validate grounding', 'Deterministic checks: every cited evidence ID must exist.'],
        ['Write slides as code', 'One self-contained build function per slide, streamed in parallel batches of up to six.'],
        ['Run & merge', 'Each slide runs in isolation, then lands on the template’s real cover, content and closing layouts.'],
        ['QA & repair', 'Overlap, bounds and contrast checks plus a vision review; only flagged slides are rewritten.']
      ]
    },
    features: [
      ['Evidence on every slide', 'Each slide cites the source sections it was built from.'],
      ['Review before build', 'Approve the story and the outline before a single slide is generated.'],
      ['Chat that knows scope', 'Structural edits never trigger a replan; only story changes rebuild the deck.'],
      ['Native charts & tables', 'Real PowerPoint charts, tables and icons, not screenshots.'],
      ['Corporate or custom templates', 'Uploaded templates are security-scanned, aspect-checked and dry-run merged.'],
      ['Contrast guard', 'Text below a 3:1 contrast ratio is switched automatically, with a font-size floor.'],
      ['Live editor', 'Move, resize, restyle and chart-edit the actual .pptx with undo/redo and AI edits.'],
      ['Version history', 'Every edit creates an immutable version you can roll back to.']
    ],
    highlights: [
      ['69 s → 11 s', 'Short documents skip the section-summary pass and are understood in one direct call.'],
      ['4 calls → 2', 'Summary and outline were merged into a single structured call.'],
      ['Off the event loop', 'Blocking work moved off the event loop, so the slowest poll dropped from >10 s timeouts to about 2 s.'],
      ['Golden-file merge tests', 'Template-merge output is pinned to canonical XML, so regressions are caught at once.']
    ],
    security: ['Entra ID token + approved user on every request', 'Template upload: zip-slip & zip-bomb limits', 'Macro, ActiveX and OLE rejection', 'Safe XML parsing', 'Audit log and admin guards'],
    stack: {
      'AI & agents': ['Anthropic Claude', 'Azure OpenAI GPT-4o', 'LangGraph', 'Structured-output repair', 'Vision QA'],
      'Documents': ['Azure Document Intelligence', 'PptxGenJS', 'python-pptx', 'LibreOffice', 'PyMuPDF', 'resvg'],
      'App & delivery': ['Python', 'FastAPI', 'asyncpg', 'PostgreSQL 16', 'React 18', 'TypeScript', 'Zustand', 'Azure Container Apps']
    },
    role: 'I built the generation path end to end: document understanding and the story-and-outline step, the slide-script generation with streamed parallel batches, the OOXML template merge, and the deterministic and vision QA with targeted repair.'
  }
];
