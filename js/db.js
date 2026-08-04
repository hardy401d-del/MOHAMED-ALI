/**
 * DB — couche d'accès aux données.
 *
 * Prototype : persistance locale (localStorage) pour un fonctionnement 100%
 * autonome, offline, sans backend à déployer.
 *
 * Passage en production (Supabase) : chaque fonction ci-dessous a une
 * signature qui correspond 1:1 à un appel supabase-js. Voir les commentaires
 * "// SUPABASE:" à côté de chaque fonction.
 */
const DB = (() => {
  const NS = 'coachMA_';

  function _read(table) {
    const raw = localStorage.getItem(NS + table);
    return raw ? JSON.parse(raw) : [];
  }
  function _write(table, rows) {
    localStorage.setItem(NS + table, JSON.stringify(rows));
  }
  function uid() {
    return 'id-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
  }

  function seedIfEmpty() {
    if (_read('courses').length === 0) _write('courses', COURSES_SEED);
    if (_read('subjects').length === 0) _write('subjects', SUBJECTS_SEED);
    if (_read('submissions').length === 0) _write('submissions', []);
    if (_read('performance_stats').length === 0) _write('performance_stats', []);
    if (_read('reminders').length === 0) {
      _write('reminders', [
        { id: uid(), heure: '07:00', jours: [1,2,3,4,5,6,7], message: 'Debout. La forteresse ne t\'attend pas. Première session de charbonnage.', actif: true },
        { id: uid(), heure: '13:30', jours: [1,2,3,4,5,6], message: 'Pause terminée. Retour au sujet en cours. Zéro impasse.', actif: true },
        { id: uid(), heure: '20:00', jours: [1,2,3,4,5,6,7], message: 'Bilan du jour : combien de sujets saignés aujourd\'hui ? Si zéro, tu sais ce qu\'il te reste à faire.', actif: true }
      ]);
    }
  }

  return {
    seedIfEmpty,

    // SUPABASE: supabase.from('courses').select('*')
    getCourses() { return _read('courses'); },
    getCourseById(id) { return _read('courses').find(c => c.id === id) || null; },
    getCoursesByMatiere(matiere) { return _read('courses').filter(c => c.matiere === matiere); },

    // SUPABASE: supabase.from('subjects').select('*').eq('matiere', matiere)
    getSubjects() { return _read('subjects'); },
    getSubjectsByMatiere(matiere) { return _read('subjects').filter(s => s.matiere === matiere); },
    getSubjectById(id) { return _read('subjects').find(s => s.id === id) || null; },

    // SUPABASE: supabase.from('subjects').update({ statut }).eq('id', id)
    updateSubjectStatus(id, statut) {
      const rows = _read('subjects');
      const idx = rows.findIndex(s => s.id === id);
      if (idx >= 0) { rows[idx].statut = statut; _write('subjects', rows); }
      return rows[idx];
    },

    // SUPABASE: supabase.from('submissions').insert({...})
    addSubmission(sub) {
      const rows = _read('submissions');
      const row = { id: uid(), created_at: new Date().toISOString(), ...sub };
      rows.push(row);
      _write('submissions', rows);
      return row;
    },
    getSubmissionsBySujet(sujetId) {
      return _read('submissions').filter(s => s.sujet_id === sujetId);
    },
    getAllSubmissions() { return _read('submissions'); },

    // SUPABASE: supabase.from('performance_stats').upsert({...}, { onConflict: 'matiere' })
    bumpStats(matiere, scoreRigorisme) {
      const rows = _read('performance_stats');
      let row = rows.find(r => r.matiere === matiere);
      if (!row) {
        row = { id: uid(), matiere, sujets_manges: 0, score_rigorisme_moyen: 0, derniere_session: null };
        rows.push(row);
      }
      const totalPrev = row.score_rigorisme_moyen * row.sujets_manges;
      row.sujets_manges += 1;
      row.score_rigorisme_moyen = Math.round(((totalPrev + scoreRigorisme) / row.sujets_manges) * 10) / 10;
      row.derniere_session = new Date().toISOString();
      _write('performance_stats', rows);
      return row;
    },
    getStats() { return _read('performance_stats'); },

    // SUPABASE: supabase.from('reminders').select('*')
    getReminders() { return _read('reminders'); },
    updateReminder(id, patch) {
      const rows = _read('reminders');
      const idx = rows.findIndex(r => r.id === id);
      if (idx >= 0) { rows[idx] = { ...rows[idx], ...patch }; _write('reminders', rows); }
      return rows[idx];
    },
    addReminder(rem) {
      const rows = _read('reminders');
      const row = { id: uid(), actif: true, ...rem };
      rows.push(row);
      _write('reminders', rows);
      return row;
    },
    deleteReminder(id) {
      _write('reminders', _read('reminders').filter(r => r.id !== id));
    }
  };
})();
