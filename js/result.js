import { matchPersonas, axisNamesFromPack, triangleWeights, rankParties, rankPoliticians, isCentrist } from './scoring.js';
import { compassSVG } from './views/compass.js';
import { triangleSVG } from './views/triangle.js';
import { horseshoeSVG } from './views/horseshoe.js';

const VIEWS = { compass: compassSVG, triangle: triangleSVG, horseshoe: horseshoeSVG };

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

export function resultHTML(scores, pack, view) {
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

  const svg = view === 'compass'
    ? compassSVG(scores, pack, 320, { parties })
    : (VIEWS[view] || compassSVG)(scores, pack);

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
    <div class="bars">${axisBars(scores, pack)}</div>
    ${rankingBlock}
    ${nearbyBlock}
    ${credit}
    <button class="restart">${pack.ui.restart}</button>
  </section>`;
}
