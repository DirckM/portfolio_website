import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Trap Track Support',
  description:
    'How to play Trap Track with friends and on a TV, how coins and purchases work, the tournament rules, and how to reach a person.',
};

const SUPPORT_EMAIL = 'support@dirckmulder.com';
const TV_URL = 'https://188-245-0-9.sslip.io/tv';

type Entry = { q: string; a: React.ReactNode };
type Topic = { id: string; title: string; entries: Entry[] };

const TOPICS: Topic[] = [
  {
    id: 'playing',
    title: 'Playing with friends',
    entries: [
      {
        q: 'How do I race my friends?',
        a: "Tap Play with friends on the home screen. Make a room and share the 5-letter code, or join a friend's room with their code. Empty seats are filled with bots, so you can start with two players.",
      },
      {
        q: 'What is the Big Screen?',
        a: (
          <>
            One screen shows the race in split screen and every phone becomes a
            controller. Open <a href={TV_URL}>{TV_URL}</a> on a TV, laptop or
            Raspberry Pi, or tap the TV button in the app on an iPad. Up to four
            phones scan the QR code or type the code in the app under Friends.
            The first phone to join picks the map and starts.
          </>
        ),
      },
      {
        q: 'Do my friends need the app?',
        a: 'No. On the Big Screen a phone can play from the browser after scanning the QR code. With the app they race their own racer and keep the coins they win.',
      },
    ],
  },
  {
    id: 'coins',
    title: 'Coins and purchases',
    entries: [
      {
        q: 'How do I get coins?',
        a: 'By racing, finishing missions, the daily reward, inviting friends and winning tournaments. Coins can also be bought in the iPhone app. Coins unlock racers, karts and looks. They have no cash value.',
      },
      {
        q: 'I bought coins and did not get them.',
        a: 'Close the game completely and open it again: a purchase that was interrupted is added on the next start. If they are still missing, email us with the date of the purchase.',
      },
      {
        q: 'How do I get a refund?',
        a: (
          <>
            Purchases are handled by Apple, so refunds are too. Request one at{' '}
            <a href='https://reportaproblem.apple.com'>
              reportaproblem.apple.com
            </a>
            .
          </>
        ),
      },
      {
        q: 'Can I stop my child from buying coins?',
        a: 'Players under 13 need a parent to approve each purchase in the game. You can also turn on Ask to Buy in Family Sharing, or block in-app purchases in Screen Time.',
      },
    ],
  },
  {
    id: 'progress',
    title: 'Progress',
    entries: [
      {
        q: 'Where is my progress saved?',
        a: 'On your phone. There are no accounts, so deleting the app deletes your progress, coins and racers. A new phone starts fresh.',
      },
    ],
  },
];

export default function TrapTrackSupportPage() {
  return (
    <article className='mx-auto max-w-3xl px-6 py-16'>
      <h1 className='text-3xl font-semibold tracking-tight'>
        Trap Track Support
      </h1>
      <p className='mt-3 text-sm leading-relaxed text-library-gray'>
        Answers to the common questions, the tournament rules, and how to reach
        a person. For what the game stores, see the{' '}
        <Link href='/privacy/trap-track' className='underline'>
          Trap Track privacy policy
        </Link>
        .
      </p>

      <div className='mt-10 space-y-10 text-sm leading-relaxed text-library-gray [&_a]:underline'>
        {TOPICS.map(t => (
          <section key={t.id} id={t.id}>
            <h2 className='text-lg font-semibold text-black'>{t.title}</h2>
            <dl className='mt-4 space-y-5'>
              {t.entries.map(e => (
                <div key={e.q}>
                  <dt className='font-medium text-black'>{e.q}</dt>
                  <dd className='mt-1'>{e.a}</dd>
                </div>
              ))}
            </dl>
          </section>
        ))}

        <section id='tournament-rules'>
          <h2 className='text-lg font-semibold text-black'>
            Official tournament rules
          </h2>
          <ol className='mt-4 list-decimal space-y-2 pl-5'>
            <li>
              Official tournaments are run by Trap Track (Pure Studio, Dirck
              Mulder, the Netherlands). Tournaments made by players are run by
              the player who made them, inside the game.
            </li>
            <li>
              Anyone with the game can enter for free while the tournament is
              open. No purchase is needed to enter or to win, and buying coins
              does not improve your chances.
            </li>
            <li>
              Players race the tournament&apos;s mode and map against bots as
              often as they like. The best score of each copy of the game
              counts. If the tournament has a final, the top four race it out
              live and that race decides their order.
            </li>
            <li>
              Prizes are in-game coins, added to the winning copy of the game.
              Coins have no cash value, cannot be exchanged for money and cannot
              be transferred.
            </li>
            <li>
              Cheating, using more than one copy of the game to win your own
              tournament, or tampering with the game removes the result.
            </li>
            <li>
              Apple is not a sponsor of any Trap Track tournament and is not
              involved in any way.
            </li>
          </ol>
        </section>

        <section id='contact'>
          <h2 className='text-lg font-semibold text-black'>Contact</h2>
          <p className='mt-2'>
            Email <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>. A
            person reads every message, usually within two working days.
          </p>
        </section>
      </div>
    </article>
  );
}
