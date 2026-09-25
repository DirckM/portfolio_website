import { NextResponse } from 'next/server';
import {
  renderConfirmEmail,
  renderAlreadySubscribedEmail,
} from '@/lib/email/confirm';
import { kitByName } from '@/lib/kits';

export const runtime = 'nodejs';

/**
 * Renders the confirmation email in the browser, from the SAME function that
 * sends it, so what is approved here is what lands in an inbox.
 *
 * `?kind=already` renders the "already subscribed" reply instead, and
 * `?kit=app-demo` renders either one as sent from that kit's form.
 *
 * Development only, like the welcome preview. An open endpoint that renders
 * mail templates is free reconnaissance and there is nothing here worth it.
 */
export async function GET(request: Request) {
  if (process.env.NODE_ENV === 'production') {
    return new NextResponse('Not found', { status: 404 });
  }

  const params = new URL(request.url).searchParams;
  const kit = kitByName(params.get('kit'));

  const { html } =
    params.get('kind') === 'already'
      ? renderAlreadySubscribedEmail({ kit })
      : renderConfirmEmail({
          site: 'https://dirckmulder.com',
          confirmToken: 'preview_token_not_real',
          kit,
        });

  // Same as the welcome preview: point assets added in this branch at this
  // server, since they are not on the live site yet.
  return new NextResponse(
    html.replace(/https:\/\/dirckmulder\.com\/(email|kits)/g, '/$1'),
    {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    }
  );
}
