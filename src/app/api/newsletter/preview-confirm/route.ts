import { NextResponse } from 'next/server';
import { renderConfirmEmail } from '@/lib/email/confirm';

export const runtime = 'nodejs';

/**
 * Renders the confirmation email in the browser, from the SAME function that
 * sends it, so what is approved here is what lands in an inbox.
 *
 * Development only, like the welcome preview. An open endpoint that renders
 * mail templates is free reconnaissance and there is nothing here worth it.
 */
export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return new NextResponse('Not found', { status: 404 });
  }

  const { html } = renderConfirmEmail({
    site: 'https://dirckmulder.com',
    confirmToken: 'preview_token_not_real',
  });

  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}
