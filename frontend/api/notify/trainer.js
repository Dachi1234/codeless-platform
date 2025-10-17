// api/notify/trainer.js
const sgMail = require('@sendgrid/mail');
const OpenAI = require('openai'); // CommonJS import

// --- Persona (short & sharp, no randomness) ---
const SYSTEM_PROMPT = `
You are **Laura Stakeholder**, a corporate VP (Product Strategy).
CORE: Business-first, high power, approves scope, threatens escalation when needed.
GOAL: Fast delivery with measurable business impact. Maintain political dominance.

PERSONA LAYERS (use by trigger, not random):
1) Impatient Driver — "Deliver fast. No excuses."
2) Passive-Aggressive Executive — "We agreed on this. Disappointing."
3) Corporate Politician — uses optics, leadership visibility, ownership framing.
4) Manipulative Gaslighter — reframes history to put accountability on PM.
5) Fake-Empathy Diplomat — brief warmth to extract commitments; then pressure.
6) Escalation Enforcer — threatens escalation to management/budget/vendor.

COMMUNICATION STYLE:
- Corporate, assertive, concise. Business language only.
- Avoid tech details; push outcomes, deadlines, KPIs, ownership.
- Ask pointed questions when needed; demand clarity.

EMAIL RULES:
- NEVER mention AI or that an automation generated this.
- Respect the given subject line. Write only the email body.
- 120–200 words unless "tone=executive" (can be shorter & colder).
- Close with:
Regards,
Laura Stakeholder
VP, Product Strategy — Codeless Digital
`;

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

module.exports = async (req, res) => {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  // Security (Bearer token)
  if (!req.headers.authorization || req.headers.authorization !== `Bearer ${process.env.EMAIL_API_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Env checks
  const required = ['SENDGRID_API_KEY', 'EMAIL_FROM', 'EMAIL_TO', 'OPENAI_API_KEY'];
  for (const k of required) {
    if (!process.env[k]) return res.status(500).json({ error: `Missing env ${k}` });
  }

  // Query params
  const { s: subject, m: message, student, project } = req.query || {};
  const tone = (req.query?.tone || 'neutral').toLowerCase(); // neutral|warning|escalation|executive

  if (!subject || !message) {
    return res.status(400).json({ error: 'Missing s (subject) or m (message)' });
  }

  // Build user prompt for GPT
  const contextLines = [
    student ? `PM: ${student}` : null,
    project ? `Project: ${project}` : null,
    `Tone: ${tone}`,
    `Context: ${message}`
  ].filter(Boolean).join('\n');

  let emailBody = null;

  // Try OpenAI first (with short timeout)
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4.1-mini', // fast, good quality; you can upgrade to gpt-4.1 if you want
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `Subject: ${subject}\n${contextLines}\n\nWrite the email body only (no subject):` }
      ],
      temperature: 0.3,
      max_tokens: 400
    });
    emailBody = (completion.choices?.[0]?.message?.content || '').trim();
  } catch (e) {
    // Fallback to static template if OpenAI fails
    const header =
      tone === 'escalation' ? '**Escalation Notice**' :
      tone === 'executive'  ? '**Executive Notice**'  :
      tone === 'warning'    ? '**Formal Warning**'    :
                              '**Notification**';

    const identity = [
      student ? `**PM:** ${student}` : null,
      project ? `**Project:** ${project}` : null,
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

  // Send via SendGrid
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  try {
    // Convert markdown-ish body to HTML
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
