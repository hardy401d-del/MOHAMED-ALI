// Table `subjects` — Le Sas de Triage. Seed initial (2-3 sujets par matière active).
const SUBJECTS_SEED = [
  {
    id: 's-dc-01', matiere: 'droit_civil', course_id: 'c-dc-01',
    enonce_sujet: 'Monsieur A propose par écrit à Madame B de lui vendre son véhicule pour 8 000 000 Ar, offre valable « jusqu\'à la fin du mois ». Le 25, Madame B répond qu\'elle accepte, mais pour 7 000 000 Ar. Le 27, elle se ravise et accepte finalement les 8 000 000 Ar. Le contrat est-il formé ?',
    type_exercice: 'cas_pratique', statut: 'a_faire', niveau_difficulte: 2
  },
  {
    id: 's-dc-02', matiere: 'droit_civil', course_id: 'c-dc-02',
    enonce_sujet: 'Dissertation : « La faute est-elle encore le fondement nécessaire de la responsabilité civile ? »',
    type_exercice: 'dissertation', statut: 'a_faire', niveau_difficulte: 3
  },
  {
    id: 's-pg-01', matiere: 'droit_penal_general', course_id: 'c-pg-01',
    enonce_sujet: 'Dissertation : « L\'élément moral, pierre angulaire de la répression pénale ? »',
    type_exercice: 'dissertation', statut: 'a_faire', niveau_difficulte: 3
  },
  {
    id: 's-ps-01', matiere: 'droit_penal_special', course_id: 'c-ps-01',
    enonce_sujet: 'X, lors d\'une altercation, porte un unique coup de poing à Y qui chute, se cogne la tête et décède des suites du traumatisme crânien. X sera-t-il poursuivi pour homicide volontaire ?',
    type_exercice: 'cas_pratique', statut: 'a_faire', niveau_difficulte: 2
  },
  {
    id: 's-cg-01', matiere: 'culture_generale', course_id: 'c-cg-01',
    enonce_sujet: 'Dissertation : « Juger au nom du peuple : l\'indépendance du juge est-elle une garantie ou un privilège ? »',
    type_exercice: 'dissertation', statut: 'a_faire', niveau_difficulte: 3
  },
  {
    id: 's-soc-01', matiere: 'droit_social', course_id: 'c-soc-01',
    enonce_sujet: 'Un salarié est licencié après avoir été surpris à consulter ses réseaux sociaux pendant les heures de travail à trois reprises en un mois, malgré un avertissement écrit. Le licenciement pour faute grave est-il fondé ?',
    type_exercice: 'cas_pratique', statut: 'a_faire', niveau_difficulte: 1
  }
];
