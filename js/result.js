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
