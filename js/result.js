import { matchPersonas, axisNamesFromPack, triangleWeights, rankParties, rankPoliticians, isCentrist, axisContributions } from './scoring.js';
import { compassSVG } from './views/compass.js';
import { triangleSVG } from './views/triangle.js';
import { horseshoeSVG } from './views/horseshoe.js';

const VIEWS = { compass: compassSVG, triangle: triangleSVG, horseshoe: horseshoeSVG };

const METHOD = {
  cs: { title: 'Jak to funguje', note: 'Každá odpověď (1–5) posune osy podle váhy otázky. Nejvíc tě ovlivnily tyto otázky:' },
  pl: { title: 'Jak to działa', note: 'Każda odpowiedź (1–5) przesuwa osie zależnie od wagi pytania. Najbardziej wpłynęły te pytania:' },
  en: { title: 'How this works', note: 'Each answer (1–5) nudges the axes by the question’s weight. These shaped your result the most:' },
};

const LEGEND = {
  cs: { socialist: 'Socialista', green: 'Zelený', conservative: 'Konzervativec', liberal: 'Liberál' },
  pl: { socialist: 'Socjalista', green: 'Zielony', conservative: 'Konserwatysta', liberal: 'Liberał' },
  en: { socialist: 'Socialist', green: 'Green', conservative: 'Conservative', liberal: 'Liberal' },
};

function initials(s) {
  return (s || '').trim().split(/\s+/).map(w => w[0] || '').join('').slice(0, 2).toUpperCase();
}

function familyPole(coords, pack, axisNames) {
  const poles = pack.views.triangle.poles;
  const w = triangleWeights(coords, poles, axisNames);
  let idx = 0;
  for (let i = 1; i < w.length; i++) if (w[i] > w[idx]) idx = i;
  return poles[idx];
}

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

function avatarHTML(pol, accent, size) {
  const cls = size === 'sm' ? 'near-av' : 'avatar';
  return `<div class="${cls}${pol.photo ? '' : ' noimg'}" style="--f:${accent}">
        ${pol.photo ? `<img src="${pol.photo}" alt="${pol.name}" onerror="this.closest('.${cls}').classList.add('noimg')">` : ''}
        <span class="mono">${initials(pol.name)}</span>
      </div>`;
}

export function resultHTML(scores, pack, view, answers) {
  const axisNames = axisNamesFromPack(pack);
  const { top: party, runnerUp } = matchPersonas(scores, pack.personas, axisNames);
  const famPole = familyPole(scores, pack, axisNames);
  const accent = famPole?.color || 'var(--primary)';
  const pol = (party.politicians && party.politicians.length)
    ? matchPersonas(scores, party.politicians, axisNames).top
    : null;
  const centrist = isCentrist(scores, axisNames);
  const ranking = rankParties(scores, pack.personas, axisNames);
  const nearby = rankPoliticians(scores, pack.personas, axisNames, 3);

  const parties = pack.personas.map(p => ({
    id: p.id,
    coords: p.coords,
    name: `${p.party || p.name}${p.politicians?.[0]?.name ? ' — ' + p.politicians[0].name : ''}`,
    photo: p.politicians?.[0]?.photo || null,
    initials: initials(p.party || p.name),
    color: familyPole(p.coords, pack, axisNames)?.color || '#5c6579',
    matched: p.id === party.id,
  }));

  const svg = (VIEWS[view] || compassSVG)(scores, pack, undefined, { parties });

  const LG = LEGEND[pack.meta?.lang] || LEGEND.en;
  const legendBlock = view === 'compass' ? `<div class="viz-legend">
    <span class="lg"><i style="background:#e5484d"></i>${LG.socialist}</span>
    <span class="lg"><i style="background:#16a34a"></i>${LG.green}</span>
    <span class="lg"><i style="background:#2563eb"></i>${LG.conservative}</span>
    <span class="lg"><i style="background:#e1a200"></i>${LG.liberal}</span>
  </div>` : '';

  const tabs = Object.keys(VIEWS).map(v =>
    `<button class="tab${v === view ? ' active' : ''}" data-view="${v}">${pack.ui.views[v]}</button>`
  ).join('');

  const fam = famPole ? `<span class="fam" style="--f:${accent}">${famPole.label}</span>` : '';
  const partyChip = party.party ? `<span class="party-chip">🏛 ${party.party}</span>` : '';
  const centristNote = centrist && pack.ui.centrist ? `<p class="centrist-note">${pack.ui.centrist}</p>` : '';
  const polBlock = pol ? `<div class="pol">
      <p class="pol-name">👤 ${pol.name}</p>
      <p class="pol-bio">${pol.bio || ''}</p>
    </div>` : '';
  const also = runnerUp ? `<p class="also">${pack.ui.alsoClose}: <strong>${runnerUp.name}</strong></p>` : '';

  const rankingBlock = `<div class="ranking">
    <p class="section-title">${pack.ui.ranking || 'Party match'}</p>
    ${ranking.map(r => {
      const c = familyPole(r.persona.coords, pack, axisNames)?.color || 'var(--primary)';
      return `<div class="rank-row${r.persona.id === party.id ? ' me' : ''}" data-party="${r.persona.id}">
        <span class="rank-name">${r.persona.name}</span>
        <div class="rank-track"><div class="rank-fill" style="width:${r.pct}%;background:${c}"></div></div>
        <span class="rank-pct">${r.pct}%</span>
      </div>`;
    }).join('')}
  </div>`;

  const nearbyBlock = nearby.length ? `<div class="nearby">
    <p class="section-title">${pack.ui.nearby || 'Closest politicians'}</p>
    ${nearby.map(t => `<div class="near-row">
      ${avatarHTML(t.politician, accent, 'sm')}
      <div class="near-meta"><span class="near-name">${t.politician.name}</span><span class="near-party">${t.party.party || t.party.name}</span></div>
      <span class="rank-pct">${t.pct}%</span>
    </div>`).join('')}
  </div>` : '';

  const M = METHOD[pack.meta?.lang] || METHOD.en;
  const contrib = answers ? axisContributions(answers, pack.questions, axisNames, pack.scale?.points ?? 5) : null;
  const methodologyBlock = contrib ? `<details class="method">
    <summary>${M.title}</summary>
    <p class="method-note">${M.note}</p>
    ${axisNames.map(name => {
      const meta = pack.axes[name];
      const top = contrib[name].slice(0, 2);
      if (!top.length) return '';
      return `<div class="method-axis">
        <p class="method-axis-name"><span>${meta.min}</span><span>${meta.max}</span></p>
        ${top.map(t => `<p class="method-q"><span class="method-dir">${t.contribution < 0 ? '←' : '→'}</span> ${t.question.text}</p>`).join('')}
      </div>`;
    }).join('')}
    ${pack.meta?.calibration ? `<p class="method-calib">${pack.meta.calibration}</p>` : ''}
  </details>` : '';

  const credit = parties.some(p => p.photo) || pol?.photo || nearby.some(t => t.politician.photo)
    ? `<p class="credit">Photos: Wikimedia Commons</p>` : '';

  return `<section class="result" style="--accent-family:${accent}">
    <p class="result-title">${pack.ui.result}</p>
    <div class="persona">
      <div class="persona-head">
        ${pol ? avatarHTML(pol, accent) : ''}
        <div class="pid">
          <p class="matchlabel">${pack.ui.match}</p>
          <h3>${party.name}</h3>
          <div class="chips">${fam}${partyChip}</div>
        </div>
      </div>
      ${centristNote}
      <p class="blurb">${party.blurb}</p>
      ${polBlock}
      ${also}
    </div>
    <div class="tabs">${tabs}</div>
    <div class="vizwrap">${svg}</div>
    ${legendBlock}
    <div class="bars">${axisBars(scores, pack)}</div>
    ${rankingBlock}
    ${nearbyBlock}
    ${methodologyBlock}
    ${credit}
    <div class="result-actions">
      <button class="restart">${pack.ui.restart}</button>
      <button class="share" type="button">🔗 <span class="share-label"></span></button>
    </div>
  </section>`;
}
