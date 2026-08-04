/* ============================================================
   COACH MOHAMED ALI — APP.JS
   Routeur de vues + logique des 3 modules (Bibliothèque, Sas de
   Triage, Atelier de Saignage) + Stats + Alarmes.
   ============================================================ */

const MATIERES = {
  culture_generale:        { label: 'Culture Générale',            n: '01' },
  droit_civil:              { label: 'Droit Civil',                 n: '02' },
  droit_penal_general:      { label: 'Droit Pénal Général',         n: '03' },
  droit_penal_special:      { label: 'Droit Pénal Spécial',         n: '04' },
  droit_social:             { label: 'Droit Social',                n: '05' },
  droit_commercial:         { label: 'Droit Commercial',            n: '06' },
  droit_constitutionnel:    { label: 'Droit Constitutionnel',       n: '07' },
  institutions_publiques:   { label: 'Institutions Publiques',      n: '08' },
  procedure_civile:         { label: 'Procédure Civile',            n: '09' },
  procedure_penale:         { label: 'Procédure Pénale',            n: '10' },
  ppsi_vpp:                 { label: 'PPSI / VPP',                  n: '11' }
};

const COACH_QUOTES = [
  "Ceux qui révisent \"quand ils ont le temps\" échouent avec ceux qui n'ont pas révisé du tout.",
  "Un sujet non saigné est un sujet perdu le jour J. Il n'y a pas de moyen terme.",
  "La banalisation, c'est la signature de l'échec. Le jury la repère en une phrase.",
  "Tu ne prépares pas un examen. Tu prépares à devenir celui qui tranche. Écris comme tel.",
  "Le talent sans discipline perd contre la médiocrité disciplinée. Sois les deux.",
];

let STATE = {
  view: 'accueil',
  currentMatiere: null,
  currentCourseId: null,
  currentSubjectId: null,
  wbStep: 'deconstruction'
};

function readCourseIds() {
  return JSON.parse(localStorage.getItem('coachMA_readCourses') || '[]');
}
function markCourseRead(id) {
  const set = new Set(readCourseIds());
  set.add(id);
  localStorage.setItem('coachMA_readCourses', JSON.stringify([...set]));
}
function isMatiereUnlocked(matiere) {
  const courses = DB.getCoursesByMatiere(matiere);
  if (courses.length === 0) return false;
  const read = new Set(readCourseIds());
  return courses.some(c => read.has(c.id));
}

function toast(msg) {
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 3600);
}

function setView(view, payload = {}) {
  STATE.view = view;
  Object.assign(STATE, payload);
  document.querySelectorAll('.nav-item').forEach(n => n.classList.toggle('active', n.dataset.view === view));
  render();
}

function render() {
  const main = document.getElementById('main-view');
  switch (STATE.view) {
    case 'accueil': main.innerHTML = renderAccueil(); break;
    case 'bibliotheque': main.innerHTML = renderBibliotheque(); break;
    case 'course': main.innerHTML = renderCourseDetail(); attachCourseEvents(); break;
    case 'triage': main.innerHTML = renderTriage(); attachTriageEvents(); break;
    case 'workbench': main.innerHTML = renderWorkbench(); attachWorkbenchEvents(); break;
    case 'stats': main.innerHTML = renderStats(); break;
    case 'alarmes': main.innerHTML = renderAlarmes(); attachAlarmesEvents(); break;
  }
  renderStreakBadge();
  window.scrollTo(0, 0);
}

/* ---------------- ACCUEIL ---------------- */
function renderAccueil() {
  const quote = COACH_QUOTES[Math.floor(Math.random() * COACH_QUOTES.length)];
  const stats = DB.getStats();
  const totalSaigne = stats.reduce((a, s) => a + s.sujets_manges, 0);
  const moyenne = stats.length ? Math.round(stats.reduce((a, s) => a + s.score_rigorisme_moyen, 0) / stats.length) : 0;

  return `
    <div class="view-header">
      <div class="eyebrow">État de la forteresse</div>
      <h2 class="view-title">Rapport du jour</h2>
      <p class="view-sub">Chaque session compte. Chaque impasse se paie le jour du concours.</p>
    </div>
    <blockquote class="coach-quote">« ${quote} »</blockquote>
    <div class="grid grid-3" style="margin: 24px 0 30px;">
      <div class="card stat-card"><div class="stat-num">${totalSaigne}</div><div class="stat-lbl">Sujets saignés</div></div>
      <div class="card stat-card"><div class="stat-num">${moyenne || '—'}</div><div class="stat-lbl">Score rigorisme moyen</div></div>
      <div class="card stat-card"><div class="stat-num">${Object.keys(MATIERES).filter(isMatiereUnlocked).length}</div><div class="stat-lbl">Matières entamées</div></div>
    </div>
    <div class="card">
      <h3 style="font-family:var(--font-display); font-size:17px; margin-bottom:10px;">Protocole du jour</h3>
      <p style="color:var(--muted); font-size:13.5px; line-height:1.6;">
        1. Ouvre la <b style="color:var(--text)">Bibliothèque</b>, choisis une matière, intègre le cours magistral.<br>
        2. Passe au <b style="color:var(--text)">Sas de Triage</b> — les sujets se déverrouillent une fois le cours lu.<br>
        3. Saigne le sujet choisi jusqu'au bout : déconstruction → plan → rédaction.<br>
        4. Soumets ta rédaction au <b style="color:var(--text)">Filtre Anti-Banalisation</b>. Corrige. Ne négocie pas avec la qualification exacte.
      </p>
      <div style="margin-top:16px;">
        <button class="btn btn-primary" onclick="setView('bibliotheque')">Entrer dans la bibliothèque →</button>
      </div>
    </div>
  `;
}

function renderStreakBadge() {
  const el = document.getElementById('streak-badge');
  const stats = DB.getStats();
  const total = stats.reduce((a, s) => a + s.sujets_manges, 0);
  el.innerHTML = `<span>SUJETS SAIGNÉS</span><b>${total}</b>`;
}

/* ---------------- BIBLIOTHÈQUE ---------------- */
function renderBibliotheque() {
  const matieresAvecCours = Object.entries(MATIERES).filter(([key]) => DB.getCoursesByMatiere(key).length > 0);
  const cards = matieresAvecCours.map(([key, m]) => {
    const nb = DB.getCoursesByMatiere(key).length;
    return `
      <div class="card matiere-card" onclick="openMatiereBiblio('${key}')">
        <h3>${m.n} — ${m.label}</h3>
        <p>${nb} cours magistra${nb > 1 ? 'ux' : 'l'} disponible${nb > 1 ? 's' : ''}</p>
        <span class="matiere-count">→ INTÉGRER LA SCIENCE</span>
      </div>`;
  }).join('');

  return `
    <div class="view-header">
      <div class="eyebrow">Module 1 — Le Moteur Pédagogique</div>
      <h2 class="view-title">Bibliothèque interne</h2>
      <p class="view-sub">Bibliothèque autonome. Aucune dépendance extérieure. Tu n'entres au Sas de Triage qu'après avoir intégré le cours.</p>
    </div>
    <div class="grid grid-2">${cards || emptyState('Aucun cours pour l\'instant.')}</div>
  `;
}

function openMatiereBiblio(matiere) {
  const courses = DB.getCoursesByMatiere(matiere);
  if (courses.length === 1) { setView('course', { currentCourseId: courses[0].id, currentMatiere: matiere }); return; }
  STATE.currentMatiere = matiere;
  const main = document.getElementById('main-view');
  main.innerHTML = `
    <div class="view-header">
      <div class="eyebrow">${MATIERES[matiere].label}</div>
      <h2 class="view-title">Choisis ton cours</h2>
    </div>
    <div class="grid grid-2">
      ${courses.map(c => `
        <div class="card matiere-card" onclick="setView('course', {currentCourseId:'${c.id}', currentMatiere:'${matiere}'})">
          <h3>${c.titre}</h3>
          <span class="matiere-count">→ LIRE</span>
        </div>`).join('')}
    </div>
    <button class="btn" style="margin-top:18px;" onclick="setView('bibliotheque')">← Retour</button>
  `;
}

function renderCourseDetail() {
  const c = DB.getCourseById(STATE.currentCourseId);
  if (!c) return emptyState('Cours introuvable.');
  return `
    <div class="view-header">
      <div class="eyebrow">${MATIERES[c.matiere].label}</div>
      <h2 class="view-title">${c.titre}</h2>
    </div>
    <div class="card course-body">${c.contenu_cours}</div>
    <div class="tag-row">
      ${c.notions_cles.map(n => `<span class="tag">${n}</span>`).join('')}
      ${c.jurisprudence_associee.map(j => `<span class="tag jp">${j}</span>`).join('')}
    </div>
    <div class="tag-row" style="margin-top:6px;">
      ${c.articles_pivots.map(a => `<span class="tag" style="border-color:var(--gold); color:var(--gold-bright);">${a}</span>`).join('')}
    </div>
    <div style="margin-top:26px; display:flex; gap:10px;">
      <button class="btn btn-primary" id="btn-mark-read">Cours intégré → Déverrouiller le Sas de Triage</button>
      <button class="btn" onclick="setView('bibliotheque')">← Retour à la bibliothèque</button>
    </div>
  `;
}
function attachCourseEvents() {
  const btn = document.getElementById('btn-mark-read');
  if (!btn) return;
  btn.addEventListener('click', () => {
    markCourseRead(STATE.currentCourseId);
    toast('Cours marqué comme intégré. Sas de Triage déverrouillé pour cette matière.');
    setView('triage', { currentMatiere: STATE.currentMatiere });
  });
}

/* ---------------- SAS DE TRIAGE ---------------- */
function renderTriage() {
  const matiereKeys = Object.keys(MATIERES).filter(k => DB.getSubjectsByMatiere(k).length > 0);
  const activeMatiere = STATE.currentMatiere || matiereKeys[0];

  const tabs = matiereKeys.map(k => `
    <button class="btn ${k === activeMatiere ? 'btn-primary' : ''}" style="margin:0 8px 8px 0;" onclick="setView('triage', {currentMatiere:'${k}'})">${MATIERES[k].label}</button>
  `).join('');

  if (!activeMatiere) return emptyState('Aucun sujet disponible pour l\'instant.');

  const unlocked = isMatiereUnlocked(activeMatiere);
  const subjects = DB.getSubjectsByMatiere(activeMatiere);

  const list = subjects.map(s => {
    const locked = !unlocked;
    return `
      <div class="subject-item ${locked ? 'locked' : ''}">
        ${s.statut === 'saigne' ? `<div class="seal-stamp">SAIGNÉ<br>✓</div>` : ''}
        <div class="subject-top">
          <div class="subject-enonce">${s.enonce_sujet}</div>
          <span class="status-pill status-${s.statut}">${s.statut.replace('_', ' ')}</span>
        </div>
        <div class="subject-meta">${s.type_exercice.replace('_', ' ').toUpperCase()} · NIVEAU ${'★'.repeat(s.niveau_difficulte)}</div>
        <div style="margin-top:14px;">
          <button class="btn ${s.statut === 'saigne' ? '' : 'btn-primary'}" ${locked ? 'disabled' : ''}
            onclick="setView('workbench', {currentSubjectId:'${s.id}', wbStep:'deconstruction'})">
            ${locked ? 'Verrouillé — lire le cours d\'abord' : (s.statut === 'saigne' ? 'Revoir la copie' : 'Saigner ce sujet →')}
          </button>
        </div>
      </div>`;
  }).join('');

  return `
    <div class="view-header">
      <div class="eyebrow">Module 2 — Zéro Impasse</div>
      <h2 class="view-title">Le Sas de Triage</h2>
      <p class="view-sub">${unlocked ? 'Choisis ton sujet. Une fois entré dans l\'atelier, tu ne sors qu\'avec une copie saignée.' : '⚠ Verrouillé. Retourne à la Bibliothèque et intègre le cours de cette matière.'}</p>
    </div>
    <div style="margin-bottom:20px;">${tabs}</div>
    ${list}
  `;
}
function attachTriageEvents() {}

/* ---------------- ATELIER DE SAIGNAGE (Workbench) ---------------- */
const WB_STEPS = [
  { key: 'deconstruction', label: 'Déconstruction' },
  { key: 'plan', label: 'Plan' },
  { key: 'redaction', label: 'Rédaction' }
];

function renderWorkbench() {
  const s = DB.getSubjectById(STATE.currentSubjectId);
  if (!s) return emptyState('Sujet introuvable.');
  const prevSubs = DB.getSubmissionsBySujet(s.id);
  const lastForStep = (step) => [...prevSubs].reverse().find(x => x.etape === step);
  const activeStep = STATE.wbStep || 'deconstruction';
  const currentDraft = lastForStep(activeStep);

  const stepsHtml = WB_STEPS.map(st => {
    const done = !!lastForStep(st.key);
    return `<div class="wb-step ${st.key === activeStep ? 'active' : ''} ${done ? 'done' : ''}" onclick="setView('workbench',{currentSubjectId:'${s.id}', wbStep:'${st.key}'})">${st.label}${done ? ' ✓' : ''}</div>`;
  }).join('');

  const lastAnalysis = currentDraft && currentDraft.termes_banalises ? currentDraft : null;

  return `
    <div class="view-header">
      <div class="eyebrow">${MATIERES[s.matiere].label} · ${s.type_exercice.toUpperCase()}</div>
      <h2 class="view-title" style="font-size:22px; line-height:1.35;">${s.enonce_sujet}</h2>
    </div>
    <div class="workbench-steps">${stepsHtml}</div>
    <textarea class="workbench-input" id="wb-textarea" placeholder="${placeholderForStep(activeStep)}">${currentDraft ? currentDraft.texte_brut_utilisateur : ''}</textarea>
    <div style="display:flex; gap:10px; margin-top:14px; flex-wrap:wrap;">
      <button class="btn btn-primary" id="btn-analyser">Soumettre au Filtre Anti-Banalisation</button>
      ${activeStep === 'redaction' ? `<button class="btn" id="btn-saigner" ${s.statut === 'saigne' ? 'disabled' : ''}>${s.statut === 'saigne' ? 'Sujet déjà saigné ✓' : 'Marquer le sujet SAIGNÉ'}</button>` : ''}
      <button class="btn" onclick="setView('triage', {currentMatiere:'${s.matiere}'})">← Retour au Sas de Triage</button>
    </div>
    <div id="analysis-output">${lastAnalysis ? buildCorrectionHtml(lastAnalysis) : ''}</div>
  `;
}

function placeholderForStep(step) {
  if (step === 'deconstruction') return 'Déconstruis le sujet : mots-clés, notion piège, problématique posée. Sois exhaustif, sois précis.';
  if (step === 'plan') return 'Rédige ton plan détaillé (I / A / B — II / A / B). Chaque titre doit être une phrase juridique affirmative, jamais une simple étiquette.';
  return 'Rédige ta copie complète. C\'est ici que le Filtre Anti-Banalisation sera le plus impitoyable.';
}

function buildCorrectionHtml(sub) {
  const verdict = ANTI_BANALISATION.verdictCoach(sub.score_rigorisme);
  const items = (sub.termes_banalises || []).map(t => `
    <div class="correction-item">
      <span class="banal">${t.terme}</span> → <span class="juste">${t.correction}</span>
      <span class="article-vise">Réf. : ${t.article_vise}</span>
    </div>
  `).join('') || `<div class="correction-item">Aucune banalisation lexicale détectée par le filtre. Vérifie tout de même la structure du syllogisme.</div>`;

  return `
    <div class="correction-block">
      <div class="correction-title">Correction chirurgicale</div>
      ${items}
      <div class="score-ring">
        <div class="score-number" style="color:${sub.score_rigorisme >= 65 ? 'var(--green)' : 'var(--red-bright)'}">${sub.score_rigorisme}</div>
        <div>
          <div class="score-label">SCORE DE RIGORISME / 100</div>
          <div style="font-size:13px; margin-top:4px; color:var(--gold-bright); max-width:420px;">${verdict.texte}</div>
        </div>
      </div>
    </div>
  `;
}

function attachWorkbenchEvents() {
  const btnAnalyser = document.getElementById('btn-analyser');
  const btnSaigner = document.getElementById('btn-saigner');
  const s = DB.getSubjectById(STATE.currentSubjectId);

  if (btnAnalyser) {
    btnAnalyser.addEventListener('click', () => {
      const texte = document.getElementById('wb-textarea').value.trim();
      if (texte.length < 15) { toast('Texte trop court. On n\'analyse pas du vide.'); return; }
      const { trouvailles, score } = ANTI_BANALISATION.analyser(texte, s.matiere);
      const submission = DB.addSubmission({
        sujet_id: s.id,
        etape: STATE.wbStep,
        texte_brut_utilisateur: texte,
        termes_banalises: trouvailles,
        score_rigorisme: score
      });
      DB.updateSubjectStatus(s.id, s.statut === 'a_faire' ? 'en_cours' : s.statut);
      document.getElementById('analysis-output').innerHTML = buildCorrectionHtml(submission);
      toast(score >= 65 ? 'Reçu. Niveau acceptable — mais ne relâche rien.' : 'Reçu. Corrige immédiatement chaque terme signalé.');
    });
  }

  if (btnSaigner) {
    btnSaigner.addEventListener('click', () => {
      const subs = DB.getSubmissionsBySujet(s.id);
      const hasAll = WB_STEPS.every(st => subs.some(x => x.etape === st.key));
      if (!hasAll) { toast('Les 3 étapes (déconstruction, plan, rédaction) doivent être soumises avant de saigner le sujet.'); return; }
      const lastRedaction = [...subs].reverse().find(x => x.etape === 'redaction');
      DB.updateSubjectStatus(s.id, 'saigne');
      DB.bumpStats(s.matiere, lastRedaction.score_rigorisme);
      toast('SUJET SAIGNÉ. Passe au suivant — la forteresse ne se construit pas en un jour.');
      setView('triage', { currentMatiere: s.matiere });
    });
  }
}

/* ---------------- STATS ---------------- */
function renderStats() {
  const stats = DB.getStats();
  if (stats.length === 0) return `
    <div class="view-header">
      <div class="eyebrow">Suivi de progression</div>
      <h2 class="view-title">Statistiques</h2>
    </div>
    ${emptyState('Aucune donnée. Saigne ton premier sujet pour faire apparaître ton relevé de performance.')}
  `;
  const rows = stats.map(s => `
    <div class="card" style="margin-bottom:10px; display:flex; justify-content:space-between; align-items:center;">
      <div>
        <div style="font-family:var(--font-display); font-size:15px;">${MATIERES[s.matiere].label}</div>
        <div style="font-family:var(--font-mono); font-size:10.5px; color:var(--muted); margin-top:3px;">Dernière session : ${s.derniere_session ? new Date(s.derniere_session).toLocaleDateString('fr-FR') : '—'}</div>
      </div>
      <div style="display:flex; gap:26px; text-align:right;">
        <div><div class="stat-num" style="font-size:22px;">${s.sujets_manges}</div><div class="stat-lbl">saignés</div></div>
        <div><div class="stat-num" style="font-size:22px; color:${s.score_rigorisme_moyen>=65?'var(--green)':'var(--red-bright)'}">${s.score_rigorisme_moyen}</div><div class="stat-lbl">rigorisme moy.</div></div>
      </div>
    </div>
  `).join('');
  return `
    <div class="view-header">
      <div class="eyebrow">Suivi de progression</div>
      <h2 class="view-title">Statistiques</h2>
      <p class="view-sub">Zéro complaisance dans les chiffres. Ce qui n'est pas mesuré n'est pas maîtrisé.</p>
    </div>
    ${rows}
  `;
}

/* ---------------- ALARMES ---------------- */
function renderAlarmes() {
  const reminders = DB.getReminders();
  const jours = ['', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  const rows = reminders.map(r => `
    <div class="reminder-row">
      <div>
        <div class="reminder-time">${r.heure}</div>
        <div class="reminder-msg">${r.message}</div>
        <div style="font-family:var(--font-mono); font-size:10px; color:var(--muted); margin-top:4px;">${r.jours.map(j => jours[j]).join(' · ')}</div>
      </div>
      <div style="display:flex; align-items:center; gap:14px;">
        <div class="toggle ${r.actif ? 'on' : ''}" data-id="${r.id}"></div>
        <button class="btn btn-danger" style="padding:6px 10px; font-size:11px;" data-del="${r.id}">Suppr.</button>
      </div>
    </div>
  `).join('');

  return `
    <div class="view-header">
      <div class="eyebrow">Module 4 — Discipline de fer</div>
      <h2 class="view-title">Alarmes & notifications</h2>
      <p class="view-sub">Le système te relance aux heures programmées. Active les notifications du navigateur pour que ça fonctionne réellement.</p>
    </div>
    <button class="btn btn-primary" id="btn-perm" style="margin-bottom:18px;">Activer les notifications</button>
    <div class="card">${rows}</div>
    <div class="card" style="margin-top:16px;">
      <h3 style="font-family:var(--font-display); font-size:15px; margin-bottom:12px;">Ajouter un rappel</h3>
      <div style="display:flex; gap:10px; flex-wrap:wrap; align-items:center;">
        <input type="time" id="new-time" value="06:30">
        <input type="text" id="new-msg" placeholder="Message du coach..." style="flex:1; min-width:220px;">
        <button class="btn" id="btn-add-reminder">Ajouter</button>
      </div>
    </div>
  `;
}

function attachAlarmesEvents() {
  document.getElementById('btn-perm').addEventListener('click', async () => {
    const res = await REMINDERS.requestPermission();
    if (res === 'granted') { toast('Notifications activées. Aucune excuse ne tiendra plus.'); REMINDERS.fire('Test : le système d\'alarme est opérationnel.'); }
    else toast('Notifications refusées. Tu te prives toi-même d\'un outil de discipline.');
  });
  document.querySelectorAll('.toggle').forEach(t => {
    t.addEventListener('click', () => {
      const rem = DB.getReminders().find(r => r.id === t.dataset.id);
      DB.updateReminder(t.dataset.id, { actif: !rem.actif });
      render();
    });
  });
  document.querySelectorAll('[data-del]').forEach(btn => {
    btn.addEventListener('click', () => { DB.deleteReminder(btn.dataset.del); render(); });
  });
  document.getElementById('btn-add-reminder').addEventListener('click', () => {
    const heure = document.getElementById('new-time').value;
    const msg = document.getElementById('new-msg').value.trim();
    if (!heure || !msg) { toast('Heure et message obligatoires.'); return; }
    DB.addReminder({ heure, jours: [1,2,3,4,5,6,7], message: msg });
    toast('Rappel ajouté.');
    render();
  });
}

/* ---------------- UTILS ---------------- */
function emptyState(msg) { return `<div class="empty-state">${msg}</div>`; }

/* ---------------- INIT ---------------- */
document.addEventListener('DOMContentLoaded', () => {
  DB.seedIfEmpty();

  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => setView(item.dataset.view));
  });

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js').catch(() => {});
  }

  REMINDERS.start();
  render();
});
