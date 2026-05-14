import { NextResponse } from 'next/server';
import { Resend } from 'resend';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'Email service not configured' },
      { status: 500 }
    );
  }

  let body: { name?: string; email?: string; description?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  const name = body.name?.trim();
  const email = body.email?.trim();
  const description = body.description?.trim();

  if (!name || !email || !description) {
    return NextResponse.json(
      { error: 'Missing required fields' },
      { status: 400 }
    );
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
  }
  if (description.length < 10) {
    return NextResponse.json({ error: 'Message too short' }, { status: 400 });
  }

  const to = process.env.CONTACT_TO_EMAIL || 'dirckmulder20@gmail.com';
  const from = process.env.CONTACT_FROM_EMAIL || 'onboarding@resend.dev';

  const resend = new Resend(apiKey);
  const { data, error } = await resend.emails.send({
    from: `Portfolio Contact <${from}>`,
    to,
    replyTo: email,
    subject: `New portfolio message from ${name}`,
    text: `From: ${name} <${email}>\n\n${description}`,
    html: `<p><strong>From:</strong> ${escapeHtml(name)} &lt;${escapeHtml(email)}&gt;</p><p style="white-space:pre-wrap">${escapeHtml(description)}</p>`,
  });

  if (error) {
    console.error('Resend error:', error);
    return NextResponse.json(
      { error: error.message || 'Send failed' },
      { status: 502 }
    );
  }

  return NextResponse.json({ id: data?.id ?? null });
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
