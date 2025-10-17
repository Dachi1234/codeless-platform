// api/notify/trainer.js
const sgMail = require('@sendgrid/mail');
const OpenAI = require('openai'); // CommonJS

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

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Helper: map tones to allow-list
const TONES = new Set(['neutral','warning','escalation','executive']);

module.exports = async (req, res) => {
  try {
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'method_not_allowed' });
    }

    // ---- Auth (Bearer) ----
    const auth = req.headers.authorization;
    const expected = process.env.EMAIL_API_SECRET;
    if (!expected) {
      return res.status(500).json({ error: 'server_misconfig', detail: 'Missing env EMAIL_API_SECRET' });
    }
    if (!auth || auth !== `Bearer ${expected}`) {
      return res.status(401).json({ error: 'unauthorized' });
    }

    // ---- Required envs for services ----
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: 'server_misconfig', detail: 'Missing env OPENAI_API_KEY' });
    }
    if (!process.env.SENDGRID_API_KEY) {
      return res.status(500).json({ error: 'server_misconfig', detail: 'Missing env SENDGRID_API_KEY' });
    }

    // ---- Query params ----
    const qp = req.query || {};
    const subject = String(qp.s || '').slice(0, 200).trim();
    const message = String(qp.m || '').slice(0, 1200).trim();
    const student = qp.student ? String(qp.student).slice(0, 200).trim() : '';
    const project = qp.project ? String(qp.project).slice(0, 300).trim() : '';
    const tone = TONES.has((qp.tone || '').toLowerCase()) ? (qp.tone || 'neutral').toLowerCase() : 'neutral';

    if (!subject || !message) {
      return res.status(400).json({ error: 'bad_request', detail: 'Missing s (subject) or m (message)' });
    }

    // ---- Email targets (env with safe defaults) ----
    const EMAIL_FROM = (process.env.EMAIL_FROM).trim();
    const EMAIL_TO   = (process.env.EMAIL_TO).trim();

    // ---- Build user prompt for GPT ----
    const contextLines = [
      student ? `PM: ${student}` : null,
      project ? `Project: ${project}` : null,
      `Tone: ${tone}`,
      `Context: ${message}`
    ].filter(Boolean).join('\n');

    // ---- Generate with OpenAI (fallback to static if fails) ----
    let emailBody = '';
    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4.1-mini',
        temperature: 0.3,
        max_tokens: 400,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: `Subject: ${subject}\n${contextLines}\n\nWrite the email body only (no subject):` }
        ]
      });
      emailBody = (completion.choices?.[0]?.message?.content || '').trim();
      if (!emailBody) throw new Error('empty_completion');
    } catch (genErr) {
      const header =
        tone === 'escalation' ? '**Escalation Notice**' :
        tone === 'executive'  ? '**Executive Notice**'  :
        tone === 'warning'    ? '**Formal Warning**'    :
                                '**Notification**';

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

    // ---- Send via SendGrid ----
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    // Basic HTML-safe transform for Markdown **bold** + line breaks
    const html = emailBody
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br/>');

    const text = emailBody.replace(/<[^>]*>/g, '').replace(/\*\*/g, '');

    try {
      await sgMail.send({
        to: EMAIL_TO,
        from: { email: EMAIL_FROM, name: 'Laura Stakeholder' },
        subject,
        text,
        html
      });
    } catch (sendErr) {
      // Surface the true cause to the caller so you don’t get a vague 500 in the GPT Action logs
      return res.status(502).json({
        error: 'sendgrid_send_failed',
        detail: sendErr?.response?.body || sendErr?.message || String(sendErr)
      });
    }

    return res.status(200).json({ ok: true });
  } catch (e) {
    // Last-resort handler
    return res.status(500).json({ error: 'unhandled_server_error', detail: e?.message || String(e) });
  }
};
