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
