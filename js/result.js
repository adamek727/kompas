import { matchPersonas, axisNamesFromPack, triangleWeights } from './scoring.js';
import { compassSVG } from './views/compass.js';
import { triangleSVG } from './views/triangle.js';
import { horseshoeSVG } from './views/horseshoe.js';

const VIEWS = { compass: compassSVG, triangle: triangleSVG, horseshoe: horseshoeSVG };

function dominantFamily(scores, pack, axisNames) {
  const poles = pack.views.triangle.poles;
  const w = triangleWeights(scores, poles, axisNames);
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

export function resultHTML(scores, pack, view) {
  const axisNames = axisNamesFromPack(pack);
  const { top, runnerUp } = matchPersonas(scores, pack.personas, axisNames);
  const family = dominantFamily(scores, pack, axisNames);
  const accent = family?.color || 'var(--primary)';
  const svg = (VIEWS[view] || compassSVG)(scores, pack);
  const tabs = Object.keys(VIEWS).map(v =>
    `<button class="tab${v === view ? ' active' : ''}" data-view="${v}">${pack.ui.views[v]}</button>`
  ).join('');
  const also = runnerUp ? `<p class="also">${pack.ui.alsoClose}: <strong>${runnerUp.name}</strong></p>` : '';
  const fam = family ? `<span class="fam" style="--f:${accent}">${family.label}</span>` : '';
  const tags = (top.party || top.politician) ? `<div class="tags">
      ${top.party ? `<span class="tag">🏛 ${top.party}</span>` : ''}
      ${top.politician ? `<span class="tag">👤 ${top.politician}</span>` : ''}
    </div>` : '';
  return `<section class="result" style="--accent-family:${accent}">
    <p class="result-title">${pack.ui.result}</p>
    <div class="persona">
      <p class="matchlabel">${pack.ui.match}</p>
      <h3>${top.name}</h3>
      ${fam}
      <p class="blurb">${top.blurb}</p>
      ${tags}
      ${also}
    </div>
    <div class="tabs">${tabs}</div>
    <div class="vizwrap">${svg}</div>
    <div class="bars">${axisBars(scores, pack)}</div>
    <button class="restart">${pack.ui.restart}</button>
  </section>`;
}
