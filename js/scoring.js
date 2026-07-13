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

export function horseshoeAngle(scores, cfg) {
  const t = scores[cfg.axis] ?? 0;
  const START = 250, END = -70;
  return START + (END - START) * ((t + 1) / 2);
}

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
