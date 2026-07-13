import { validatePack } from './scoring.js';
import { homeHTML } from './render.js';

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

function renderQuiz() {}

function renderResult() {}

renderHome();

export { state, renderHome, renderQuiz, renderResult };
