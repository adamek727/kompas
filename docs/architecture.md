# Architecture — how the system works

A dependency-free static web app. The **engine is generic**; every country's
politics lives in a self-describing **data pack** (JSON). Adding a domain is a
data task, not a code change.

```
index.html ──loads──> js/app.js (state machine + DOM)
                          │  reads
                          ▼
                    data/<id>.json  ── validated by ──> js/scoring.js
                          │
        ┌─────────────────┼──────────────────┐
        ▼                 ▼                  ▼
   js/render.js      js/result.js       js/views/*.js
   (home + quiz)     (result page)      (compass/triangle/horseshoe → SVG)
```

## The shared axis-space

Every answer scores three axes, each normalized to `[-1, +1]`:

| Axis | −1 | +1 |
|------|----|----|
| `economic` | state / equality / redistribution | market / individual |
| `social` | progressive / liberal | traditional / authoritarian |
| `system` | establishment / institutions | anti-establishment / populist |

A completed quiz is one 3-vector. **All three result views are projections of
that same vector**, and every party (persona) and politician is a point in the
same space — matching is nearest-neighbour by Euclidean distance. One scoring
pass, three pictures, one match.

## The engine — `js/scoring.js` (pure, unit-tested)

No DOM, no globals. This is the unit under test.

- `normalizeAnswer(a, points)` — Likert `1..5` → `[-1,+1]`.
- `scoreAxes(answers, questions, axisNames, points)` — weighted accumulation,
  normalized by the sum of absolute weights so sign-reversed questions balance.
- `distance` / `matchPersonas` — nearest-neighbour + runner-up.
- `triangleWeights` / `trianglePoint` — inverse-distance barycentric projection.
- `horseshoeAngle` — left-right → arc angle; `system` magnitude pushes radicals
  toward the tips.
- `rankParties` / `rankPoliticians` / `matchPercent` — the full result ranking.
- `axisContributions` — per-question impact per axis (powers the methodology
  panel).
- `isCentrist` — near-zero vector detection.
- `validatePack` — schema/consistency guard, run in tests and at load time.

## Data packs — `data/<id>.json`

Fully self-describing and localized. Shape:

- `meta` — id, name, `lang`, flag, `calibration` (provenance note).
- `ui` — every chrome string (so language follows the domain).
- `scale` — points + labels.
- `axes` — per-axis min/max labels (a pack can re-mean an axis; e.g. the EU
  `system` axis reads "More Europe ↔ Sovereign nations").
- `questions` — 20 statements, each with `weights` over the axes.
- `personas` — a party archetype: `coords`, `party`, and 3 `politicians`, each
  with `name`, Wikimedia `photo`, a 3-sentence `bio`, and its own `coords`.
- `views` — `compass` axis pair, `triangle` poles (label + colour + coords),
  `horseshoe` axis + radical.

**Calibration:** party/politician coordinates are anchored on the Chapel Hill
Expert Survey (CZ/PL/EU/UK/FR, `lrecon`/`galtan`/`antielite`) and DW-NOMINATE /
Voteview (US); Ukraine uses expert estimates. It is still "a game, not science".

## Views — `js/views/*.js` (pure → SVG strings)

Each takes `(scores, pack, size, opts)` and returns an SVG string.

- `compass` — 2-axis grid, family-coloured corners (auth-left red, lib-left
  green, auth-right blue, lib-right amber), party avatars plotted + de-overlapped
  (`parties.js` relaxation), a pulsing "you" marker.
- `triangle` — liberal/conservative/socialist poles with family region tinting;
  parties placed by barycentric projection.
- `horseshoe` — a U-arc with a red→yellow→blue gradient; parties along the arm.
- `parties.js` — shared avatar rendering, de-overlap relaxation, hit targets.

## Result — `js/result.js`

Given scores it computes the matched party, the closest politician *within* that
party, the dominant family (for the accent colour), the full party ranking,
nearest politicians across all parties, and per-axis contributions. Returns the
whole result page as an HTML string: persona card (photo + bio), family-coloured
visuals, axis bars, ranking, and a collapsible "how this works" panel.

## App shell — `js/app.js`

Owns state and the DOM. Three screens (home → quiz → result), keyboard input
(1–5, Back), `aria-live` announcements, per-domain `document.title`, permalink
encode/decode (`js/share.js`) so a result URL restores itself, native Web Share
with clipboard fallback, the cursor-following home needle, an opt-in
anonymous stats hook (off by default), and a delegated image-error fallback.

## Security

Strict CSP (`script-src 'self'`, no inline JS, pinned img/font/connect sources),
referrer policy, a frame-buster, and first-party data only. See
[security.md](security.md).

## Build, test, deploy

- **No build, no runtime dependencies.** ES modules served as static files.
- **Tests:** `node --test` runs the pure-engine + render + result + pack-validation
  suites (49 unit tests); a Playwright **e2e smoke** drives a real browser in CI.
- **CI/CD:** `.github/workflows/ci.yml` (unit + e2e), `pages.yml` (test → deploy
  to GitHub Pages on `master`).
- **Branching:** git-flow (master / devel / feature/*).

## Adding a domain

1. Copy an existing `data/<id>.json`, translate `ui`/`scale`/`axes`, write 20
   `questions`, ≥8 `personas` (coords + 3 politicians each), and the `views`.
2. Add `{ id, flag, name, enabled: true }` to `DOMAINS` in `js/app.js`.
3. `node --test` — the pack test validates every `data/*.json`.
