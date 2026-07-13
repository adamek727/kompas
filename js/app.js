import { validatePack, scoreAxes, axisNamesFromPack } from './scoring.js';
import { resultHTML } from './result.js';
import { homeHTML, quizHTML } from './render.js';
import { encodeAnswers, decodeAnswers, parseHash, shareHash } from './share.js';

const DOMAINS = [
  { id: 'cz', flag: '🇨🇿', name: 'Česko', enabled: true },
  { id: 'pl', flag: '🇵🇱', name: 'Polska', enabled: true },
  { id: 'eu', flag: '🇪🇺', name: 'EU', enabled: true },
  { id: 'us', flag: '🇺🇸', name: 'USA', enabled: true },
  { id: 'uk', flag: '🇬🇧', name: 'UK', enabled: true },
];

const HOME_UI = {
  title: 'Political Compass',
  tagline: 'A game, not science.',
  pickDomain: 'Choose your arena',
  comingSoon: 'Coming soon',
};

const SHARE_UI = {
  cs: { share: 'Sdílet', copied: 'Zkopírováno!' },
  pl: { share: 'Udostępnij', copied: 'Skopiowano!' },
  en: { share: 'Share', copied: 'Copied!' },
};

const app = document.getElementById('app');
const live = document.getElementById('live');
const state = { pack: null, answers: {}, index: 0, view: 'compass', screen: 'home' };

function renderHome() {
  state.screen = 'home';
  document.title = HOME_UI.title;
  if (location.hash) history.replaceState(null, '', location.pathname + location.search);
  app.innerHTML = homeHTML(DOMAINS, HOME_UI);
  app.querySelectorAll('.flag:not([disabled])').forEach(btn =>
    btn.addEventListener('click', () => loadDomain(btn.dataset.domain))
  );
}

async function fetchPack(id) {
  try {
    const res = await fetch(`data/${id}.json`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const pack = await res.json();
    const errors = validatePack(pack);
    if (errors.length) { app.innerHTML = `<pre class="error">${errors.join('\n')}</pre>`; return null; }
    return pack;
  } catch (e) {
    app.innerHTML = `<pre class="error">Could not load "${id}" (${e.message})</pre>`;
    return null;
  }
}

async function loadDomain(id) {
  const pack = await fetchPack(id);
  if (!pack) return;
  document.documentElement.lang = pack.meta.lang;
  state.pack = pack;
  state.answers = {};
  state.index = 0;
  state.view = 'compass';
  renderQuiz();
}

async function loadSharedResult(id, digits) {
  const pack = await fetchPack(id);
  if (!pack) return;
  document.documentElement.lang = pack.meta.lang;
  state.pack = pack;
  state.answers = decodeAnswers(pack, digits);
  state.index = 0;
  state.view = 'compass';
  renderResult();
}

function renderQuiz() {
  const pack = state.pack;
  state.screen = 'quiz';
  document.title = `${HOME_UI.title} — ${pack.meta.name}`;
  app.innerHTML = quizHTML(pack, state.index, state.answers);
  if (live) live.textContent = `${state.index + 1} / ${pack.questions.length}: ${pack.questions[state.index].text}`;

  app.querySelectorAll('.answer').forEach(btn =>
    btn.addEventListener('click', () => answer(Number(btn.dataset.value)))
  );
  const back = app.querySelector('.back');
  if (back) back.addEventListener('click', () => { if (state.index > 0) { state.index--; renderQuiz(); } });
  app.querySelectorAll('.bubble').forEach(b =>
    b.addEventListener('click', () => { state.index = Number(b.dataset.idx); renderQuiz(); })
  );
}

function answer(value) {
  const pack = state.pack;
  state.answers[pack.questions[state.index].id] = value;
  if (state.index < pack.questions.length - 1) { state.index++; renderQuiz(); }
  else renderResult();
}

function renderResult() {
  const pack = state.pack;
  state.screen = 'result';
  document.title = `${HOME_UI.title} — ${pack.meta.name}`;
  const scores = scoreAxes(state.answers, pack.questions, axisNamesFromPack(pack), pack.scale?.points ?? 5);
  app.innerHTML = resultHTML(scores, pack, state.view);
  app.querySelectorAll('.tab').forEach(t =>
    t.addEventListener('click', () => { state.view = t.dataset.view; renderResult(); })
  );
  app.querySelector('.restart').addEventListener('click', renderHome);
  app.querySelectorAll('.compass .party-hit').forEach(el =>
    el.addEventListener('click', () => {
      const row = app.querySelector(`.rank-row[data-party="${el.dataset.party}"]`);
      if (!row) return;
      row.scrollIntoView({ behavior: 'smooth', block: 'center' });
      row.classList.remove('flash');
      void row.offsetWidth;
      row.classList.add('flash');
    })
  );

  const digits = encodeAnswers(pack, state.answers);
  history.replaceState(null, '', shareHash(pack.meta.id, digits));
  const sl = SHARE_UI[pack.meta.lang] || SHARE_UI.en;
  const shareLabel = app.querySelector('.share-label');
  if (shareLabel) shareLabel.textContent = sl.share;
  const shareBtn = app.querySelector('.share');
  if (shareBtn) shareBtn.addEventListener('click', async () => {
    const url = location.origin + location.pathname + shareHash(pack.meta.id, digits);
    try { await navigator.clipboard.writeText(url); } catch (_) { /* clipboard unavailable */ }
    if (shareLabel) { shareLabel.textContent = sl.copied; setTimeout(() => { shareLabel.textContent = sl.share; }, 1600); }
  });
}

function onKey(e) {
  if (state.screen !== 'quiz' || !state.pack) return;
  const n = Number(e.key);
  if (Number.isInteger(n) && n >= 1 && n <= state.pack.scale.points) {
    e.preventDefault();
    answer(n);
  } else if (e.key === 'Backspace' || e.key === 'ArrowLeft') {
    e.preventDefault();
    if (state.index > 0) { state.index--; renderQuiz(); }
  }
}

document.addEventListener('keydown', onKey);

const shared = parseHash(location.hash);
if (shared && DOMAINS.some(d => d.id === shared.id && d.enabled)) {
  loadSharedResult(shared.id, shared.digits);
} else {
  renderHome();
}

export { state, renderHome, renderQuiz, renderResult };
