import type { Metadata } from 'next';
import Link from 'next/link';
import { LEGAL } from '@/lib/legal';

export const metadata: Metadata = {
  title: 'Trap Track Privacy Policy',
  description:
    'What the Trap Track game keeps on your phone, the little it sends to our server, and what it never collects.',
};

const UPDATED = '2026-10-10';

export default function TrapTrackPrivacyPage() {
  return (
    <article className='mx-auto max-w-3xl px-6 py-16'>
      <h1 className='text-3xl font-semibold tracking-tight'>
        Trap Track Privacy Policy
      </h1>
      <p className='mt-2 text-sm text-library-gray'>Last updated: {UPDATED}</p>

      <div className='mt-10 space-y-6 text-sm leading-relaxed text-library-gray [&_h2]:mt-8 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-black [&_a]:underline'>
        <p>
          Trap Track is a kart racing party game for iPhone and for the web (the
          Big Screen on a TV or laptop, and the phone controller that opens from
          its QR code). This policy covers the game only. For the website, see
          the <Link href='/privacy'>main privacy policy</Link>.
        </p>
        <p>
          The short version: there are no accounts, no real names, no chat, no
          ads, no tracking and no location. Your progress lives on your phone.
          The server only sees a random number that stands for your copy of the
          game.
        </p>

        <h2>1. Who is responsible</h2>
        <p>
          {LEGAL.controller.name}, based in {LEGAL.controller.address}. For
          privacy questions:{' '}
          <a href={`mailto:${LEGAL.privacyEmail}`}>{LEGAL.privacyEmail}</a>. For
          help with the game:{' '}
          <a href='mailto:support@dirckmulder.com'>support@dirckmulder.com</a>.
        </p>

        <h2>2. What stays on your phone</h2>
        <p>
          Your coins, racers, karts, levels, missions, settings and race history
          are stored on the device and never uploaded. The game asks for your
          birth year once, only to know whether a parent should approve
          purchases. It keeps the age band (under 13 or older), not the year.
          Deleting the app deletes all of this.
        </p>

        <h2>3. What goes to our server</h2>
        <p>
          When you first open the game it makes up a{' '}
          <strong>random device id</strong>. It is not linked to your name, your
          Apple ID or your phone&apos;s hardware. The server stores it only for
          these features:
        </p>
        <ul className='list-disc space-y-1 pl-5'>
          <li>
            <strong>Invite a friend.</strong> Your 6-letter invite code, the
            random ids of friends who used it, timestamps and coin counters, so
            both of you get your coins once.
          </li>
          <li>
            <strong>Tournaments.</strong> The random id of each player, the
            racer they drove, their scores and timestamps, so the leaderboard
            and the coin prize go to the right copy of the game.
          </li>
          <li>
            <strong>School posters.</strong> When a poster&apos;s QR code is
            scanned we count it. To count a scan once per visitor, the IP
            address is hashed with a random value that only lives in memory and
            is thrown away within 24 hours. No IP address is ever written to
            disk. If the game was installed through a poster, we count that
            install and whether the game is still played after 1 and 7 days, as
            totals per poster.
          </li>
        </ul>
        <p>
          <strong>Playing online and on the Big Screen.</strong> Rooms exist
          only in the server&apos;s memory while you play. A room holds the
          generated racer name (like &quot;Fuzzy Penguin&quot;), the racer and
          kart you picked, and your steering. Emotes are a fixed set of icons
          and words, there is no free text and no chat. Nothing from a room is
          stored after it closes.
        </p>
        <p>
          Legal basis: our legitimate interest in running the multiplayer,
          invite and tournament features you choose to use (Art. 6(1)(f) GDPR),
          and performance of the contract to supply the game (Art. 6(1)(b)).
        </p>

        <h2>4. Purchases</h2>
        <p>
          Coins can be bought in the iPhone app. Apple handles the payment and
          we never see your payment details. The app keeps the purchase&apos;s
          transaction id on your phone so the coins are added exactly once.
          Coins have no cash value and cannot be exchanged for money. Players
          under 13 need a parent to approve a purchase in the game, on top of
          Ask to Buy for children in an Apple family group.
        </p>

        <h2>5. What we never collect</h2>
        <p>
          No email address, no phone number, no real name, no photos, no
          contacts, no location, no advertising id. The game contains no ads, no
          third-party analytics and no tracking across other apps or websites.
        </p>

        <h2>6. Who processes data for us</h2>
        <ul className='list-disc space-y-1 pl-5'>
          <li>
            <strong>Hetzner</strong> (Falkenstein, Germany) runs the game server
            that holds the records in section 3.
          </li>
          <li>
            <strong>Apple</strong> runs the App Store and the in-app purchases.
          </li>
        </ul>
        <p>
          The game server is in the EU. Apple is a United States company, see{' '}
          <a href='https://www.apple.com/legal/privacy/'>
            Apple&apos;s privacy policy
          </a>{' '}
          for what it does with App Store purchases.
        </p>

        <h2>7. How long we keep things</h2>
        <p>
          Room data disappears when the room closes. Hashed scan values
          disappear within 24 hours. Invite and tournament records stay while
          those features run, so pending coins can still be paid out. Poster
          figures are kept as totals.
        </p>

        <h2>8. Your rights</h2>
        <p>
          Under the GDPR you can ask for access, correction, erasure or a copy
          of your data, or object to processing. Because the records hold only a
          random id, we cannot find them by name: write to{' '}
          <a href={`mailto:${LEGAL.privacyEmail}`}>{LEGAL.privacyEmail}</a> with
          the invite code shown in the game under Friends, Invite friends, and
          we delete every record linked to that copy of the game. You may also
          complain to the Autoriteit Persoonsgegevens.
        </p>

        <h2>9. Children</h2>
        <p>
          Trap Track is made for players aged 9 and up, and many of them are
          children. That is why the game has no accounts, no names, no chat, no
          ads and no tracking, and why purchases by players under 13 need a
          parent. A parent can ask us to delete the records in section 3 at any
          time using the email address above.
        </p>

        <h2>10. Changes</h2>
        <p>
          If this policy changes materially, the date at the top changes with
          it.
        </p>
      </div>
    </article>
  );
}
