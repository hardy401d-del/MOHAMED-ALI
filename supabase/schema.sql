-- ============================================================================
-- COACH MOHAMED ALI — SCHÉMA DE BASE DE DONNÉES
-- Cible : PostgreSQL 15+ / Supabase
-- Zéro impasse. Zéro donnée orpheline. Zéro incohérence.
-- ============================================================================

create extension if not exists "uuid-ossp";
create extension if not exists pgcrypto;

-- ----------------------------------------------------------------------------
-- ENUMS — on verrouille les valeurs possibles, pas de string libre qui pourrit
-- ----------------------------------------------------------------------------
create type matiere_enum as enum (
  'culture_generale',
  'droit_civil',
  'droit_penal_general',
  'droit_penal_special',
  'droit_social',
  'droit_commercial',
  'institutions_publiques',
  'procedure_civile',
  'procedure_penale',
  'ppsi_vpp'
);

create type type_exercice_enum as enum ('dissertation', 'cas_pratique', 'commentaire', 'note_synthese');
create type statut_sujet_enum as enum ('a_faire', 'en_cours', 'saigne');
create type severite_alarme_enum as enum ('info', 'rappel', 'sommation');

-- ----------------------------------------------------------------------------
-- TABLE : profiles (extension de auth.users — un candidat = une forteresse)
-- ----------------------------------------------------------------------------
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  pseudo text not null,
  date_concours date,
  heure_reveil time default '05:30',
  objectif_quotidien_minutes int default 180,
  created_at timestamptz default now()
);

-- ----------------------------------------------------------------------------
-- TABLE : courses — Le Moteur Pédagogique Interne
-- ----------------------------------------------------------------------------
create table courses (
  id uuid primary key default uuid_generate_v4(),
  matiere matiere_enum not null,
  titre text not null,
  contenu_cours text not null,              -- markdown : cours magistral complet
  notions_cles text[] not null default '{}',
  jurisprudence_associee jsonb default '[]', -- [{ "reference": "...", "resume": "...", "portee": "..." }]
  articles_pivots text[] default '{}',
  niveau_exigence int default 3 check (niveau_exigence between 1 and 5),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_courses_matiere on courses(matiere);

-- ----------------------------------------------------------------------------
-- TABLE : subjects — Le Sas de Triage ("Zéro Impasse")
-- ----------------------------------------------------------------------------
create table subjects (
  id uuid primary key default uuid_generate_v4(),
  course_id uuid references courses(id) on delete set null,
  matiere matiere_enum not null,
  enonce_sujet text not null,
  type_exercice type_exercice_enum not null,
  difficulte int default 3 check (difficulte between 1 and 5),
  elements_attendus text[] default '{}',     -- points de passage obligés du plan
  statut statut_sujet_enum not null default 'a_faire',
  created_at timestamptz default now()
);

create index idx_subjects_statut on subjects(statut);
create index idx_subjects_matiere on subjects(matiere);

-- ----------------------------------------------------------------------------
-- TABLE : submissions — les copies du candidat, brutes puis corrigées
-- ----------------------------------------------------------------------------
create table submissions (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid not null references profiles(id) on delete cascade,
  sujet_id uuid not null references subjects(id) on delete cascade,
  texte_brut_utilisateur text not null,
  texte_corrige_magistrature text,           -- retour du moteur anti-banalisation
  occurrences_banalisation jsonb default '[]', -- [{ "expression_faible": "...", "correction": "...", "regle": "..." }]
  score_rigorisme int check (score_rigorisme between 0 and 100),
  temps_passe_secondes int,
  created_at timestamptz default now()
);

create index idx_submissions_profile on submissions(profile_id);
create index idx_submissions_sujet on submissions(sujet_id);

-- ----------------------------------------------------------------------------
-- TABLE : performance_stats — le tableau de bord de la progression
-- ----------------------------------------------------------------------------
create table performance_stats (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid not null references profiles(id) on delete cascade,
  matiere matiere_enum not null,
  sujets_manges int default 0,
  score_rigorisme_moyen numeric(5,2) default 0,
  serie_jours_consecutifs int default 0,
  derniere_session timestamptz,
  updated_at timestamptz default now(),
  unique(profile_id, matiere)
);

-- ----------------------------------------------------------------------------
-- TABLE : alarms — Discipline de fer / notifications programmées
-- ----------------------------------------------------------------------------
create table alarms (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid not null references profiles(id) on delete cascade,
  heure time not null,
  jours_semaine int[] not null default '{1,2,3,4,5,6,7}', -- 1=lundi ... 7=dimanche
  message text not null,
  severite severite_alarme_enum default 'rappel',
  active boolean default true,
  created_at timestamptz default now()
);

-- ============================================================================
-- TRIGGERS — automatisation de la rigueur (personne ne triche avec le système)
-- ============================================================================

-- Recalcule performance_stats après chaque submission corrigée
create or replace function fn_update_performance_stats()
returns trigger as $$
begin
  if new.score_rigorisme is not null then
    insert into performance_stats (profile_id, matiere, sujets_manges, score_rigorisme_moyen, derniere_session)
    select
      new.profile_id,
      s.matiere,
      1,
      new.score_rigorisme,
      now()
    from subjects s where s.id = new.sujet_id
    on conflict (profile_id, matiere) do update
    set
      sujets_manges = performance_stats.sujets_manges + 1,
      score_rigorisme_moyen = round(
        ((performance_stats.score_rigorisme_moyen * performance_stats.sujets_manges) + new.score_rigorisme)
        / (performance_stats.sujets_manges + 1), 2
      ),
      derniere_session = now(),
      updated_at = now();
  end if;
  return new;
end;
$$ language plpgsql;

create trigger trg_update_performance_stats
after insert or update of score_rigorisme on submissions
for each row execute function fn_update_performance_stats();

-- Verrouille le sujet en "saigne" uniquement si score_rigorisme >= seuil (80)
create or replace function fn_lock_subject_status()
returns trigger as $$
begin
  if new.score_rigorisme is not null and new.score_rigorisme >= 80 then
    update subjects set statut = 'saigne' where id = new.sujet_id;
  elsif new.score_rigorisme is not null then
    update subjects set statut = 'en_cours' where id = new.sujet_id and statut = 'a_faire';
  end if;
  return new;
end;
$$ language plpgsql;

create trigger trg_lock_subject_status
after insert or update of score_rigorisme on submissions
for each row execute function fn_lock_subject_status();

-- ============================================================================
-- ROW LEVEL SECURITY — chaque candidat est seul dans sa forteresse
-- ============================================================================
alter table profiles enable row level security;
alter table submissions enable row level security;
alter table performance_stats enable row level security;
alter table alarms enable row level security;
-- courses et subjects restent en lecture publique (bibliothèque commune)
alter table courses enable row level security;
alter table subjects enable row level security;

create policy "lecture_courses_public" on courses for select using (true);
create policy "lecture_subjects_public" on subjects for select using (true);

create policy "profile_owner_only" on profiles
  for all using (auth.uid() = id);

create policy "submissions_owner_only" on submissions
  for all using (auth.uid() = profile_id);

create policy "stats_owner_only" on performance_stats
  for all using (auth.uid() = profile_id);

create policy "alarms_owner_only" on alarms
  for all using (auth.uid() = profile_id);

-- ============================================================================
-- SEED MINIMAL — un exemple par matière pour amorcer le prototype
-- ============================================================================
insert into courses (matiere, titre, contenu_cours, notions_cles, articles_pivots, jurisprudence_associee) values
(
  'droit_civil',
  'La formation du contrat : consentement et vices',
  '## I. Le principe du consentement libre et éclairé
Le contrat suppose la rencontre de deux volontés exemptes de vices...
## II. Les vices du consentement
### A. L''erreur
### B. Le dol
### C. La violence',
  array['consentement', 'vice du consentement', 'erreur substantielle', 'dol', 'violence économique'],
  array['Art. 1108 et s. Code Civil malgache', 'Art. 1109-1116'],
  '[{"reference":"Cass. Civ, arrêt de principe sur le dol","resume":"Le dol suppose des manoeuvres frauduleuses déterminantes du consentement","portee":"Charge de la preuve sur le demandeur"}]'::jsonb
);

insert into subjects (matiere, enonce_sujet, type_exercice, difficulte, elements_attendus) values
(
  'droit_civil',
  'Le silence peut-il constituer un dol ?',
  'dissertation',
  4,
  array['Qualification de la réticence dolosive', 'Obligation précontractuelle d''information', 'Distinction avec la simple réticence non fautive', 'Sanctions : nullité relative + dommages-intérêts']
);
