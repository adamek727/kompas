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
  const answersHtml = pack.scale.labels.map((label, i) => {
    const value = i + 1;
    const sel = chosen === value ? ' selected' : '';
    return `<button class="answer${sel}" data-value="${value}">${label}</button>`;
  }).join('\n');
  return `<section class="quiz">
    ${bubblesHTML(pack.questions.length, index, answers, pack.questions)}
    <p class="qcount">${index + 1} / ${pack.questions.length}</p>
    <h2 class="qtext">${q.text}</h2>
    <div class="answers">${answersHtml}</div>
    <div class="nav">
      <button class="back" ${index === 0 ? 'disabled' : ''}>${pack.ui.back}</button>
    </div>
  </section>`;
}
