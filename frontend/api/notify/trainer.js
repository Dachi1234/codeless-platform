// ---- Query params ----
const qp = req.query || {};
const subject = String(qp.s || '').slice(0, 200).trim();
const message = String(qp.m || '').slice(0, 1200).trim();
const student = qp.student ? String(qp.student).slice(0, 200).trim() : '';
const project = qp.project ? String(qp.project).slice(0, 300).trim() : '';
const tone = TONES.has((qp.tone || '').toLowerCase()) ? (qp.tone || 'neutral').toLowerCase() : 'neutral';

// NEW: audience & optional metadata
const audience = ((qp.recipient || qp.audience || 'trainer') + '').toLowerCase(); // 'trainer' | 'pm'
const severity = (qp.severity || '').toLowerCase(); // optional
const due = (qp.due || '').trim();                  // optional YYYY-MM-DD
const kpi = (qp.kpi || '').trim();                  // optional
const evidence = (qp.evidence || '').trim();        // optional
const ask = (qp.ask || '').trim();                  // optional

if (!subject || !message) {
  return res.status(400).json({ error: 'bad_request', detail: 'Missing s (subject) or m (message)' });
}

// ---- Build role-specific prompt ----
const ROLE_TRAINER = `
You are writing an INTERNAL escalation report to leadership/trainer (not to the PM).
- Never address the PM directly.
- Summarize facts crisply; avoid emotions except where useful for risk framing.
- Use this structure (headings as bullets, no greeting):
Summary — 1–2 lines.
Context — who/what/when (student, project).
Evidence — quotes/links if provided; otherwise concise facts.
Risk & Impact — business metrics/KPIs at risk.
Request — the concrete action you ask leadership to take.
Next Steps — what you will do by when.
Close with the standard signature block.
`;

const ROLE_PM = `
You are writing directly to the PM (student). Apply persona pressure appropriately.
`;

const roleBlock = audience === 'trainer' ? ROLE_TRAINER : ROLE_PM;

// ---- Build model input ----
const metaLines = [
  student ? `PM: ${student}` : null,
  project ? `Project: ${project}` : null,
  severity ? `Severity: ${severity}` : null,
  due ? `Due: ${due}` : null,
  kpi ? `KPI: ${kpi}` : null,
  evidence ? `Evidence: ${evidence}` : null,
  ask ? `RequestedAction: ${ask}` : null,
  `Tone: ${tone}`,
  `Context: ${message}`
].filter(Boolean).join('\n');

// ---- Generate with OpenAI ----
let emailBody = '';
try {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4.1-mini',
    temperature: 0.2,
    max_tokens: 500,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT + '\n' + roleBlock },
      { role: 'user', content: `Subject: ${subject}\n${metaLines}\n\nWrite the email body only (no subject):` }
    ]
  });
  emailBody = (completion.choices?.[0]?.message?.content || '').trim();
  if (!emailBody) throw new Error('empty_completion');
} catch (genErr) {
  // Fallback renders an internal report if audience=trainer, else your current fallback
  const isTrainer = audience === 'trainer';
  const header =
    tone === 'escalation' ? '**Escalation Notice**' :
    tone === 'executive'  ? '**Executive Notice**'  :
    tone === 'warning'    ? '**Formal Warning**'    :
                            '**Notification**';

  if (isTrainer) {
    emailBody = [
      '**Summary** — ' + subject,
      student ? `**Context** — PM: ${student}${project ? ` • Project: ${project}` : ''}` : (project ? `**Context** — Project: ${project}` : ''),
      evidence ? `**Evidence** — ${evidence}` : null,
      (kpi || severity) ? `**Risk & Impact** — ${[kpi && `KPI: ${kpi}`, severity && `Severity: ${severity}`].filter(Boolean).join(' • ')}` : '**Risk & Impact** — Business delivery at risk.',
      ask ? `**Request** — ${ask}` : '**Request** — Review and advise next step.',
      due ? `**Next Steps** — Deliverable due ${due}.` : '**Next Steps** — Will follow up with a concrete plan by EOD.',
      '',
      'Regards,',
      'Laura Stakeholder',
      'VP, Product Strategy — Codeless Digital'
    ].filter(Boolean).join('\n');
  } else {
    const identity = [
      student ? `**PM:** ${student}` : null,
      project ? `**Project:** ${project}` : null
    ].filter(Boolean).join('  \n');

    emailBody = [
      header,
      identity,
      '',
      message,
      '',
      'Regards,',
      'Laura Stakeholder',
      'VP, Product Strategy — Codeless Digital'
    ].filter(Boolean).join('\n');
  }
}
