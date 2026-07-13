# Political Compass Framework — Design Spec

Date: 2026-07-13
Status: Approved for planning

## 1. Goal

A web app that categorizes a user politically from ~30 simple Likert
questions. The engine is a **generic framework**: all political meaning lives
in per-country **data packs** (JSON). Adding a new domain (EU, USA, …) means
dropping in a new JSON file plus a flag — no engine code changes.

First shipped content: Czech (`cz`) and Polish (`pl`). EU and USA flags are
shown but disabled ("coming soon").

Improvement over the reference site (kompas.inspiruj.se): the result page is
**switchable between three visualizations** of the same result — a classic
2-axis compass, a liberal/conservative/socialist triangle, and a "podkova"
(horseshoe) spectrum — plus a matched political persona.

Framing: **a game, not sociology.** The UI says so.

## 2. Core model — shared axis-space

Every answer contributes to three fundamental axes, each normalized to
`[-1, +1]`:

| Axis       | −1 pole                      | +1 pole                         |
|------------|------------------------------|---------------------------------|
| `economic` | state / equality / redistribution | market / individual / property |
| `social`   | freedom / progress / openness | order / tradition / authority   |
| `system`   | pro-establishment / institutions | anti-establishment / populist   |

A completed quiz yields one 3-vector `{economic, social, system}`. **All three
result views are projections of this same vector.** Personas are fixed points
in the same space; the user's match is the nearest persona. One scoring pass,
three pictures, one persona lookup.

Axis count/names are not hardcoded in views' math beyond what each view's
config references — the data pack declares the axes and each view names which
axes it reads. Three axes is the starting set; a future pack could add a
fourth, and only views that reference it would change.

## 3. Scoring (pure function)

`scoring.js` exports pure functions. No DOM, no globals. This is the unit under
test.

1. **Normalize answer.** 5-point answer `a ∈ {1..5}` → `(a - 3) / 2` → `[-1,+1]`.
   `1` = strongly disagree, `3` = neutral, `5` = strongly agree.
2. **Accumulate per axis.** For each answered question and each axis in its
   `weights`: `sum[axis] += norm(a) * weight`, `wsum[axis] += |weight|`.
3. **Axis score** = `sum[axis] / wsum[axis]` (guard `wsum==0` → 0). Result in
   `[-1,+1]`.
4. **Persona match** = persona minimizing Euclidean distance to the score
   vector across shared axes. Return top match + runner-up (for "you're also
   close to…").

Unanswered questions are simply skipped (they contribute nothing). The quiz
requires all questions answered before results, so in practice all count.

## 4. The three views (projections)

All rendered as inline **SVG** (scalable, dependency-free, styleable via CSS).

- **`compass`** — plots `economic` (x) × `social` (y) on a labeled 2D grid, four
  quadrants. Config: `{ x: "economic", y: "social" }`.
- **`triangle`** — three poles (liberal / conservative / socialist) declared in
  the pack as coordinates in axis-space. The user's position is placed by
  barycentric-style weighting: weight of each pole ∝ inverse distance to that
  pole (normalized to sum 1), then mapped to the 2D triangle. Shows lean among
  the three. Config: `{ poles: [ {label, coords}, {label, coords}, {label, coords} ] }`.
- **`horseshoe`** ("podkova") — a U-shaped arc. Left–right position (default
  `economic`) maps to arc angle: far-left → left tip, center → top, far-right →
  right tip, so the two extremes visually bend toward each other. A `radical`
  axis (default `system`) magnitude pushes the marker further down the arm
  toward the tip (radicalization). Config: `{ axis: "economic", radical: "system" }`.

Each view is an isolated module: input = `{scores, pack, viewConfig}`, output =
an SVG element. Views do not know about each other or about quiz state.

## 5. Data pack schema (`data/<id>.json`)

```jsonc
{
  "meta":  { "id": "cz", "name": "Česko", "lang": "cs", "flag": "🇨🇿" },
  "ui":    { "start": "Začít", "next": "Další", "back": "Zpět",
             "result": "Výsledek", "restart": "Znovu", "disclaimer": "Hra, ne věda.",
             "pickDomain": "Vyber doménu", "match": "Nejblíž máš k",
             "views": { "compass": "Kompas", "triangle": "Trojúhelník", "horseshoe": "Podkova" } },
  "scale": { "points": 5,
             "labels": ["Rozhodně ne","Spíš ne","Nevím","Spíš ano","Rozhodně ano"] },
  "axes":  { "economic": { "min": "Stát", "max": "Trh" },
             "social":   { "min": "Svoboda", "max": "Řád" },
             "system":   { "min": "Systém", "max": "Vzpoura" } },
  "questions": [
    { "id": "q1", "text": "…", "weights": { "economic": 1.0, "social": -0.5 } }
    // ~30 total
  ],
  "personas": [
    { "id": "…", "name": "…", "blurb": "…",
      "coords": { "economic": 0.6, "social": 0.7, "system": -0.2 } }
    // 8+ total
  ],
  "views": {
    "compass":  { "x": "economic", "y": "social" },
    "triangle": { "poles": [ { "label": "Liberál",       "coords": { "economic": 0.6,  "social": -0.6, "system": 0 } },
                             { "label": "Konzervativec", "coords": { "economic": 0.3,  "social": 0.7,  "system": 0 } },
                             { "label": "Socialista",    "coords": { "economic": -0.7, "social": 0.1,  "system": 0 } } ] },
    "horseshoe": { "axis": "economic", "radical": "system" }
  }
}
```

The pack is fully self-describing and localized: all chrome text comes from
`ui`, so the language follows the chosen domain. `pl.json` mirrors the shape in
Polish.

## 6. App structure (vanilla ES modules, no build step)

```
kompas/
  index.html
  css/styles.css
  js/
    app.js            # state machine: home → quiz → result; loads pack
    scoring.js        # PURE: answers + pack → axis scores + persona match
    render.js         # home screen, quiz question UI, bubble strip, result shell
    views/
      compass.js      # SVG 2-axis
      triangle.js     # SVG barycentric
      horseshoe.js    # SVG arc
  data/
    cz.json
    pl.json
  test/
    scoring.test.js   # node --test on the pure engine
  README.md
```

Served as static files (`python -m http.server`, or any static host). No
bundler, no dependencies. ES modules via `<script type="module">`.

## 7. Screens & UX (exactly three)

**Home.** Title + small compass mark, "pick your domain" text, flag buttons:
🇨🇿 🇵🇱 active; 🇪🇺 🇺🇸 greyed with "coming soon". Short "game, not science"
disclaimer. Clicking an active flag fetches that pack (whole quiz preloaded
into memory) and enters the quiz.

**Quiz.** One question per screen for fast, simple rendering; because the whole
pack is already in memory there is **no network delay** switching questions.
Each screen: question text + 5 answer buttons (strongly disagree → strongly
agree). **Auto-advance** on selection. A **Back** button returns to the
previous question with the prior answer preselected. A **bubble strip** of
numbered dots shows answered / current / remaining and is **clickable to jump**
to any question. Answering the last question advances to the result.

**Result.** The matched persona (name + blurb + "you're also close to…"
runner-up), axis score bars, and a **view switcher** (Kompas / Trojúhelník /
Podkova) that swaps the SVG visualization of the same scores. A restart button
returns home. (Share/download is out of scope for v1.)

State is held in `app.js` (current pack, answers array, current index, current
view). No persistence/back-end in v1; refresh resets. No cookies/tracking.

## 8. Testing & verification

- **Engine:** `test/scoring.test.js` run with `node --test`. Cases: answer
  normalization; per-axis accumulation and weighting; all-neutral → zero
  vector; a crafted answer set → expected nearest persona; distance/tie
  behavior; projection sanity (e.g. barycentric weights sum to 1, horseshoe
  angle monotonic in axis). This is the primary feedback loop.
- **Views & flow:** verified visually in the browser (home → quiz → all three
  result views for both CZ and PL). Optional lightweight DOM smoke check later.
- **CI:** minimal GitHub Actions running `node --test` (format/lint optional
  for a vanilla project).

## 9. Explicit non-goals (v1, YAGNI)

- No accounts, back-end, database, or answer persistence.
- No share-image/download.
- No demographic survey.
- No analytics/cookies.
- No i18n framework — localization is per-pack `ui` strings only.
- Content is plausible-draft, **not** vetted political science; accuracy is a
  later refinement pass by the user.

## 10. Content note & research

Content is **research-grounded**, not invented. Before drafting each domain's
pack, a research pass (WebSearch/WebFetch) gathers:

- the country's main political cleavages and current hot topics;
- major parties/figures and their positions, mapped onto `economic / social /
  system` — these anchor the persona coordinates;
- existing compass tests (including the reference `kompas.inspiruj.se`) for
  question inspiration and to avoid duplication.

From that, ~30 questions and 8+ personas per domain are drafted so each
question loads a known axis and each persona sits at a defensible point.

The result is still **game content, flagged as such in-app**, and expected to
be reviewed/tuned by the user after the framework works. Research improves
plausibility; it does not make this sociology.
