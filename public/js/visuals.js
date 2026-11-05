// Animated, theme-aware project illustrations. Pure HTML + CSS; shared by the home wheel and case studies.
window.renderViz = (() => {
  const frame = (meta, body, foot) => `
    <div class="viz-meta"><span>${meta[0]}</span><span>${meta[1]}</span></div>
    <div class="viz-stage">${body}</div>
    <div class="viz-foot"><span>${foot[0]}</span><span>${foot[1]}</span></div>`;

  const kinds = {
    rag: () => frame(['01 · Knowledge systems', 'Agentic RAG'], `
      <div class="rag">
        <div class="rag-docs">
          <div class="rag-doc d1">PDF<i>››</i></div><div class="rag-doc d2">PPT<i>››</i></div><div class="rag-doc d3">DOC<i>››</i></div>
          <span class="viz-cap">17K+ sources</span>
        </div>
        <svg class="rag-wires" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0 30 C 40 30, 50 50, 100 50"/><path d="M0 50 L100 50"/><path d="M0 70 C 40 70, 50 50, 100 50"/>
        </svg>
        <div class="rag-hub">
          <div class="rag-core"><b>RAG</b><small>core</small></div>
          <span class="rag-chip c1">Intent</span><span class="rag-chip c2">Retrieve</span><span class="rag-chip c3">Reason</span><span class="rag-chip c4 alt">Cite</span>
          <i class="rag-orbit"></i>
        </div>
        <div class="rag-answer">
          <span class="ok">✓</span><strong>Grounded answer</strong><small>References + media</small>
          <div class="rag-cites"><i></i><i></i><i></i></div>
          <div class="rag-src"><em>p.14</em><em>p.3</em><em>slide 7</em></div>
        </div>
      </div>`, ['Agents · retrieval · citations', '↗ Context → answer']),

    rfp: () => frame(['02 · Proposal automation', 'Compliance matrix'], `
      <div class="rfp">
        <div class="rfp-doc"><b>RFP</b><i></i><i></i><i class="s"></i><i></i><i class="s"></i><i></i><span class="rfp-scan"></span><span class="viz-cap">Tender · 84 pp</span></div>
        <div class="rfp-rows">
          <div class="rfp-row" style="--d:0"><span>REQ-01</span><p>ISO 27001 certification</p><em class="met">Met</em></div>
          <div class="rfp-row" style="--d:1"><span>REQ-02</span><p>3 reference projects</p><em class="met">Met</em></div>
          <div class="rfp-row" style="--d:2"><span>REQ-03</span><p>24/7 support SLA</p><em class="part">Partial</em></div>
          <div class="rfp-row" style="--d:3"><span>REQ-04</span><p>Audited financials</p><em class="met">Met</em></div>
          <div class="rfp-row" style="--d:4"><span>REQ-05</span><p>Data residency</p><em class="rev">Review</em></div>
        </div>
        <div class="rfp-sum">
          <small>Compliance</small><b><span>84</span>%</b>
          <div class="rfp-bar"><i style="--w:68%"></i><i class="p" style="--w:18%"></i><i class="r" style="--w:14%"></i></div>
          <div class="rfp-files"><em>.xlsx</em><em>.docx</em><em>.zip</em></div>
        </div>
      </div>`, ['Extract → clarify → evaluate', 'LangGraph · HITL']),

    claims: () => frame(['03 · Insurance AI', 'Serverless agents'], `
      <div class="clm">
        <div class="clm-in"><em>Email</em><em>Form</em><em>Photo</em><em>Scan</em></div>
        <div class="clm-orch"><span>LangGraph orchestrator</span><i></i></div>
        <div class="clm-chain">
          <b style="--i:0">Ingest</b><b style="--i:1">Extract</b><b style="--i:2">Validate</b><b style="--i:3">Risk</b><b style="--i:4">Decide</b><b style="--i:5">Route</b>
        </div>
        <div class="clm-hitl"><span>⏸</span><div><strong>Human checkpoint</strong><small>state saved · resumes exactly here</small></div></div>
        <div class="clm-card">
          <small>Claim · auto · new</small><strong>Ready for adjuster</strong>
          <div class="clm-meter"><span>Fraud risk</span><div><i></i></div><em>Low</em></div>
          <div class="clm-meter"><span>Severity</span><div><i class="m"></i></div><em>Med</em></div>
        </div>
      </div>`, ['Confidence-gated · durable', 'AWS · Bedrock']),

    field: () => frame(['04 · Sales intelligence', 'Today’s plan'], `
      <div class="fld">
        <div class="fld-list">
          <div class="fld-row" style="--s:87;--d:0"><i class="ring"><b>87</b></i><div><strong>Outlet 214</strong><small>Sales trend ↓ · float 2 days</small></div><em class="u">Urgent</em></div>
          <div class="fld-row" style="--s:64;--d:1"><i class="ring"><b>64</b></i><div><strong>Outlet 087</strong><small>No visit in 19 days</small></div><em>High</em></div>
          <div class="fld-row" style="--s:31;--d:2"><i class="ring"><b>31</b></i><div><strong>Outlet 152</strong><small>Healthy · upsell window</small></div><em class="l">Low</em></div>
        </div>
        <div class="fld-ask">
          <div class="fld-q">Which outlets in my area are slipping?</div>
          <div class="fld-a"><span>Ask AI</span><div class="fld-bars"><i style="--h:82%"></i><i style="--h:64%"></i><i style="--h:47%"></i><i style="--h:30%"></i><i style="--h:22%"></i></div></div>
        </div>
      </div>`, ['Score → action → brief', 'XGBoost · agents']),

    deck: () => frame(['05 · Document → deck', 'Slides as code'], `
      <div class="dck">
        <div class="dck-src"><b>Report.pdf</b><i></i><i></i><i class="s"></i><i></i><span class="viz-cap">Big idea →</span></div>
        <div class="dck-outline"><em style="--d:0">1 · Opening</em><em style="--d:1">2 · Findings</em><em style="--d:2">3 · Risks</em><em style="--d:3">4 · Next steps</em></div>
        <div class="dck-slides">
          <div class="dck-slide s1"><b></b><i></i><i class="s"></i></div>
          <div class="dck-slide s2"><b></b><div class="dck-chart"><i style="--h:40%"></i><i style="--h:75%"></i><i style="--h:55%"></i><i style="--h:90%"></i></div></div>
          <div class="dck-slide s3"><b></b><i></i><i></i><i class="s"></i><span class="dck-qa">Vision QA ✓</span></div>
        </div>
      </div>`, ['Outline → PptxGenJS → template', 'Claude · OOXML'])
  };

  return (kind) => `<div class="viz viz--${kind}" aria-hidden="true">${(kinds[kind] || kinds.rag)()}</div>`;
})();
