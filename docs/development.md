# Development — how this was built

This project was built collaboratively with an AI coding agent, in small,
releasable steps, each one tested and deployed before the next. It is meant to
be a clean example of disciplined, spec-driven, test-first development on a
zero-dependency static site.

## Working method

- **Brainstorm → spec → plan → execute.** The idea was turned into a written
  design spec and a bite-sized implementation plan before any code was written
  (see `docs/superpowers/`).
- **Subagent-driven TDD.** Each plan task was implemented against a failing test
  first, then reviewed (spec-compliance, then code-quality) before moving on.
- **Verify for real.** Beyond unit tests, every UI change was driven in a real
  headless browser (Playwright) and checked with screenshots — no "looks right"
  by assumption.
- **git-flow + CI from day one.** `master` (releasable) ← `devel` ← short-lived
  `feature/*`. CI ran unit + e2e on every push; deploy to GitHub Pages gated on
  green tests. The site was live from the first milestone.
- **Parallel research subagents** authored and calibrated the per-country
  content (questions, personas, politicians, coordinates) concurrently.

## The rounds

**1 — MVP.** Pure scoring engine (normalize, weighted axes, nearest-persona,
triangle + horseshoe projections, pack validation) built test-first. Two data
packs (Czech, Polish), three SVG result views, a one-question-per-screen quiz
with a bubble strip, and a matched persona. Dark theme. Shipped to Pages.

**2 — Redesign & content.** A light, modern redesign (Bricolage Grotesque /
Hanken Grotesk, rounded UI, round flag buttons) with political **family colours**
(conservative blue, socialist red, liberal amber). Fresh, domain-specific
questions per country; new EU and USA packs; results gained party + politician.

**3 — Politicians & photos.** Three real politicians per party, each with a
Wikimedia photo (resolved + verified via the Wikipedia API) and a short bio. The
quiz now picks the closest party *and* the closest politician within it. Party
avatars plotted on the compass; the compass corners gained the classic
four-family colouring. UK domain added.

**4 — UX depth.** Full party-match ranking with percentages, nearest politicians
across parties, a centrist read; keyboard answering (1–5) and accessibility
(focus rings, `aria-live`); a clickable, de-overlapped party map with a pulsing
"you" marker; shareable **permalinks** (answers encoded in the URL) with a
copy/share button; PWA manifest, favicon, OpenGraph tags; and a Playwright **e2e
smoke test** wired into CI. Party photos were then added to the triangle and
horseshoe too.

**5 — Credibility & polish.** A "how this works" **methodology panel** (which
answers moved each axis). Colour toning refined (triangle region tint, horseshoe
red→yellow→blue, a compass legend). Party/politician coordinates **calibrated**
from the Chapel Hill Expert Survey (2019/2024) and DW-NOMINATE/Voteview, with the
provenance shown in-app. Every domain trimmed to **20 questions**. A branded
OpenGraph card for link previews.

**6 — More domains & launch prep.** Ukraine and France packs (seven domains
total). Security hardening (strict CSP, referrer policy, frame-buster,
delegated image fallback) and an opt-in, anonymous session-stats scaffold with
ready-to-deploy collectors documented. A home compass needle that follows the
cursor. Tagged **v1.0.0**.

## What made it robust

- The engine is pure and small, so it is fully unit-tested; the risky parts (the
  DOM, the browser) are covered by an end-to-end smoke test.
- Content is data, validated by `validatePack` in both tests and at runtime — a
  malformed pack fails the build rather than the user.
- One real bug was caught *by* the new CI (the e2e file being swept into
  `node --test`); the fix and a regression guard followed immediately.

## What's deliberately not here (YAGNI)

No back end, accounts, database, cookies, tracking, or build step. The stats
collector and a Cloudflare DDoS/WAF layer are documented but intentionally left
as opt-in infrastructure choices (`docs/stats-collector.md`, `docs/security.md`).

## Caveat

Questions and coordinates are game-grade — calibrated where real survey data
exists, expert-estimated otherwise. It is a game, not sociology.
