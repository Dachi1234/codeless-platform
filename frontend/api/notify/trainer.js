// api/notify/trainer.js
const sgMail = require('@sendgrid/mail');

module.exports = async (req, res) => {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  // Security
  if (!req.headers.authorization || req.headers.authorization !== `Bearer ${process.env.EMAIL_API_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Env checks
  const required = ['SENDGRID_API_KEY', 'EMAIL_FROM', 'EMAIL_TO'];
  for (const k of required) {
    if (!process.env[k]) return res.status(500).json({ error: `Missing env ${k}` });
  }

  // Query params
  const { s: subject, m: message, student, project, tone = 'neutral' } = req.query || {};
  if (!subject || !message) return res.status(400).json({ error: 'Missing s (subject) or m (message)' });

  const header =
    tone === 'escalation' ? '**Escalation Notice**' :
    tone === 'executive'  ? '**Executive Notice**'  :
    tone === 'warning'    ? '**Formal Warning**'    :
                            '**Notification**';

  const identity = [
    student ? `**PM:** ${student}` : null,
    project ? `**Project:** ${project}` : null,
  ].filter(Boolean).join('  \n');

  const bodyMd = [
    header,
    identity,
    '',
    message,
    '',
    'Regards,  ',
    'Laura Stakeholder  ',
    'VP, Product Strategy — Codeless Digital'
  ].filter(Boolean).join('\n');

  sgMail.setApiKey(process.env.SENDGRID_API_KEY);

  try {
    await sgMail.send({
      to: process.env.EMAIL_TO,
      from: { email: process.env.EMAIL_FROM, name: 'Laura Stakeholder' },
      subject,
      text: bodyMd.replace(/<[^>]*>/g, '').replace(/\*\*/g, ''),
      html: bodyMd
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\n/g, '<br/>'),
    });
    return res.status(200).json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: 'send_failed', detail: err?.message || String(err) });
  }
};
