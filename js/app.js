import { validatePack } from './scoring.js';
import { homeHTML, quizHTML } from './render.js';

const DOMAINS = [
  { id: 'cz', flag: '🇨🇿', name: 'Česko', enabled: true },
  { id: 'pl', flag: '🇵🇱', name: 'Polska', enabled: true },
  { id: 'eu', flag: '🇪🇺', name: 'EU', enabled: false },
  { id: 'us', flag: '🇺🇸', name: 'USA', enabled: false },
];

const HOME_UI = {
  title: 'Politický kompas',
  tagline: 'Hra, ne věda.',
  pickDomain: 'Vyber si zemi',
  comingSoon: 'Už brzy',
};

const app = document.getElementById('app');
const state = { pack: null, answers: {}, index: 0, view: 'compass' };

function renderHome() {
  app.innerHTML = homeHTML(DOMAINS, HOME_UI);
  app.querySelectorAll('.flag:not([disabled])').forEach(btn =>
    btn.addEventListener('click', () => loadDomain(btn.dataset.domain))
  );
}

async function loadDomain(id) {
  const res = await fetch(`data/${id}.json`);
  const pack = await res.json();
  const errors = validatePack(pack);
  if (errors.length) {
    app.innerHTML = `<pre class="error">${errors.join('\n')}</pre>`;
    return;
  }
  state.pack = pack;
  state.answers = {};
  state.index = 0;
  state.view = 'compass';
  renderQuiz();
}

function renderQuiz() {
  const pack = state.pack;
  app.innerHTML = quizHTML(pack, state.index, state.answers);

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

function renderResult() {}

renderHome();

export { state, renderHome, renderQuiz, renderResult };
