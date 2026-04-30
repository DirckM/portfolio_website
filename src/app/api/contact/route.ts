import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const TO_EMAIL = 'dirckmulder20@gmail.com';
const FROM_EMAIL = 'Portfolio Contact <onboarding@resend.dev>';

export async function POST(request: Request) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error('RESEND_API_KEY is not set');
    return NextResponse.json(
      { error: 'Email service not configured' },
      { status: 500 }
    );
  }

  let body: { name?: string; email?: string; message?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const name = body.name?.trim();
  const email = body.email?.trim();
  const message = body.message?.trim();

  if (!name || !email || !message) {
    return NextResponse.json(
      { error: 'Name, email, and message are required' },
      { status: 400 }
    );
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json(
      { error: 'Please enter a valid email address' },
      { status: 400 }
    );
  }
  if (message.length < 10) {
    return NextResponse.json(
      { error: 'Message must be at least 10 characters' },
      { status: 400 }
    );
  }

  const resend = new Resend(apiKey);

  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: TO_EMAIL,
    replyTo: email,
    subject: `Portfolio contact from ${name}`,
    text: `From: ${name} <${email}>\n\n${message}`,
  });

  if (error) {
    console.error('Resend error:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 502 }
    );
  }

  return NextResponse.json({ success: true });
}
