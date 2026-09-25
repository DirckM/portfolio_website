import NewsletterSignup from './NewsletterSignup';

/**
 * The App demo kit signup, for use inside a post.
 *
 * It is the ordinary newsletter form with giveaway copy, not a second form. The
 * kit is not handed over here: it arrives in the welcome email after the
 * double opt-in, so the signup is exactly the one CONSENT_TEXT describes and
 * the fine print says so in plain words.
 *
 * Both placements send a source starting with `kit:app-demo`, which is what the
 * confirm route keys the kit on, and the suffix says which one converted.
 */
export default function KitSignup({
  placement = 'end',
}: {
  placement?: 'top' | 'end';
}) {
  const shared = {
    cta: 'Send me the kit',
    successTitle: 'Check your inbox.',
    successBody: 'Confirm and the kit is in the next email.',
    finePrint:
      'Free. The only cost is signing up to my newsletter: one email a month, with a one-click unsubscribe in every one.',
  };

  if (placement === 'top') {
    return (
      <div
        data-own-signup
        className='not-prose my-10 border-y border-black/10 py-6'
      >
        <NewsletterSignup
          source='kit:app-demo:top'
          headline='Free kit'
          blurb='The skill and templates I used for these demos. Free. No payment, no catch, just your email, and they come straight to you.'
          {...shared}
        />
      </div>
    );
  }

  return (
    <div data-own-signup className='not-prose my-12'>
      <NewsletterSignup
        source='kit:app-demo'
        layout='panel'
        headline='The App demo kit, free'
        blurb='These are the skills I use to make these. Want them? Free. No payment, no catch, just your email, and they come straight to you. A Claude Code skill plus the UI test, recording script, auto-cut and phone page as templates.'
        {...shared}
      />
    </div>
  );
}
