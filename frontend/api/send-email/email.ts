// api/send-email/email.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import sgMail from '@sendgrid/mail';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const required = ['SENDGRID_API_KEY', 'EMAIL_FROM', 'EMAIL_TO'] as const;
  for (const k of required) {
    if (!process.env[k]) return res.status(500).json({ error: `Missing env ${k}` });
  }

  const { subject, body_markdown } = (req.body ?? {}) as {
    subject?: string; body_markdown?: string;
  };
  if (!subject || !body_markdown) {
    return res.status(400).json({ error: 'subject and body_markdown are required' });
  }

  sgMail.setApiKey(process.env['SENDGRID_API_KEY']!);

  try {
    await sgMail.send({
      to: process.env['EMAIL_TO']!,
      from: { email: process.env['EMAIL_FROM']!, name: 'Laura Stakeholder' },
      subject,
      text: body_markdown,
      html: body_markdown
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/\n/g, '<br/>'),
    });
    return res.status(200).json({ ok: true });
  } catch (err: any) {
    return res.status(500).json({ error: 'send_failed', detail: err?.message ?? String(err) });
  }
}
