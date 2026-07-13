export function homeHTML(domains, ui) {
  const flags = domains.map(d =>
    `<button class="flag ${d.enabled ? '' : 'is-disabled'}" data-domain="${d.id}" ${d.enabled ? '' : 'disabled'} title="${d.enabled ? d.name : ui.comingSoon}">
      <span class="disc"><span class="glyph">${d.flag}</span></span>
      <span class="name">${d.name}</span>
      ${d.enabled ? '' : `<span class="soon">${ui.comingSoon}</span>`}
    </button>`
  ).join('\n');
  return `<section class="home">
    <svg class="home-mark" viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <circle cx="32" cy="32" r="27" stroke="currentColor" stroke-width="3"/>
      <g class="needle">
        <path d="M32 13 L39 33 L32 29 L25 33 Z" fill="currentColor"/>
        <path d="M32 51 L25 31 L32 35 L39 31 Z" fill="#c3cfe6"/>
      </g>
    </svg>
    <h1>${ui.title}</h1>
    <p class="tagline">${ui.tagline}</p>
    <p class="pick">${ui.pickDomain}</p>
    <div class="flags">${flags}</div>
  </section>`;
}

export function bubblesHTML(count, current, answers, questions) {
  let out = '';
  for (let i = 0; i < count; i++) {
    const answered = answers[questions[i].id] != null;
    const cls = ['bubble', i === current ? 'current' : '', answered ? 'answered' : ''].filter(Boolean).join(' ');
    out += `<button class="${cls}" data-idx="${i}">${i + 1}</button>`;
  }
  return `<div class="bubbles">${out}</div>`;
}

export function quizHTML(pack, index, answers) {
  const q = pack.questions[index];
  const chosen = answers[q.id];
  const total = pack.questions.length;
  const answersHtml = pack.scale.labels.map((label, i) => {
    const value = i + 1;
    const sel = chosen === value ? ' selected' : '';
    return `<button class="answer${sel}" data-value="${value}"><span class="key">${value}</span><span class="answer-label">${label}</span></button>`;
  }).join('\n');
  return `<section class="quiz">
    <div class="progress"><div class="progress-fill" style="width:${(((index + 1) / total) * 100).toFixed(1)}%"></div></div>
    ${bubblesHTML(total, index, answers, pack.questions)}
    <div class="qcard">
      <p class="qcount">${index + 1} / ${total}</p>
      <h2 class="qtext">${q.text}</h2>
      <div class="answers">${answersHtml}</div>
    </div>
    <div class="nav">
      <button class="back" ${index === 0 ? 'disabled' : ''}>${pack.ui.back}</button>
    </div>
  </section>`;
}
