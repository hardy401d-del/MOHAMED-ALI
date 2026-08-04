# Coach Mohamed Ali — Machine de Métamorphose

Prototype PWA fonctionnel pour la préparation au concours de la magistrature (ENMG Madagascar).

## 1. Lancer le prototype

Aucune dépendance, aucun build. Ouvre `index.html` avec un serveur local (obligatoire pour que
le Service Worker et le manifest fonctionnent — pas en `file://`) :

```bash
cd coach-mohamed-ali
python3 -m http.server 8080
# puis ouvrir http://localhost:8080 dans le navigateur
```

Sur mobile : ouvrir l'URL dans Chrome/Safari → menu → **Ajouter à l'écran d'accueil**. L'app
s'installe comme une vraie appli (icône, plein écran, fonctionne hors-ligne).

## 2. Architecture des dossiers

```
coach-mohamed-ali/
├── index.html              # Shell de l'application (sidebar + zone de vue)
├── manifest.json           # Config PWA (installable)
├── service-worker.js       # Cache offline + réception des notifications
├── css/
│   └── style.css           # Design system complet (tokens, composants)
├── js/
│   ├── db.js                # Couche d'accès aux données (localStorage → Supabase-ready)
│   ├── courses-data.js      # Seed table `courses` (cours magistraux)
│   ├── subjects-data.js     # Seed table `subjects` (sujets stratégiques)
│   ├── anti-banalisation.js # Moteur de détection + correction chirurgicale
│   ├── reminders.js         # Système d'alarmes (Notification API)
│   └── app.js                # Routeur de vues + logique des 3 modules
├── icons/                  # Icônes PWA (SVG, empreinte de tampon)
├── sql/
│   └── schema.sql           # Schéma complet Supabase/PostgreSQL (4 tables + RLS)
└── README.md
```

## 3. Le triptyque implémenté

| Module | Où | Comportement |
|---|---|---|
| **Moteur pédagogique** | `js/courses-data.js` + vue Bibliothèque | Cours structuré, notions clés, jurisprudence, articles pivots — lu avant tout accès aux sujets |
| **Sas de triage / Zéro Impasse** | `js/subjects-data.js` + vue Triage | Un sujet reste `verrouille` (visuellement grisé, bouton désactivé) tant qu'aucun cours de la matière n'a été marqué comme intégré. L'atelier de saignage impose 3 étapes obligatoires (déconstruction → plan → rédaction) avant de pouvoir marquer un sujet `saigne` |
| **Filtre anti-banalisation** | `js/anti-banalisation.js` | Dictionnaire de +18 formulations banales → qualification juridique exacte + article pivot visé + score de rigorisme /100 calculé sur la densité de banalisation et la présence de connecteurs de syllogisme |

## 4. Pourquoi localStorage et pas Supabase directement dans ce prototype

Le prototype doit tourner **immédiatement, sans compte, sans clé API, sans backend à déployer** —
conforme à l'exigence "bibliothèque autonome". `js/db.js` est écrit pour que chaque fonction ait
une correspondance 1:1 avec un appel `supabase-js` (commentaires `// SUPABASE:` dans le fichier).
Migrer vers une vraie base revient à remplacer le corps de chaque fonction de `db.js`, sans toucher
au reste de l'application.

## 5. Montée en production — 3 chantiers restants

**a) Backend Supabase réel**
Exécuter `sql/schema.sql` sur un projet Supabase, activer Auth (email/magic link), remplacer
`js/db.js` par des appels `supabase.from(...)`. Le RLS est déjà écrit dans le schéma.

**b) Moteur anti-banalisation propulsé par un vrai LLM**
Le dictionnaire actuel est heuristique (rapide, gratuit, 100% offline) mais limité aux tournures
prévues. Pour une correction contextuelle illimitée : envoyer `texte_brut_utilisateur` +
`contenu_cours` associé à l'API Anthropic (`claude-sonnet-4-6` ou supérieur), avec un prompt système
imposant un JSON de sortie identique au format `{terme, correction, article_vise}` déjà utilisé —
zéro changement côté frontend, seule `analyser()` dans `anti-banalisation.js` change de source.

**c) Notifications garanties app fermée (vrai "harcèlement")**
Le prototype utilise l'API Notification côté client : fiable tant que l'app/le navigateur tourne
en fond, pas si le téléphone est totalement éteint ou l'app tuée. Pour un déclenchement garanti :
générer des clés VAPID, stocker les `push_subscription` par utilisateur, et déclencher l'envoi via
une **Supabase Edge Function planifiée par `pg_cron`** qui lit la table `reminders` chaque minute et
pousse la notification Web Push. C'est le seul chantier qui nécessite un vrai serveur.

## 6. Déployer sur GitHub + Render

**a) Pousser sur GitHub**

```bash
cd coach-mohamed-ali
git init
git add .
git commit -m "Coach Mohamed Ali — v1"
git branch -M main
git remote add origin https://github.com/<ton-pseudo>/coach-mohamed-ali.git
git push -u origin main
```

**b) Connecter Render**

1. Sur [render.com](https://render.com) → **New +** → **Static Site**
2. Connecte ton compte GitHub, choisis le repo `coach-mohamed-ali`
3. Render détecte automatiquement `render.yaml` (déjà inclus dans le repo) — sinon configure
   manuellement :
   - **Build Command** : *(laisser vide, aucun build n'est nécessaire)*
   - **Publish directory** : `.` (racine du repo)
4. Déployer. Render fournit une URL HTTPS (`https://coach-mohamed-ali.onrender.com`) — **le HTTPS
   est obligatoire** pour que le Service Worker et l'installation PWA fonctionnent, Render le
   fournit automatiquement.

**c) Vérifier après déploiement**
- L'icône d'installation doit apparaître dans la barre d'adresse (Chrome desktop) ou le menu
  "Ajouter à l'écran d'accueil" (mobile)
- `https://ton-url.onrender.com/manifest.json` doit répondre 200
- Le lien partagé sur WhatsApp/LinkedIn doit afficher l'aperçu avec le titre et l'image — c'est
  `icons/og-image.png` et les balises `<meta property="og:...">` dans `index.html` qui gèrent ça

**d) Ce qui a été ajouté pour que le déploiement soit propre**
- `icons/icon-192.png`, `icon-512.png` — Android/Chrome exigent du PNG, le SVG seul dans le
  manifest est ignoré par une partie des navigateurs
- `icons/apple-touch-icon.png` (180×180) — iOS ignore le SVG pour l'icône d'écran d'accueil
- `icons/favicon.ico` + `favicon-16/32.png` — favicon classique dans l'onglet du navigateur
- `icons/og-image.png` (1200×630) + balises Open Graph/Twitter dans `index.html` — aperçu de lien
- `render.yaml` — configuration de déploiement automatique, cache long sur les assets statiques
- `.gitignore` — fichiers système à exclure du repo

## 7. Ce qui est déjà pleinement fonctionnel dans ce prototype

- Lecture des cours avec déverrouillage réel du Sas de Triage
- Verrouillage effectif des sujets tant que le cours n'est pas lu
- Atelier de saignage en 3 étapes avec sauvegarde de chaque brouillon
- Analyse anti-banalisation en temps réel avec score et correction ligne par ligne
- Un sujet ne peut être marqué "saigné" sans avoir complété les 3 étapes
- Statistiques de progression par matière, calculées automatiquement
- Alarmes configurables, notifications navigateur réelles, persistance des préférences
- Installation PWA complète (manifest + service worker + cache offline)
