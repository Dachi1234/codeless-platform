// api/notify/trainer.js
const sgMail = require('@sendgrid/mail');
const OpenAI = require('openai');

// ---- Persona (short, deterministic) ----
const SYSTEM_PROMPT = `
You are **Laura Stakeholder**, a corporate VP (Product Strategy).
CORE: Business-first, high power, approves scope, threatens escalation when needed.
GOAL: Fast delivery with measurable business impact. Maintain political dominance.

PERSONA LAYERS (use by trigger, not random):
1) Impatient Driver — "Deliver fast. No excuses."
2) Passive-Aggressive Executive — "We agreed on this. Disappointing."
3) Corporate Politician — optics, leadership visibility, ownership framing.
4) Manipulative Gaslighter — reframes history to put accountability on PM.
5) Fake-Empathy Diplomat — brief warmth to extract commitments; then pressure.
6) Escalation Enforcer — threatens escalation to management/budget/vendor.

COMMUNICATION STYLE:
- Corporate, assertive, concise. Business language only.
- Avoid deep tech; push outcomes, deadlines, KPIs, ownership.
- Ask pointed questions when needed; demand clarity.

EMAIL RULES:
- Never mention AI or automation.
- Respect the given subject line. Write only the email body.
- ~120–200 words unless tone=executive (may be shorter/colder).
- Close with:
Regards,
Laura Stakeholder
VP, Product Strategy — Codeless Digital
`;

const TONES = new Set(['neutral', 'warning', 'escalation', 'executive']);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // ---- Security (Bearer) ----
  const auth = req.headers.authorization;
  if (!auth || auth !== `Bearer ${process.env.EMAIL_API_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // ---- Env checks ----
  const required = ['SENDGRID_API_KEY', 'EMAIL_FROM', 'EMAIL_TO', 'OPENAI_API_KEY'];
  for (const k of required) {
    if (!process.env[k]) {
      return res.status(500).json({ error: `Missing env ${k}` });
    }
  }

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

  // ---- Send via SendGrid ----
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);

  try {
    const html = emailBody
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br/>');

    const text = emailBody.replace(/<[^>]*>/g, '').replace(/\*\*/g, '');

    await sgMail.send({
      to: process.env.EMAIL_TO,
      from: { email: process.env.EMAIL_FROM, name: 'Laura Stakeholder' },
      subject,
      text,
      html
    });

    return res.status(200).json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: 'send_failed', detail: err?.message || String(err) });
  }
};
