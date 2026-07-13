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
