export function encodeAnswers(pack, answers) {
  return pack.questions.map(q => {
    const v = answers[q.id];
    return v >= 1 && v <= 9 ? String(v) : '0';
  }).join('');
}

export function decodeAnswers(pack, digits) {
  const points = pack.scale?.points || 5;
  const answers = {};
  pack.questions.forEach((q, i) => {
    const d = Number(digits[i]);
    if (Number.isInteger(d) && d >= 1 && d <= points) answers[q.id] = d;
  });
  return answers;
}

export function parseHash(hash) {
  const m = (hash || '').replace(/^#/, '').match(/^([a-z]{2})-([0-9]+)$/i);
  return m ? { id: m[1].toLowerCase(), digits: m[2] } : null;
}

export function shareHash(id, digits) {
  return `#${id}-${digits}`;
}
