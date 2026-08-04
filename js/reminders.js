/**
 * SYSTÈME D'ALARMES & NOTIFICATIONS
 * ----------------------------------
 * Prototype : utilise l'API Notification native tant que l'app est ouverte
 * (ou en arrière-plan sur la plupart des mobiles/desktops via le Service
 * Worker). Vérifie chaque minute si l'heure d'un rappel actif correspond à
 * l'heure courante.
 *
 * LIMITE HONNÊTE (à connaître, un magistrat ne cache pas les faiblesses
 * d'un dossier) : le Web Notifications API déclenché côté client ne se
 * déclenche que si le navigateur/l'app tourne en tâche de fond — cela ne
 * réveille pas un téléphone totalement éteint. Pour un vrai "harcèlement"
 * garanti même app fermée, il faut une brique serveur Web Push (VAPID keys
 * + service Push du navigateur) : voir README section 5 "Alarmes en
 * production" pour le schéma d'implémentation avec Supabase Edge Functions
 * + pg_cron.
 */
const REMINDERS = (() => {
  let lastFiredMinute = null;

  function requestPermission() {
    if (!('Notification' in window)) return Promise.resolve('unsupported');
    if (Notification.permission === 'granted') return Promise.resolve('granted');
    return Notification.requestPermission();
  }

  function fire(message) {
    if (Notification.permission !== 'granted') return;
    if (navigator.serviceWorker && navigator.serviceWorker.controller) {
      navigator.serviceWorker.ready.then(reg => {
        reg.showNotification('COACH MOHAMED ALI', {
          body: message,
          icon: 'icons/icon-192.svg',
          tag: 'coach-reminder',
          renotify: true
        });
      });
    } else {
      new Notification('COACH MOHAMED ALI', { body: message, icon: 'icons/icon-192.svg' });
    }
  }

  function checkTick() {
    const now = new Date();
    const hhmm = now.toTimeString().slice(0, 5);
    const jourISO = now.getDay() === 0 ? 7 : now.getDay(); // 1=lundi...7=dimanche
    const key = hhmm;
    if (key === lastFiredMinute) return; // évite double déclenchement dans la même minute

    const reminders = DB.getReminders().filter(r => r.actif && r.heure === hhmm && r.jours.includes(jourISO));
    if (reminders.length > 0) {
      reminders.forEach(r => fire(r.message));
      lastFiredMinute = key;
    }
  }

  function start() {
    checkTick();
    setInterval(checkTick, 15000); // vérifie toutes les 15s, suffisant pour la granularité minute
  }

  return { requestPermission, start, fire };
})();
