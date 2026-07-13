# Political Compass Framework Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A static web app that scores ~30 Likert questions into a shared 3-axis space and shows the result as a 2-axis compass, a lib/con/soc triangle, or a horseshoe, plus a matched political persona — fed entirely by per-country JSON data packs (Czech + Polish first).

**Architecture:** Vanilla ES modules, no build step. A pure engine (`scoring.js`) turns answers + a data pack into axis scores, persona matches, and view projections. Three view modules turn scores into SVG strings. `app.js`/`render.js` drive three screens (home → quiz → result) over the pure engine. Each country is one self-describing, localized JSON file in `data/`.

**Tech Stack:** HTML5, CSS, ES modules (`<script type="module">`), inline SVG. Tests: Node built-in test runner (`node --test`). CI: GitHub Actions. No runtime dependencies.

---

## File Structure

| File | Responsibility |
|------|----------------|
| `index.html` | Single page; `<main id="app">` mount point; loads `js/app.js` as module. |
| `css/styles.css` | All styling; view/marker classes styled here. |
| `js/scoring.js` | PURE engine: normalize, score axes, distance, persona match, triangle + horseshoe projections, pack validation. No DOM. |
| `js/views/compass.js` | `compassSVG(scores, pack)` → SVG string. |
| `js/views/triangle.js` | `triangleSVG(scores, pack)` → SVG string. |
| `js/views/horseshoe.js` | `horseshoeSVG(scores, pack)` → SVG string. |
| `js/render.js` | Pure-ish HTML builders for home / quiz / result fragments (return strings). |
| `js/app.js` | State machine + DOM wiring: domain manifest, fetch pack, screen transitions, event listeners. |
| `data/cz.json` | Czech data pack (~30 questions, 8+ personas). |
| `data/pl.json` | Polish data pack. |
| `test/scoring.test.js` | Unit tests for the pure engine. |
| `test/pack.test.js` | Loads `cz.json`/`pl.json`, asserts `validatePack` returns no errors. |
| `package.json` | `{ "type": "module" }` so `.js` is ESM under Node; `test` script. |
| `.github/workflows/ci.yml` | Runs `node --test`. |
| `README.md` | Run/serve/test instructions; how to add a domain. |

Boundaries: `scoring.js` and the three `views/*.js` are pure (input → value), independently testable. `app.js`/`render.js` own all DOM/state. Views never touch quiz state; the engine never touches the DOM.

---

## Task 1: Project scaffold, git, CI

**Files:**
- Create: `package.json`, `.gitignore`, `.github/workflows/ci.yml`, `index.html`, `css/styles.css`, `js/app.js` (stub)

- [ ] **Step 1: Initialize repo and structure**

Run:
```bash
cd /home/adash/Developer/kompas
git init
mkdir -p js/views data test .github/workflows css
```

- [ ] **Step 2: Create `package.json`**

```json
{
  "name": "kompas",
  "version": "0.1.0",
  "type": "module",
  "private": true,
  "scripts": {
    "test": "node --test",
    "serve": "python3 -m http.server 8000"
  }
}
```

- [ ] **Step 3: Create `.gitignore`**

```
node_modules/
.DS_Store
*.log
```

- [ ] **Step 4: Create `.github/workflows/ci.yml`**

```yaml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: node --test
```

- [ ] **Step 5: Create `index.html`**

```html
<!DOCTYPE html>
<html lang="cs">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Kompas</title>
  <link rel="stylesheet" href="css/styles.css">
</head>
<body>
  <main id="app"></main>
  <script type="module" src="js/app.js"></script>
</body>
</html>
```

- [ ] **Step 6: Create `css/styles.css` (minimal base)**

```css
:root { --bg:#12141c; --fg:#e8eaf0; --accent:#5b8cff; --muted:#8a90a6; }
* { box-sizing: border-box; }
body { margin:0; font-family: system-ui, sans-serif; background:var(--bg); color:var(--fg); }
#app { max-width: 640px; margin: 0 auto; padding: 24px; min-height: 100vh; }
button { font: inherit; cursor: pointer; }
```

- [ ] **Step 7: Create `js/app.js` stub**

```js
const app = document.getElementById('app');
app.textContent = 'Kompas – scaffold OK';
```

- [ ] **Step 8: Verify it serves**

Run: `python3 -m http.server 8000` then open `http://localhost:8000` — expect "Kompas – scaffold OK". Stop the server.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "chore: scaffold vanilla static app with CI"
```

---

## Task 2: Engine — answer normalization and axis scoring

**Files:**
- Create: `js/scoring.js`
- Test: `test/scoring.test.js`

- [ ] **Step 1: Write the failing test**

Create `test/scoring.test.js`:
```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalizeAnswer, scoreAxes } from '../js/scoring.js';

test('normalizeAnswer maps 1..5 to -1..1', () => {
  assert.equal(normalizeAnswer(1), -1);
  assert.equal(normalizeAnswer(3), 0);
  assert.equal(normalizeAnswer(5), 1);
});

test('scoreAxes accumulates weighted, normalized by |weight|', () => {
  const questions = [
    { id: 'q1', weights: { economic: 1 } },
    { id: 'q2', weights: { economic: -1, social: 1 } },
  ];
  // q1 strongly agree(+1)*1, q2 strongly agree(+1)*-1 => economic sum 0 / wsum 2 = 0
  const scores = scoreAxes({ q1: 5, q2: 5 }, questions, ['economic', 'social']);
  assert.equal(scores.economic, 0);
  assert.equal(scores.social, 1);
});

test('scoreAxes returns 0 for axis with no weight', () => {
  const scores = scoreAxes({ q1: 5 }, [{ id: 'q1', weights: { economic: 1 } }], ['economic', 'social']);
  assert.equal(scores.social, 0);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test test/scoring.test.js`
Expected: FAIL — cannot find module `../js/scoring.js`.

- [ ] **Step 3: Write minimal implementation**

Create `js/scoring.js`:
```js
export function normalizeAnswer(a, points = 5) {
  const mid = (points + 1) / 2;
  return (a - mid) / (mid - 1);
}

export function scoreAxes(answers, questions, axisNames) {
  const sum = {}, wsum = {};
  for (const name of axisNames) { sum[name] = 0; wsum[name] = 0; }
  for (const q of questions) {
    const a = answers[q.id];
    if (a == null) continue;
    const n = normalizeAnswer(a);
    for (const [axis, w] of Object.entries(q.weights || {})) {
      if (!(axis in sum)) continue;
      sum[axis] += n * w;
      wsum[axis] += Math.abs(w);
    }
  }
  const scores = {};
  for (const name of axisNames) scores[name] = wsum[name] ? sum[name] / wsum[name] : 0;
  return scores;
}

export function axisNamesFromPack(pack) {
  return Object.keys(pack.axes || {});
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test test/scoring.test.js`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add js/scoring.js test/scoring.test.js
git commit -m "feat: axis scoring engine (normalize + weighted accumulate)"
```

---

## Task 3: Engine — distance and persona match

**Files:**
- Modify: `js/scoring.js`
- Test: `test/scoring.test.js` (append)

- [ ] **Step 1: Write the failing test**

Append to `test/scoring.test.js`:
```js
import { distance, matchPersonas } from '../js/scoring.js';

test('distance is Euclidean over named axes', () => {
  const d = distance({ economic: 0, social: 0 }, { economic: 3, social: 4 }, ['economic', 'social']);
  assert.equal(d, 5);
});

test('matchPersonas returns nearest as top and second as runnerUp', () => {
  const personas = [
    { id: 'far', coords: { economic: 1, social: 1 } },
    { id: 'near', coords: { economic: 0.1, social: 0 } },
    { id: 'mid', coords: { economic: 0.5, social: 0.5 } },
  ];
  const m = matchPersonas({ economic: 0, social: 0 }, personas, ['economic', 'social']);
  assert.equal(m.top.id, 'near');
  assert.equal(m.runnerUp.id, 'mid');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test test/scoring.test.js`
Expected: FAIL — `distance`/`matchPersonas` not exported.

- [ ] **Step 3: Write minimal implementation**

Append to `js/scoring.js`:
```js
export function distance(a, b, axisNames) {
  let s = 0;
  for (const n of axisNames) {
    const d = (a[n] ?? 0) - (b[n] ?? 0);
    s += d * d;
  }
  return Math.sqrt(s);
}

export function matchPersonas(scores, personas, axisNames) {
  const ranked = personas
    .map(p => ({ persona: p, dist: distance(scores, p.coords, axisNames) }))
    .sort((x, y) => x.dist - y.dist);
  return { top: ranked[0]?.persona, runnerUp: ranked[1]?.persona, ranked };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test test/scoring.test.js`
Expected: PASS (all tests).

- [ ] **Step 5: Commit**

```bash
git add js/scoring.js test/scoring.test.js
git commit -m "feat: persona matching by nearest distance"
```

---

## Task 4: Engine — triangle and horseshoe projections

**Files:**
- Modify: `js/scoring.js`
- Test: `test/scoring.test.js` (append)

- [ ] **Step 1: Write the failing test**

Append to `test/scoring.test.js`:
```js
import { triangleWeights, trianglePoint, horseshoeAngle } from '../js/scoring.js';

test('triangleWeights sum to 1 and favor the nearest pole', () => {
  const poles = [
    { coords: { economic: 1, social: 0 } },
    { coords: { economic: -1, social: 0 } },
    { coords: { economic: 0, social: 1 } },
  ];
  const w = triangleWeights({ economic: 0.9, social: 0 }, poles, ['economic', 'social']);
  const total = w.reduce((a, b) => a + b, 0);
  assert.ok(Math.abs(total - 1) < 1e-9);
  assert.ok(w[0] > w[1] && w[0] > w[2]); // nearest pole 0 dominates
});

test('trianglePoint is the weighted average of vertices', () => {
  const verts = [{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 0, y: 10 }];
  const p = trianglePoint([0.5, 0.5, 0], verts);
  assert.deepEqual(p, { x: 5, y: 0 });
});

test('horseshoeAngle is monotonic: left tip > top > right tip', () => {
  assert.equal(horseshoeAngle({ economic: -1 }, { axis: 'economic' }), 250);
  assert.equal(horseshoeAngle({ economic: 0 }, { axis: 'economic' }), 90);
  assert.equal(horseshoeAngle({ economic: 1 }, { axis: 'economic' }), -70);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test test/scoring.test.js`
Expected: FAIL — projection functions not exported.

- [ ] **Step 3: Write minimal implementation**

Append to `js/scoring.js`:
```js
export function triangleWeights(scores, poles, axisNames) {
  const eps = 1e-6;
  const invs = poles.map(p => 1 / (distance(scores, p.coords, axisNames) + eps));
  const total = invs.reduce((a, b) => a + b, 0);
  return invs.map(v => v / total);
}

export function trianglePoint(weights, vertices) {
  return {
    x: weights.reduce((s, w, i) => s + w * vertices[i].x, 0),
    y: weights.reduce((s, w, i) => s + w * vertices[i].y, 0),
  };
}

// Horseshoe drawn as an inverted-U (opening down). axis in [-1,1]:
// -1 (far left) -> left tip 250deg, 0 (center) -> top 90deg, +1 (far right) -> right tip -70deg.
export function horseshoeAngle(scores, cfg) {
  const t = scores[cfg.axis] ?? 0;
  const START = 250, END = -70;
  return START + (END - START) * ((t + 1) / 2);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test test/scoring.test.js`
Expected: PASS (all tests).

- [ ] **Step 5: Commit**

```bash
git add js/scoring.js test/scoring.test.js
git commit -m "feat: triangle and horseshoe projections"
```

---

## Task 5: Engine — pack validation

**Files:**
- Modify: `js/scoring.js`
- Test: `test/scoring.test.js` (append)

- [ ] **Step 1: Write the failing test**

Append to `test/scoring.test.js`:
```js
import { validatePack } from '../js/scoring.js';

const goodPack = {
  meta: { id: 't', name: 'T', lang: 'en', flag: '🏳️' },
  axes: { economic: { min: 'L', max: 'R' }, social: { min: 'F', max: 'O' }, system: { min: 'S', max: 'A' } },
  scale: { points: 5, labels: ['a', 'b', 'c', 'd', 'e'] },
  questions: [{ id: 'q1', text: 'x', weights: { economic: 1 } }],
  personas: [{ id: 'p1', name: 'P', blurb: 'b', coords: { economic: 0, social: 0, system: 0 } }],
  views: {
    compass: { x: 'economic', y: 'social' },
    triangle: { poles: [{ label: 'A', coords: {} }, { label: 'B', coords: {} }, { label: 'C', coords: {} }] },
    horseshoe: { axis: 'economic', radical: 'system' },
  },
};

test('validatePack accepts a well-formed pack', () => {
  assert.deepEqual(validatePack(goodPack), []);
});

test('validatePack flags unknown axis in a question weight', () => {
  const bad = structuredClone(goodPack);
  bad.questions[0].weights = { nonsense: 1 };
  assert.ok(validatePack(bad).some(e => e.includes('nonsense')));
});

test('validatePack flags a persona missing an axis coord', () => {
  const bad = structuredClone(goodPack);
  bad.personas[0].coords = { economic: 0 };
  assert.ok(validatePack(bad).some(e => e.includes('social')));
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test test/scoring.test.js`
Expected: FAIL — `validatePack` not exported.

- [ ] **Step 3: Write minimal implementation**

Append to `js/scoring.js`:
```js
export function validatePack(pack) {
  const errors = [];
  const axisNames = Object.keys(pack.axes || {});
  if (!axisNames.length) errors.push('pack has no axes');
  if (!pack.questions?.length) errors.push('pack has no questions');

  for (const q of pack.questions || []) {
    if (!q.id) errors.push('a question is missing id');
    if (!q.text) errors.push(`question ${q.id}: missing text`);
    for (const axis of Object.keys(q.weights || {})) {
      if (!axisNames.includes(axis)) errors.push(`question ${q.id}: unknown axis "${axis}"`);
    }
  }
  for (const p of pack.personas || []) {
    for (const axis of axisNames) {
      if (typeof p.coords?.[axis] !== 'number') errors.push(`persona ${p.id}: missing coord "${axis}"`);
    }
  }
  const v = pack.views || {};
  if (v.compass && (!axisNames.includes(v.compass.x) || !axisNames.includes(v.compass.y)))
    errors.push('views.compass references an unknown axis');
  if (v.horseshoe && (!axisNames.includes(v.horseshoe.axis) || !axisNames.includes(v.horseshoe.radical)))
    errors.push('views.horseshoe references an unknown axis');
  if (v.triangle && (v.triangle.poles || []).length !== 3)
    errors.push('views.triangle must have exactly 3 poles');
  return errors;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test test/scoring.test.js`
Expected: PASS (all tests).

- [ ] **Step 5: Commit**

```bash
git add js/scoring.js test/scoring.test.js
git commit -m "feat: data pack validation"
```

---

## Task 6: Content — research + author Czech pack

**Files:**
- Create: `data/cz.json`
- Test: `test/pack.test.js`

- [ ] **Step 1: Write the failing pack test**

Create `test/pack.test.js`:
```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { validatePack } from '../js/scoring.js';

for (const id of ['cz', 'pl']) {
  test(`pack ${id} is valid, has >=30 questions and >=8 personas`, async () => {
    const pack = JSON.parse(await readFile(new URL(`../data/${id}.json`, import.meta.url)));
    assert.deepEqual(validatePack(pack), []);
    assert.ok(pack.questions.length >= 30, `expected >=30 questions, got ${pack.questions.length}`);
    assert.ok(pack.personas.length >= 8, `expected >=8 personas, got ${pack.personas.length}`);
  });
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test test/pack.test.js`
Expected: FAIL — cannot read `../data/cz.json` (and `pl.json`).

- [ ] **Step 3: Research the domain**

Use WebSearch/WebFetch to gather, for Czechia:
- current main cleavages and hot topics (e.g. EU integration, migration, energy/green policy, taxation/redistribution, rule-of-law/institutions, social liberalism vs traditionalism);
- major parties and figures and their rough stance, to place personas (e.g. ANO, ODS, Piráti, SPD, STAN, KSČM/Stačilo, KDU-ČSL, ČSSD-successors) — map each onto `economic` (state↔market), `social` (progress↔tradition), `system` (establishment↔anti-establishment);
- the reference site `kompas.inspiruj.se` for tone/inspiration (do not copy).

Record a short mapping table in your working notes: for each persona, target `{economic, social, system}` in `[-1,1]`.

- [ ] **Step 4: Author `data/cz.json`**

Follow this exact shape. Fill `questions` to **≥30** and `personas` to **≥8** using the research. Every `weights` key must be one of `economic`/`social`/`system`. Every persona must have all three coords. Keep questions short, first-person, answerable on agree↔disagree. Example (extend, do not ship as-is):
```json
{
  "meta": { "id": "cz", "name": "Česko", "lang": "cs", "flag": "🇨🇿" },
  "ui": {
    "title": "Politický kompas",
    "tagline": "Hra, ne věda.",
    "pickDomain": "Vyber si zemi",
    "comingSoon": "Už brzy",
    "start": "Začít",
    "back": "Zpět",
    "restart": "Znovu",
    "result": "Tvůj výsledek",
    "match": "Nejblíž máš k",
    "alsoClose": "Blízko máš i k",
    "views": { "compass": "Kompas", "triangle": "Trojúhelník", "horseshoe": "Podkova" }
  },
  "scale": {
    "points": 5,
    "labels": ["Rozhodně ne", "Spíš ne", "Nevím", "Spíš ano", "Rozhodně ano"]
  },
  "axes": {
    "economic": { "min": "Stát a rovnost", "max": "Trh a jednotlivec" },
    "social": { "min": "Svoboda a pokrok", "max": "Řád a tradice" },
    "system": { "min": "Systém", "max": "Vzpoura" }
  },
  "questions": [
    { "id": "q1", "text": "Bohatší by měli platit výrazně vyšší daně.", "weights": { "economic": -1 } },
    { "id": "q2", "text": "Stát by měl podnikání regulovat co nejméně.", "weights": { "economic": 1 } },
    { "id": "q3", "text": "Manželství má být jen mezi mužem a ženou.", "weights": { "social": 1 } },
    { "id": "q4", "text": "Přistěhovalectví Česku spíše prospívá.", "weights": { "social": -0.8, "system": -0.2 } },
    { "id": "q5", "text": "Zavedeným politickým stranám se nedá věřit.", "weights": { "system": 1 } }
  ],
  "personas": [
    { "id": "pragmatik", "name": "Pragmatická konzerva", "blurb": "Pořádek, nižší daně, žádné experimenty.", "coords": { "economic": 0.5, "social": 0.5, "system": -0.2 } },
    { "id": "kavarna", "name": "Rovnostář z kavárny", "blurb": "Progresivní, přerozdělující, proevropský.", "coords": { "economic": -0.6, "social": -0.7, "system": -0.1 } },
    { "id": "dezolat", "name": "Dezolát", "blurb": "Proti systému, proti elitám, po svém.", "coords": { "economic": -0.1, "social": 0.3, "system": 0.9 } }
  ],
  "views": {
    "compass": { "x": "economic", "y": "social" },
    "triangle": {
      "poles": [
        { "label": "Liberál", "coords": { "economic": 0.6, "social": -0.6, "system": -0.1 } },
        { "label": "Konzervativec", "coords": { "economic": 0.3, "social": 0.7, "system": -0.1 } },
        { "label": "Socialista", "coords": { "economic": -0.7, "social": 0.0, "system": 0.0 } }
      ]
    },
    "horseshoe": { "axis": "economic", "radical": "system" }
  }
}
```

- [ ] **Step 5: Run the Czech half of the test**

Run: `node --test test/pack.test.js`
Expected: the `cz` test PASSES (the `pl` test still fails — that's Task 7).

- [ ] **Step 6: Commit**

```bash
git add data/cz.json test/pack.test.js
git commit -m "content: Czech data pack (>=30 questions, >=8 personas)"
```

---

## Task 7: Content — research + author Polish pack

**Files:**
- Create: `data/pl.json`

- [ ] **Step 1: Research the domain**

Use WebSearch/WebFetch for Poland's cleavages and parties (e.g. PiS, KO/PO, Konfederacja, Lewica, PSL/Trzecia Droga), the church/tradition vs secular/progressive axis, EU stance, judiciary/rule-of-law, redistribution vs market. Build the same `{economic, social, system}` mapping table for ≥8 personas.

- [ ] **Step 2: Author `data/pl.json`**

Same schema as `cz.json`, all strings in Polish (`meta.lang = "pl"`, `meta.flag = "🇵🇱"`, `meta.name = "Polska"`), ≥30 questions, ≥8 personas, weights only over `economic`/`social`/`system`, every persona with all three coords. Example first-person questions to extend from:
```json
{ "id": "q1", "text": "Bogatsi powinni płacić znacznie wyższe podatki.", "weights": { "economic": -1 } },
{ "id": "q2", "text": "Kościół nie powinien mieć wpływu na politykę.", "weights": { "social": -1 } },
{ "id": "q3", "text": "Nie ufam głównym partiom politycznym.", "weights": { "system": 1 } }
```

- [ ] **Step 3: Run the full pack test**

Run: `node --test test/pack.test.js`
Expected: PASS for both `cz` and `pl`.

- [ ] **Step 4: Commit**

```bash
git add data/pl.json
git commit -m "content: Polish data pack (>=30 questions, >=8 personas)"
```

---

## Task 8: View — compass SVG

**Files:**
- Create: `js/views/compass.js`
- Test: `test/views.test.js`

- [ ] **Step 1: Write the failing test**

Create `test/views.test.js`:
```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { compassSVG } from '../js/views/compass.js';

const pack = {
  axes: { economic: { min: 'L', max: 'R' }, social: { min: 'F', max: 'O' } },
  views: { compass: { x: 'economic', y: 'social' } },
};

test('compassSVG centers the marker for a zero score', () => {
  const svg = compassSVG({ economic: 0, social: 0 }, pack, 320);
  assert.ok(svg.includes('<svg'));
  assert.ok(svg.includes('cx="160.0"'));
  assert.ok(svg.includes('cy="160.0"'));
});

test('compassSVG puts marker at right edge for economic=+1', () => {
  const svg = compassSVG({ economic: 1, social: 0 }, pack, 320);
  assert.ok(svg.includes('cx="320.0"'));
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test test/views.test.js`
Expected: FAIL — module not found.

- [ ] **Step 3: Write minimal implementation**

Create `js/views/compass.js`:
```js
export function compassSVG(scores, pack, size = 320) {
  const cfg = pack.views.compass;
  const x = scores[cfg.x] ?? 0, y = scores[cfg.y] ?? 0;
  const px = ((x + 1) / 2) * size;
  const py = (1 - (y + 1) / 2) * size;
  const ax = pack.axes[cfg.x], ay = pack.axes[cfg.y];
  return `<svg viewBox="0 0 ${size} ${size}" class="viz compass" role="img">
  <rect x="0" y="0" width="${size}" height="${size}" class="grid-bg"/>
  <line x1="${size / 2}" y1="0" x2="${size / 2}" y2="${size}" class="axis"/>
  <line x1="0" y1="${size / 2}" x2="${size}" y2="${size / 2}" class="axis"/>
  <circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="8" class="marker"/>
  <text x="6" y="${size / 2 - 6}" class="axlabel">${ax.min}</text>
  <text x="${size - 6}" y="${size / 2 - 6}" text-anchor="end" class="axlabel">${ax.max}</text>
  <text x="${size / 2 + 6}" y="14" class="axlabel">${ay.max}</text>
  <text x="${size / 2 + 6}" y="${size - 8}" class="axlabel">${ay.min}</text>
</svg>`;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test test/views.test.js`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add js/views/compass.js test/views.test.js
git commit -m "feat: compass SVG view"
```

---

## Task 9: View — triangle SVG

**Files:**
- Create: `js/views/triangle.js`
- Test: `test/views.test.js` (append)

- [ ] **Step 1: Write the failing test**

Append to `test/views.test.js`:
```js
import { triangleSVG } from '../js/views/triangle.js';

const triPack = {
  axes: { economic: {}, social: {} },
  views: { triangle: { poles: [
    { label: 'A', coords: { economic: 1, social: 0 } },
    { label: 'B', coords: { economic: -1, social: 0 } },
    { label: 'C', coords: { economic: 0, social: 1 } },
  ] } },
};

test('triangleSVG renders svg, a polygon, three labels and a marker', () => {
  const svg = triangleSVG({ economic: 0, social: 0 }, triPack, 300);
  assert.ok(svg.includes('<polygon'));
  assert.ok(svg.includes('>A<') && svg.includes('>B<') && svg.includes('>C<'));
  assert.ok(svg.includes('class="marker"'));
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test test/views.test.js`
Expected: FAIL — `triangle.js` not found.

- [ ] **Step 3: Write minimal implementation**

Create `js/views/triangle.js`:
```js
import { triangleWeights, trianglePoint } from '../scoring.js';

export function triangleSVG(scores, pack, size = 300) {
  const poles = pack.views.triangle.poles;
  const axisNames = Object.keys(pack.axes);
  const pad = 40;
  const verts = [
    { x: pad, y: size - pad },          // bottom-left  -> pole 0
    { x: size - pad, y: size - pad },   // bottom-right -> pole 1
    { x: size / 2, y: pad },            // top          -> pole 2
  ];
  const w = triangleWeights(scores, poles, axisNames);
  const p = trianglePoint(w, verts);
  const poly = verts.map(v => `${v.x},${v.y}`).join(' ');
  const labels = verts.map((v, i) =>
    `<text x="${v.x}" y="${v.y + (i === 2 ? -8 : 18)}" text-anchor="middle" class="axlabel">${poles[i].label}</text>`
  ).join('\n  ');
  return `<svg viewBox="0 0 ${size} ${size}" class="viz triangle" role="img">
  <polygon points="${poly}" class="tri"/>
  ${labels}
  <circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="8" class="marker"/>
</svg>`;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test test/views.test.js`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add js/views/triangle.js test/views.test.js
git commit -m "feat: triangle SVG view"
```

---

## Task 10: View — horseshoe SVG

**Files:**
- Create: `js/views/horseshoe.js`
- Test: `test/views.test.js` (append)

- [ ] **Step 1: Write the failing test**

Append to `test/views.test.js`:
```js
import { horseshoeSVG } from '../js/views/horseshoe.js';

const hsPack = {
  axes: { economic: { min: 'L', max: 'R' }, system: {} },
  views: { horseshoe: { axis: 'economic', radical: 'system' } },
};

test('horseshoeSVG renders an arc path and a marker', () => {
  const svg = horseshoeSVG({ economic: 0, system: 0 }, hsPack, 320);
  assert.ok(svg.includes('<path'));
  assert.ok(svg.includes('class="marker"'));
});

test('horseshoeSVG marker for center sits above marker for an extreme', () => {
  const center = horseshoeSVG({ economic: 0, system: 0 }, hsPack, 320);
  const left = horseshoeSVG({ economic: -1, system: 0 }, hsPack, 320);
  const cy = n => Number(n.match(/class="marker"[^>]*cy="([0-9.]+)"/)[1]);
  assert.ok(cy(center) < cy(left)); // smaller y = higher on screen = center at top
});
```

Note: the marker element must render `cx` then `cy` in that order for the regex; keep attribute order `cx`…`cy` in the implementation.

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test test/views.test.js`
Expected: FAIL — `horseshoe.js` not found.

- [ ] **Step 3: Write minimal implementation**

Create `js/views/horseshoe.js`:
```js
import { horseshoeAngle } from '../scoring.js';

const START = 250, END = -70; // must match horseshoeAngle in scoring.js

function polar(cx, cy, r, deg) {
  const rad = (deg * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy - r * Math.sin(rad) };
}

export function horseshoeSVG(scores, pack, size = 320) {
  const cfg = pack.views.horseshoe;
  const cx = size / 2, cy = size / 2 + 30, r = size / 2 - 30;
  const a = polar(cx, cy, r, START);
  const b = polar(cx, cy, r, END);
  const arc = `M ${a.x.toFixed(1)} ${a.y.toFixed(1)} A ${r} ${r} 0 1 1 ${b.x.toFixed(1)} ${b.y.toFixed(1)}`;
  const angle = horseshoeAngle(scores, cfg);
  const m = polar(cx, cy, r, angle);
  const ax = pack.axes[cfg.axis];
  return `<svg viewBox="0 0 ${size} ${size}" class="viz horseshoe" role="img">
  <path d="${arc}" class="arc" fill="none"/>
  <text x="${a.x.toFixed(1)}" y="${(a.y + 18).toFixed(1)}" text-anchor="middle" class="axlabel">${ax.min}</text>
  <text x="${b.x.toFixed(1)}" y="${(b.y + 18).toFixed(1)}" text-anchor="middle" class="axlabel">${ax.max}</text>
  <circle cx="${m.x.toFixed(1)}" cy="${m.y.toFixed(1)}" r="8" class="marker"/>
</svg>`;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test test/views.test.js`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add js/views/horseshoe.js test/views.test.js
git commit -m "feat: horseshoe SVG view"
```

---

## Task 11: Render — HTML fragment builders

**Files:**
- Create: `js/render.js`
- Test: `test/render.test.js`

`render.js` builds HTML strings only (pure). `app.js` (Task 12+) injects them and wires events. This keeps fragment shape testable without a DOM.

- [ ] **Step 1: Write the failing test**

Create `test/render.test.js`:
```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { homeHTML, quizHTML, bubblesHTML } from '../js/render.js';

const domains = [
  { id: 'cz', flag: '🇨🇿', name: 'Česko', enabled: true },
  { id: 'eu', flag: '🇪🇺', name: 'EU', enabled: false },
];

test('homeHTML lists a button per domain and disables the disabled one', () => {
  const html = homeHTML(domains, { title: 'T', tagline: 'g', pickDomain: 'pick', comingSoon: 'soon' });
  assert.ok(html.includes('data-domain="cz"'));
  assert.ok(html.includes('data-domain="eu"'));
  assert.ok(html.includes('disabled'));
  assert.ok(html.includes('soon'));
});

test('bubblesHTML marks current and answered', () => {
  const html = bubblesHTML(3, 1, { q0: 5 });
  assert.ok(html.includes('data-idx="0"') && html.includes('answered'));
  assert.ok(html.includes('data-idx="1"') && html.includes('current'));
});

test('quizHTML renders question text and one button per scale label', () => {
  const pack = {
    scale: { labels: ['no', 'meh', 'yes'] },
    questions: [{ id: 'q0', text: 'Hello?' }],
    ui: { back: 'Back' },
  };
  const html = quizHTML(pack, 0, {});
  assert.ok(html.includes('Hello?'));
  assert.ok((html.match(/class="answer"/g) || []).length === 3);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test test/render.test.js`
Expected: FAIL — module not found.

- [ ] **Step 3: Write minimal implementation**

Create `js/render.js`:
```js
export function homeHTML(domains, ui) {
  const flags = domains.map(d =>
    `<button class="flag" data-domain="${d.id}" ${d.enabled ? '' : 'disabled'} title="${d.enabled ? d.name : ui.comingSoon}">
      <span class="glyph">${d.flag}</span>
      <span class="name">${d.name}</span>
      ${d.enabled ? '' : `<span class="soon">${ui.comingSoon}</span>`}
    </button>`
  ).join('\n');
  return `<section class="home">
    <h1>${ui.title}</h1>
    <p class="tagline">${ui.tagline}</p>
    <p class="pick">${ui.pickDomain}</p>
    <div class="flags">${flags}</div>
  </section>`;
}

export function bubblesHTML(count, current, answers, questions) {
  let out = '';
  for (let i = 0; i < count; i++) {
    const answered = questions ? answers[questions[i].id] != null : answers[`q${i}`] != null;
    const cls = ['bubble', i === current ? 'current' : '', answered ? 'answered' : ''].filter(Boolean).join(' ');
    out += `<button class="${cls}" data-idx="${i}">${i + 1}</button>`;
  }
  return `<div class="bubbles">${out}</div>`;
}

export function quizHTML(pack, index, answers) {
  const q = pack.questions[index];
  const chosen = answers[q.id];
  const answers_html = pack.scale.labels.map((label, i) => {
    const value = i + 1;
    const sel = chosen === value ? ' selected' : '';
    return `<button class="answer${sel}" data-value="${value}">${label}</button>`;
  }).join('\n');
  return `<section class="quiz">
    ${bubblesHTML(pack.questions.length, index, answers, pack.questions)}
    <p class="qcount">${index + 1} / ${pack.questions.length}</p>
    <h2 class="qtext">${q.text}</h2>
    <div class="answers">${answers_html}</div>
    <div class="nav">
      <button class="back" ${index === 0 ? 'disabled' : ''}>${pack.ui.back}</button>
    </div>
  </section>`;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test test/render.test.js`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add js/render.js test/render.test.js
git commit -m "feat: HTML fragment builders for home and quiz"
```

---

## Task 12: App — home screen, domain load, state machine

**Files:**
- Create/replace: `js/app.js`
- Modify: `css/styles.css` (home + flags styling)

Browser-verified (DOM/fetch, no unit test).

- [ ] **Step 1: Write `js/app.js`**

Replace the stub with:
```js
import { scoreAxes, matchPersonas, axisNamesFromPack, validatePack } from './scoring.js';
import { homeHTML, quizHTML } from './render.js';
import { resultHTML } from './result.js';

const DOMAINS = [
  { id: 'cz', flag: '🇨🇿', name: 'Česko', enabled: true },
  { id: 'pl', flag: '🇵🇱', name: 'Polska', enabled: true },
  { id: 'eu', flag: '🇪🇺', name: 'EU', enabled: false },
  { id: 'us', flag: '🇺🇸', name: 'USA', enabled: false },
];

const HOME_UI = { title: 'Politický kompas', tagline: 'Hra, ne věda.', pickDomain: 'Vyber si zemi', comingSoon: 'Už brzy' };

const app = document.getElementById('app');
const state = { pack: null, answers: {}, index: 0, view: 'compass' };

function renderHome() {
  app.innerHTML = homeHTML(DOMAINS, HOME_UI);
  app.querySelectorAll('.flag:not([disabled])').forEach(btn =>
    btn.addEventListener('click', () => loadDomain(btn.dataset.domain))
  );
}

async function loadDomain(id) {
  const res = await fetch(`data/${id}.json`);
  const pack = await res.json();
  const errors = validatePack(pack);
  if (errors.length) { app.innerHTML = `<pre class="error">${errors.join('\n')}</pre>`; return; }
  state.pack = pack;
  state.answers = {};
  state.index = 0;
  state.view = 'compass';
  renderQuiz();
}

function renderQuiz() { /* Task 13 */ }
function renderResult() { /* Task 14 */ }

renderHome();

export { state, renderHome, renderQuiz, renderResult };
```

Note: `renderQuiz`/`renderResult` are filled in Tasks 13/14; `result.js` is created in Task 14. To keep the app runnable now, temporarily stub the import: comment out the `resultHTML` import and the `renderResult` body until Task 14.

- [ ] **Step 2: Add home styles to `css/styles.css`**

```css
.home h1 { margin: 8px 0; }
.tagline { color: var(--muted); margin-top: 0; }
.pick { margin-top: 32px; font-weight: 600; }
.flags { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
.flag { display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 16px;
  background: #1b1e2b; border: 1px solid #2a2f45; border-radius: 12px; color: var(--fg); }
.flag:not([disabled]):hover { border-color: var(--accent); }
.flag[disabled] { opacity: 0.4; cursor: not-allowed; }
.flag .glyph { font-size: 40px; }
.flag .soon { font-size: 11px; color: var(--muted); }
.error { color: #ff6b6b; white-space: pre-wrap; }
```

- [ ] **Step 3: Verify in browser**

Run: `python3 -m http.server 8000`, open `http://localhost:8000`. Expect: title, tagline, 4 flags; CZ+PL clickable, EU+USA greyed with "Už brzy". Click CZ → no crash (blank quiz section is fine until Task 13). Check devtools console for errors. Stop server.

- [ ] **Step 4: Commit**

```bash
git add js/app.js css/styles.css
git commit -m "feat: home screen with domain selection and pack loading"
```

---

## Task 13: App — quiz screen (auto-advance, back, bubbles)

**Files:**
- Modify: `js/app.js` (fill `renderQuiz`)
- Modify: `css/styles.css` (quiz styling)

- [ ] **Step 1: Implement `renderQuiz` in `js/app.js`**

Replace the `function renderQuiz() { /* Task 13 */ }` line with:
```js
function renderQuiz() {
  const pack = state.pack;
  app.innerHTML = quizHTML(pack, state.index, state.answers);

  app.querySelectorAll('.answer').forEach(btn =>
    btn.addEventListener('click', () => answer(Number(btn.dataset.value)))
  );
  const back = app.querySelector('.back');
  if (back) back.addEventListener('click', () => { if (state.index > 0) { state.index--; renderQuiz(); } });
  app.querySelectorAll('.bubble').forEach(b =>
    b.addEventListener('click', () => { state.index = Number(b.dataset.idx); renderQuiz(); })
  );
}

function answer(value) {
  const pack = state.pack;
  state.answers[pack.questions[state.index].id] = value;
  if (state.index < pack.questions.length - 1) { state.index++; renderQuiz(); }
  else renderResult();
}
```

- [ ] **Step 2: Add quiz styles to `css/styles.css`**

```css
.bubbles { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 20px; }
.bubble { width: 28px; height: 28px; border-radius: 50%; border: 1px solid #2a2f45;
  background: #1b1e2b; color: var(--muted); font-size: 12px; }
.bubble.answered { color: var(--fg); border-color: var(--accent); }
.bubble.current { background: var(--accent); color: #fff; border-color: var(--accent); }
.qcount { color: var(--muted); }
.qtext { font-size: 22px; line-height: 1.3; min-height: 3em; }
.answers { display: flex; flex-direction: column; gap: 8px; margin: 20px 0; }
.answer { padding: 14px; border-radius: 10px; border: 1px solid #2a2f45; background: #1b1e2b; color: var(--fg); text-align: left; }
.answer:hover { border-color: var(--accent); }
.answer.selected { background: var(--accent); color: #fff; border-color: var(--accent); }
.nav .back { padding: 10px 18px; border-radius: 10px; border: 1px solid #2a2f45; background: transparent; color: var(--fg); }
.nav .back[disabled] { opacity: 0.3; }
```

- [ ] **Step 3: Verify in browser**

Serve, open, pick CZ. Expect: bubble strip; question text; 5 answer buttons. Clicking an answer auto-advances. Back returns with previous answer preselected. Clicking a bubble jumps to that question. Answering the last question does not crash (result comes in Task 14; a blank/JS error for `renderResult` is acceptable until then). Stop server.

- [ ] **Step 4: Commit**

```bash
git add js/app.js css/styles.css
git commit -m "feat: quiz screen with auto-advance, back, and bubble navigation"
```

---

## Task 14: App — result screen with view switcher

**Files:**
- Create: `js/result.js`
- Modify: `js/app.js` (fill `renderResult`, enable the `resultHTML` import)
- Modify: `css/styles.css` (result styling)
- Test: `test/result.test.js`

- [ ] **Step 1: Write the failing test for `resultHTML`**

Create `test/result.test.js`:
```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { resultHTML } from '../js/result.js';

const pack = {
  axes: { economic: { min: 'L', max: 'R' }, social: { min: 'F', max: 'O' }, system: { min: 'S', max: 'A' } },
  ui: { result: 'Result', match: 'Closest', alsoClose: 'Also', restart: 'Again',
        views: { compass: 'C', triangle: 'T', horseshoe: 'H' } },
  personas: [
    { id: 'a', name: 'Alpha', blurb: 'ba', coords: { economic: 0, social: 0, system: 0 } },
    { id: 'b', name: 'Beta', blurb: 'bb', coords: { economic: 1, social: 1, system: 1 } },
  ],
  views: {
    compass: { x: 'economic', y: 'social' },
    triangle: { poles: [
      { label: 'A', coords: { economic: 1, social: 0, system: 0 } },
      { label: 'B', coords: { economic: -1, social: 0, system: 0 } },
      { label: 'C', coords: { economic: 0, social: 1, system: 0 } } ] },
    horseshoe: { axis: 'economic', radical: 'system' },
  },
};

test('resultHTML shows matched persona and three view buttons', () => {
  const html = resultHTML({ economic: 0, social: 0, system: 0 }, pack, 'compass');
  assert.ok(html.includes('Alpha'));           // nearest persona
  assert.ok(html.includes('data-view="compass"'));
  assert.ok(html.includes('data-view="triangle"'));
  assert.ok(html.includes('data-view="horseshoe"'));
  assert.ok(html.includes('<svg'));             // active view rendered
});

test('resultHTML renders the requested active view', () => {
  const html = resultHTML({ economic: 0, social: 0, system: 0 }, pack, 'horseshoe');
  assert.ok(html.includes('class="viz horseshoe'));
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test test/result.test.js`
Expected: FAIL — `result.js` not found.

- [ ] **Step 3: Write `js/result.js`**

```js
import { matchPersonas, axisNamesFromPack } from './scoring.js';
import { compassSVG } from './views/compass.js';
import { triangleSVG } from './views/triangle.js';
import { horseshoeSVG } from './views/horseshoe.js';

const VIEWS = { compass: compassSVG, triangle: triangleSVG, horseshoe: horseshoeSVG };

function axisBars(scores, pack) {
  return Object.entries(pack.axes).map(([name, meta]) => {
    const pct = ((scores[name] + 1) / 2) * 100;
    return `<div class="bar">
      <span class="bmin">${meta.min}</span>
      <div class="track"><div class="fill" style="left:${pct.toFixed(0)}%"></div></div>
      <span class="bmax">${meta.max}</span>
    </div>`;
  }).join('\n');
}

export function resultHTML(scores, pack, view) {
  const axisNames = axisNamesFromPack(pack);
  const { top, runnerUp } = matchPersonas(scores, pack.personas, axisNames);
  const svg = (VIEWS[view] || compassSVG)(scores, pack);
  const tabs = Object.keys(VIEWS).map(v =>
    `<button class="tab${v === view ? ' active' : ''}" data-view="${v}">${pack.ui.views[v]}</button>`
  ).join('');
  const also = runnerUp ? `<p class="also">${pack.ui.alsoClose}: <strong>${runnerUp.name}</strong></p>` : '';
  return `<section class="result">
    <h2>${pack.ui.result}</h2>
    <div class="persona">
      <p class="matchlabel">${pack.ui.match}</p>
      <h3>${top.name}</h3>
      <p class="blurb">${top.blurb}</p>
      ${also}
    </div>
    <div class="tabs">${tabs}</div>
    <div class="vizwrap">${svg}</div>
    <div class="bars">${axisBars(scores, pack)}</div>
    <button class="restart">${pack.ui.restart}</button>
  </section>`;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test test/result.test.js`
Expected: PASS.

- [ ] **Step 5: Wire `renderResult` in `js/app.js`**

Enable the import (uncomment `import { resultHTML } from './result.js';`) and replace the `renderResult` stub:
```js
function renderResult() {
  const pack = state.pack;
  const scores = scoreAxes(state.answers, pack.questions, axisNamesFromPack(pack));
  app.innerHTML = resultHTML(scores, pack, state.view);
  app.querySelectorAll('.tab').forEach(t =>
    t.addEventListener('click', () => { state.view = t.dataset.view; renderResult(); })
  );
  app.querySelector('.restart').addEventListener('click', renderHome);
}
```

- [ ] **Step 6: Add result styles to `css/styles.css`**

```css
.result h2 { margin-bottom: 4px; }
.persona { background: #1b1e2b; border: 1px solid #2a2f45; border-radius: 12px; padding: 16px; margin: 12px 0; }
.matchlabel { color: var(--muted); margin: 0 0 4px; font-size: 13px; }
.persona h3 { margin: 0 0 6px; color: var(--accent); }
.blurb { margin: 0; }
.also { color: var(--muted); font-size: 14px; margin-top: 10px; }
.tabs { display: flex; gap: 6px; margin: 12px 0; }
.tab { flex: 1; padding: 10px; border-radius: 10px; border: 1px solid #2a2f45; background: #1b1e2b; color: var(--fg); }
.tab.active { background: var(--accent); color: #fff; border-color: var(--accent); }
.vizwrap { display: flex; justify-content: center; }
.viz { width: 100%; max-width: 340px; }
.grid-bg { fill: #1b1e2b; }
.axis { stroke: #2a2f45; stroke-width: 1; }
.tri, .arc { fill: none; stroke: #2a2f45; stroke-width: 2; }
.tri { fill: #1b1e2b; }
.marker { fill: var(--accent); stroke: #fff; stroke-width: 2; }
.axlabel { fill: var(--muted); font-size: 11px; }
.bars { margin: 16px 0; display: flex; flex-direction: column; gap: 12px; }
.bar { display: grid; grid-template-columns: 1fr 3fr 1fr; align-items: center; gap: 8px; font-size: 12px; color: var(--muted); }
.track { position: relative; height: 6px; background: #2a2f45; border-radius: 3px; }
.fill { position: absolute; top: -4px; width: 14px; height: 14px; border-radius: 50%; background: var(--accent); transform: translateX(-50%); }
.bmax { text-align: right; }
.restart { width: 100%; padding: 14px; border-radius: 10px; border: 1px solid #2a2f45; background: #1b1e2b; color: var(--fg); }
```

- [ ] **Step 7: Verify in browser (full flow)**

Serve, open. For **CZ**: complete all questions → result shows a persona, "also close", three tabs. Click each tab → compass, triangle, horseshoe SVGs render and the marker moves sensibly. Axis bars show. Restart → home. Repeat for **PL**. Check console for errors. Stop server.

- [ ] **Step 8: Commit**

```bash
git add js/result.js test/result.test.js js/app.js css/styles.css
git commit -m "feat: result screen with persona match and switchable views"
```

---

## Task 15: README, final test + verification pass

**Files:**
- Create: `README.md`

- [ ] **Step 1: Write `README.md`**

```markdown
# Kompas — a data-driven political compass

A static web app: ~30 Likert questions score you on three axes
(economic / social / system) and show the result as a 2-axis compass,
a liberal–conservative–socialist triangle, or a horseshoe, plus the
closest political persona. Each country is one JSON file in `data/`.

**A game, not sociology.**

## Run

    python3 -m http.server 8000
    # open http://localhost:8000

No build step, no dependencies.

## Test

    node --test

## Add a domain

1. Copy `data/cz.json` to `data/<id>.json`, translate `ui`/`scale`/`axes`,
   write >=30 questions (weights over the declared axes) and >=8 personas
   (coords for every axis), and set the three `views`.
2. Add `{ id, flag, name, enabled: true }` to `DOMAINS` in `js/app.js`.
3. `node --test` (the pack test validates any `data/*.json` referenced there).
```

- [ ] **Step 2: Run the whole test suite**

Run: `node --test`
Expected: PASS across `test/scoring.test.js`, `test/pack.test.js`, `test/views.test.js`, `test/render.test.js`, `test/result.test.js`.

- [ ] **Step 3: Final manual verification checklist**

Serve and confirm:
- Home: 4 flags, CZ/PL enabled, EU/USA greyed.
- CZ and PL each: full quiz, auto-advance, back, bubble jump, all three result views, persona + runner-up, restart.
- No console errors.

- [ ] **Step 4: Commit**

```bash
git add README.md
git commit -m "docs: README with run/test/add-domain instructions"
```

---

## Self-Review

**Spec coverage:**
- Generic framework fed by JSON packs → Tasks 2–5 (engine), 6–7 (packs), schema in every task. ✓
- Shared axis-space, 3 views as projections → Tasks 4, 8–10. ✓
- 2-axis compass / triangle / horseshoe switchable → Tasks 8–10 + switcher Task 14. ✓
- Nearest persona (+runner-up) → Task 3, surfaced Task 14. ✓
- CZ + PL content, research-grounded, ≥30 Q / ≥8 personas → Tasks 6–7 with a test gate. ✓
- Home (4 flags, EU/US greyed) / quiz (one-per-screen, 5-point, auto-advance, back, clickable bubbles, preloaded) / result — 3 screens → Tasks 12–14. ✓
- Vanilla ES modules, no build, SVG, `node --test`, CI → Task 1 + throughout. ✓
- "Game not science" framing → `ui.tagline`, README. ✓

**Placeholder scan:** Content tasks (6, 7) intentionally require authoring ≥30 questions; the gate is `test/pack.test.js` (validity + counts), not prose. All code steps contain complete code. The only deliberate stubs are the Task 12 `renderQuiz`/`renderResult` placeholders, explicitly filled in Tasks 13/14 with a noted temporary comment-out to keep the app runnable between tasks.

**Type consistency:** `scoreAxes`, `matchPersonas`, `axisNamesFromPack`, `validatePack`, `triangleWeights`, `trianglePoint`, `horseshoeAngle`, `compassSVG`, `triangleSVG`, `horseshoeSVG`, `homeHTML`, `quizHTML`, `bubblesHTML`, `resultHTML` — names and signatures are used consistently across tasks. `horseshoeAngle` constants (`START=250`, `END=-70`) are duplicated in `horseshoe.js` with a comment to keep them in sync; acceptable for one shared constant pair.
