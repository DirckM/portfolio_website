import type { Metadata } from "next";
import Link from "next/link";
import { LEGAL } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Dishy Terms of Use",
  description:
    "The terms you agree to when you use Dishy, including what the app does not promise about allergens, food safety and prices.",
};

const UPDATED = "2026-09-16";

export default function DishyTermsPage() {
  return (
    <article className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">
        Dishy Terms of Use
      </h1>
      <p className="mt-2 text-sm text-library-gray">Last updated: {UPDATED}</p>

      <div className="mt-10 space-y-6 text-sm leading-relaxed text-library-gray [&_h2]:mt-8 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-black [&_a]:underline">
        <p>
          These terms apply when you use Dishy, an iPhone app published by{" "}
          {LEGAL.controller.name}, based in {LEGAL.controller.address}. By using
          the app you accept them. If you do not accept them, do not use the
          app.
        </p>

        <h2>1. What Dishy is</h2>
        <p>
          Dishy suggests dinners, builds a shopping list and walks you through
          cooking them in one session. It is a planning and convenience tool.
        </p>
        <p>
          <strong>
            It is not medical, dietary, nutritional or food-safety advice, and
            it is not a substitute for any of them.
          </strong>{" "}
          If you have a medical condition, an allergy, an intolerance, or you
          are pregnant, follow the advice of a qualified professional and not
          this app. The app is not designed for pregnancy or for managing any
          medical condition, and we accept no liability where it is relied on
          for either.
        </p>

        <h2>2. Allergens, intolerances and dietary filters</h2>
        <p className="rounded-lg border border-black/10 bg-black/[0.02] p-4">
          <strong className="text-black">
            Read the packaging before you eat anything. Dishy cannot tell you
            whether a specific product in your kitchen is safe for you.
          </strong>
        </p>
        <p>
          Dishy has filters for diets such as vegetarian, vegan, gluten-free and
          dairy-free. Those labels are worked out from the ingredients a recipe
          lists. They describe the <em>recipe as written</em>. They do not and
          cannot describe:
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            the actual product you buy, which may contain different ingredients
            than the generic one the recipe names,
          </li>
          <li>
            &quot;may contain&quot; warnings, shared production lines, or traces
            from a manufacturer,
          </li>
          <li>
            a recipe you have edited, a dish you have swapped, or an ingredient
            you have substituted,
          </li>
          <li>
            cross-contamination in your own kitchen, or in a shop, or in a
            restaurant.
          </li>
        </ul>
        <p>
          Recipe data, ingredient lists and the diet labels derived from them
          can be incomplete or wrong. If you have an allergy or intolerance of
          any kind, <strong>check every label yourself, every time</strong>, and
          treat the app&apos;s labels as a starting point rather than an answer.
          If you substitute, swap or edit anything in a recipe, the diet labels
          no longer describe what you are cooking, and the app does not
          recalculate them for a change it was not told about.
        </p>
        <p>
          To the fullest extent the law allows, we accept no liability for any
          allergic reaction, intolerance, illness or injury arising from
          reliance on diet labels, ingredient lists or filters, whether you set
          the filter or the app derived the label, or from food you selected,
          bought, prepared or ate. This exclusion is subject to clause 11 and
          does not touch any liability that cannot lawfully be excluded, nor
          your rights as a consumer.
        </p>

        <h2>3. Food safety, storage and cooking</h2>
        <p>
          Dishy is built around cooking in advance and keeping food for later.
          Storage times and reheating notes in the app are general guidance, not
          a guarantee about the food in your kitchen. They assume sound
          ingredients, a working fridge at the right temperature, clean
          equipment and prompt cooling.
        </p>
        <p>
          Reheating notes are guidance and do not guarantee that food reaches a
          safe internal temperature. Where a step assumes a particular method,
          appliance or timing, following it is not proof the food is safe. Use a
          thermometer when it matters.
        </p>
        <p>
          You are responsible for judging whether food is safe to eat, for
          cooking it through, for reheating it properly, for avoiding
          cross-contamination and for storing it correctly. When in doubt, throw
          it out. We accept no liability for food-borne illness.
        </p>

        <h2>4. Calories, macros and other numbers</h2>
        <p>
          Nutritional figures are estimates calculated from ingredient data.
          They vary with brands, portioning and how you actually cook. Do not
          rely on them for medical purposes or for managing a condition such as
          diabetes.
        </p>

        <h2>5. Prices and shopping lists</h2>
        <p>
          Every line on a shopping list says whether its price is read from a
          live shelf-price feed or estimated from regional averages. Both can be
          out of date, wrong for your shop, or wrong for the size you buy.
          Prices are for planning. The price you pay at the till is the real
          one, and we do not compensate for a difference.
        </p>
        <p>
          Shop names and logos in the app are used to let you pick where you
          shop. We are not affiliated with, endorsed by or partnered with any
          retailer.
        </p>

        <h2>6. The AI features</h2>
        <p>
          The fridge scan and the support chat send what you give them to{" "}
          <strong>Google Gemini</strong> through a server function, which
          produces the result you see. Neither the photo nor the question is
          stored. See the{" "}
          <Link href="/privacy/dishy">privacy policy</Link> for the detail. AI
          output can be wrong, and it can be wrong confidently. A fridge scan can miss an
          item, invent one, or misread a label. The chat can give an answer that
          does not fit your situation. Check anything that matters before you
          act on it.
        </p>
        <p>
          A fridge scan can misread a label, confuse one product for another, or
          overlook an item entirely. Any allergen conclusion drawn from a
          misidentified product is worthless. Read the packaging.
        </p>
        <p>
          <strong className="text-black">
            Do not ask the chat whether something is safe for your allergy, and
            do not act on an answer if you do.
          </strong>{" "}
          It can be wrong about allergens, storage times and reheating, and it
          can be wrong while sounding certain. It is not a food-safety service
          and it is not medical advice.
        </p>

        <h2>7. Subscriptions, free trial and cancelling</h2>
        <p>
          Dishy is sold as an auto-renewing subscription through the App Store.
          Apple takes the payment and Apple&apos;s terms govern the transaction.
        </p>
        <p>What is sold, and at what price:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong>Annual</strong> &mdash; $69.99 per year, after a 3 day free
            trial.
          </li>
          <li>
            <strong>Monthly</strong> &mdash; $7.99 per month, after a 3 day free
            trial.
          </li>
          <li>
            <strong>Discounted annual</strong> &mdash; $39.99 per year, offered
            once if you leave the plans screen without subscribing. It carries
            no free trial.
          </li>
          <li>
            Prices are the United States ones. Apple converts them for your
            country and the App Store shows the price you will actually pay,
            including tax, before you confirm.
          </li>
        </ul>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            The free trial converts to a paid subscription unless you cancel at
            least 24 hours before it ends. Apple grants one introductory offer
            per subscription group per person, so the free days can be used
            once, on either plan, not on both.
          </li>
          <li>
            Subscriptions renew automatically until cancelled. Apple charges the
            renewal within 24 hours of the period ending.
          </li>
          <li>
            Cancel in iPhone Settings, under your name, then Subscriptions.
            Deleting the app does not cancel a subscription.
          </li>
          <li>
            Refunds are handled by Apple, not by us. We cannot issue them.
          </li>
          <li>
            Consumers in the EU have a 14 day right of withdrawal on a distance
            contract. Because the app is supplied immediately, that right ends
            once supply has begun at your request, which is what starting a
            trial or a subscription does. Apple handles refund requests either
            way, through Report a Problem.
          </li>
          <li>
            Prices can change. A change to an existing subscription is notified
            by Apple and, where required, needs your agreement.
          </li>
        </ul>

        <h2>8. Your account</h2>
        <p>
          You are responsible for keeping access to your email account secure,
          since that is how sign-in works. You can delete your account in the
          app under the You tab. Deleting the account does not cancel a
          subscription.
        </p>

        <h2>9. Acceptable use</h2>
        <p>
          Do not scrape the app, resell its content, use it to build a competing
          dataset, or attempt to break its rate limits. Recipes, text, images
          and the software remain ours or our licensors&apos;.
        </p>

        <h2>10. Availability</h2>
        <p>
          The app is local-first and works offline for planning and cooking.
          Features that need a server, such as the fridge scan, the chat,
          sign-in and price updates, can be unavailable. We do not promise
          uninterrupted service and we can change or withdraw features.
        </p>

        <h2>11. Limitation of liability</h2>
        <p>
          The app is provided as it is. To the fullest extent permitted by law,
          we exclude all warranties not expressly given here, and we are not
          liable for indirect or consequential loss, lost profits, lost data, or
          loss arising from your reliance on recipe data, diet labels,
          nutritional figures, storage guidance, prices or AI output.
        </p>
        <p>
          Where liability cannot be excluded, it is limited to the amount you
          paid for the subscription in the twelve months before the claim.
        </p>
        <p>
          <strong>
            Nothing in these terms excludes liability for death or personal
            injury caused by our negligence, for fraud, or for anything else
            that cannot lawfully be excluded.
          </strong>{" "}
          If you are a consumer in the EU, your statutory rights are unaffected
          by these terms.
        </p>

        <h2>12. Governing law</h2>
        <p>
          Dutch law applies, and the courts of the Netherlands have
          jurisdiction. If you are a consumer, you may also bring a claim in the
          courts of your own country of residence.
        </p>

        <h2>13. Changes</h2>
        <p>
          We can update these terms. The date at the top changes when we do, and
          continuing to use the app means you accept the updated version.
        </p>

        <h2>14. Contact</h2>
        <p>
          <a href="mailto:support@dirckmulder.com">support@dirckmulder.com</a>{" "}
          for the app,{" "}
          <a href={`mailto:${LEGAL.privacyEmail}`}>{LEGAL.privacyEmail}</a> for
          privacy. See also the{" "}
          <Link href="/privacy/dishy">Dishy privacy policy</Link> and{" "}
          <Link href="/support/dishy">Dishy support</Link>.
        </p>
      </div>
    </article>
  );
}
