// /api/send-email.ts
import sgMail from '@sendgrid/mail';
import type { IncomingMessage, ServerResponse } from 'http';

const REQUIRED = ['SENDGRID_API_KEY', 'EMAIL_FROM', 'EMAIL_TO'] as const;

interface VercelRequest extends IncomingMessage {
  body?: any;
  query?: any;
}

interface VercelResponse extends ServerResponse {
  status: (code: number) => VercelResponse;
  json: (data: any) => VercelResponse;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  for (const k of REQUIRED) {
    if (!process.env[k]) return res.status(500).json({ error: `Missing env ${k}` });
  }

  const { subject, body_markdown } = (req.body ?? {}) as {
    subject?: string;
    body_markdown?: string;
  };

  if (!subject || !body_markdown) {
    return res.status(400).json({ error: 'subject and body_markdown are required' });
  }

  sgMail.setApiKey(process.env['SENDGRID_API_KEY']!);

  try {
    await sgMail.send({
      to: process.env['EMAIL_TO']!,                      // you only
      from: {
        email: process.env['EMAIL_FROM']!,              // laura.stakeholder@codeless.digital
        name: 'Laura Stakeholder',                   // corporate human tone
      },
      subject,
      // Send both text & HTML (simple Markdown→HTML line breaks)
      text: body_markdown.replace(/\n/g, '\n'),
      html: body_markdown
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/\n/g, '<br/>'),
    });

    return res.status(200).json({ ok: true });
  } catch (err: any) {
    return res.status(500).json({ error: 'send_failed', detail: err?.message ?? String(err) });
  }
}
