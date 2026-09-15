# post-feedback-v1

Pre-registered before the first visitor saw it. Written down so the result
cannot be reinterpreted afterwards to say whatever is convenient.

## Question

Does asking for a **category** instead of a **verdict** get more people to
answer, and more of them to write a sentence?

## Arms

Both cost exactly one tap, so the test isolates *what is asked* rather than how
hard it is to answer.

- **A, `quick-verdict`** (control) — "Did this post work for you?" · Yes / Not really
- **B, `reaction-row`** (challenger) — "Where did you land?" · I am going to use this / Interesting, not for me / I got stuck somewhere

## Hypothesis

Naming a plausible non-negative reason lowers the social cost of admitting a
post did not land, so B gets a higher submit rate and a considerably higher
comment rate. The "I got stuck somewhere" bucket is also directly actionable
per component in a way a thumbs-down is not.

## Assignment

`hash(visitorId + experimentKey) % 100` against cumulative weights, 50/50. The
randomisation unit is the **person**, not the pageview, so a reader sees the
same arm on every post.

## Metrics, in priority order

1. **Comment rate** — share of submissions carrying 15+ characters of free
   text. This is the tiebreaker and it is ranked first on purpose: a 60% tap
   rate with no sentences is worth less than a 15% rate with real ones.
2. **Submission rate** — unique submitters / unique exposed. Exposure fires
   once per visitor per post when the widget is 50% on screen, not on render.
3. Newsletter signups in the same session, post-interaction.

Guardrail: blog bounce rate and scroll depth must not degrade.

## The honest part

**This will probably not reach significance.** Detecting 10% vs 15% at 80%
power needs roughly **690 exposures per arm**. At about 60 blog visitors a
month that is somewhere between four months and a year.

The experiment earns its place on the free-text answers, which are useful at
n=5. The counts are a tiebreaker, not a verdict.

## Stop rule

> Stop at 690 exposures per arm, or at 60 days, whichever comes first. No
> decisions from peeking before then. Compute the Wilson 95% interval per arm
> and on the difference. If it excludes zero, ship the winner. If not, ship the
> arm with the higher comment rate. If those tie, ship A, because it is the
> simpler component.

Concluding is one edit in `src/lib/experiments.ts`: set `status: 'concluded'`
and `winner`. The losing component stays in the repo as a round-two candidate.

## Round two, only after this resolves

`scale-1-5`, `question-first` (no buttons at all, just "What is the one thing
you would change?"), and `who-are-you` (dev / looking to hire / just following),
which doubles as the answer to the mixed-audience problem.
