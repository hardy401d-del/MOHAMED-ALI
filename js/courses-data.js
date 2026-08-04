// Table `courses` — Bibliothèque interne. Contenu de démarrage (seed).
// En production : remplacer par un fetch Supabase `select * from courses`.
const COURSES_SEED = [
  {
    id: 'c-dc-01',
    matiere: 'droit_civil',
    titre: 'La formation du contrat — de l\'offre à l\'échange des consentements',
    contenu_cours: `
<h4>1. Le socle légal</h4>
<p>Depuis l'ordonnance de réforme du droit des obligations (transposée dans les codes civils d'inspiration française, dont celui de Madagascar), le contrat se définit comme un accord de volontés destiné à créer, modifier, transmettre ou éteindre des obligations. La formation suppose la rencontre d'une offre et d'une acceptation.</p>
<h4>2. L'offre (la pollicitation)</h4>
<p>L'offre doit être ferme, précise et extériorisée. Une offre imprécise n'est qu'une simple invitation à entrer en pourparlers — distinction cardinale que tout candidat doit maîtriser sous peine de disqualification immédiate en cas pratique.</p>
<ul>
  <li><b>Ferme</b> : traduit la volonté définitive de l'auteur d'être lié en cas d'acceptation.</li>
  <li><b>Précise</b> : contient les éléments essentiels du contrat (chose, prix).</li>
</ul>
<h4>3. L'acceptation et le moment de la formation</h4>
<p>L'acceptation doit être pure et simple. Toute acceptation modifiant l'offre constitue une contre-offre qui anéantit l'offre initiale. Entre absents, la théorie de la réception prévaut : le contrat est formé au moment où l'acceptation parvient à l'offrant, non au moment de son émission.</p>
<h4>4. La qualification exigée en copie</h4>
<p>Ne jamais écrire « les deux personnes se sont mises d'accord ». Le magistrat qualifie : « la rencontre des volontés caractérisant l'échange des consentements s'est opérée à la date de réception de l'acceptation par le pollicitant ».</p>
`,
    notions_cles: ['Pollicitation', 'Contre-offre', 'Théorie de la réception', 'Consentement', 'Éléments essentiels du contrat'],
    jurisprudence_associee: ['Cass. civ. 3e, 20 mai 2009 — révocation de l\'offre avant expiration du délai'],
    articles_pivots: ['Art. 1101 et s. C. civ. (obligations)', 'Art. 1113 à 1122 C. civ. (offre et acceptation)']
  },
  {
    id: 'c-dc-02',
    matiere: 'droit_civil',
    titre: 'La responsabilité civile délictuelle — le triptyque faute / dommage / lien de causalité',
    contenu_cours: `
<h4>1. Les trois conditions cumulatives</h4>
<p>La responsabilité civile délictuelle repose sur trois éléments dont l'absence d'un seul fait échouer toute la démonstration : la faute, le dommage, et le lien de causalité entre les deux.</p>
<h4>2. La faute</h4>
<p>Appréciée in abstracto, par référence au comportement d'une personne raisonnable placée dans les mêmes circonstances externes. Le candidat doit distinguer faute d'imprudence, de négligence, et manquement à une obligation légale ou réglementaire.</p>
<h4>3. Le dommage réparable</h4>
<p>Doit être certain, direct et légitime. Un dommage éventuel ou hypothétique n'ouvre pas droit à réparation — sauf perte de chance, dont l'indemnisation est proportionnelle à la probabilité perdue, jamais à l'intégralité du préjudice final.</p>
<h4>4. Le lien de causalité</h4>
<p>Les théories concurrentes (équivalence des conditions / causalité adéquate) doivent être maîtrisées pour trancher les cas de causes multiples ou de causes étrangères exonératoires (force majeure, fait du tiers, fait de la victime).</p>
<h4>5. Le réflexe du magistrat</h4>
<p>Jamais « la personne est responsable parce qu'elle a fait une erreur ». Toujours : « le manquement caractérisé à l'obligation générale de prudence constitue une faute au sens de l'article pivot, dont il résulte un dommage certain, en lien de causalité direct et immédiat ».</p>
`,
    notions_cles: ['Faute in abstracto', 'Dommage certain', 'Perte de chance', 'Causalité adéquate', 'Cause exonératoire'],
    jurisprudence_associee: ['Cass. civ. 2e, 27 mars 2003 — appréciation objective de la faute'],
    articles_pivots: ['Art. 1240-1241 C. civ. (ex art. 1382-1383) — responsabilité du fait personnel']
  },
  {
    id: 'c-pg-01',
    matiere: 'droit_penal_general',
    titre: 'L\'élément légal, matériel et moral de l\'infraction',
    contenu_cours: `
<h4>1. Le principe de légalité criminelle</h4>
<p>Nullum crimen, nulla poena sine lege. Aucune infraction ni peine sans texte préexistant. C'est le socle de tout raisonnement pénal — un magistrat qui l'oublie commet une faute professionnelle grave.</p>
<h4>2. L'élément matériel</h4>
<p>L'infraction suppose un comportement extériorisé : action ou omission (pour les infractions d'omission expressément prévues). La simple pensée criminelle, non extériorisée, échappe au droit pénal — « cogitationis poenam nemo patitur ».</p>
<h4>3. L'élément moral</h4>
<p>Distinction fondamentale entre le dol général (conscience et volonté de commettre l'acte prohibé), le dol spécial (intention d'atteindre un résultat précis exigé par certains textes), et la faute non intentionnelle (imprudence, négligence, mise en danger délibérée).</p>
<h4>4. Qualification exigée</h4>
<p>Ne jamais écrire « il l'a fait exprès ». Écrire : « l'élément moral est caractérisé par le dol général, l'auteur ayant agi en pleine conscience de l'illicéité de son comportement et avec la volonté d'en réaliser les éléments constitutifs ».</p>
`,
    notions_cles: ['Légalité criminelle', 'Dol général', 'Dol spécial', 'Élément matériel', 'Infraction par omission'],
    jurisprudence_associee: ['Principe constant de la doctrine pénaliste classique (Garraud, Merle et Vitu)'],
    articles_pivots: ['Art. 1er C. pén. — principe de légalité', 'Art. 121-3 (référence comparatiste France) — intention']
  },
  {
    id: 'c-ps-01',
    matiere: 'droit_penal_special',
    titre: 'L\'homicide volontaire et ses circonstances aggravantes',
    contenu_cours: `
<h4>1. Définition et éléments constitutifs</h4>
<p>L'homicide volontaire suppose la réunion de trois éléments : un être humain vivant au moment des faits, un acte de violence ayant entraîné la mort, et l'intention homicide (animus necandi) — volonté de donner la mort, distincte de la simple volonté de porter des coups.</p>
<h4>2. La distinction cardinale avec les coups mortels</h4>
<p>Le point le plus piégeux du programme : distinguer l'homicide volontaire (intention de tuer) des violences ayant entraîné la mort sans intention de la donner (intention de blesser, décès non recherché). La qualification dépend de la preuve de l'animus necandi, souvent déduite des circonstances objectives (arme utilisée, zone visée, réitération des coups).</p>
<h4>3. Les circonstances aggravantes classiques</h4>
<ul>
  <li>Préméditation (guet-apens, préparation)</li>
  <li>Qualité de la victime (mineur, ascendant, personne vulnérable)</li>
  <li>Concours avec un autre crime (vol, viol)</li>
</ul>
<h4>4. Le réflexe rédactionnel du magistrat</h4>
<p>Jamais « il a tué la victime ». Toujours : « l'auteur a porté volontairement atteinte à la vie d'autrui, l'animus necandi étant caractérisé par [éléments de fait], constituant ainsi le crime d'homicide volontaire au sens de l'article pivot ».</p>
`,
    notions_cles: ['Animus necandi', 'Préméditation', 'Coups mortels sans intention de tuer', 'Circonstances aggravantes'],
    jurisprudence_associee: ['Jurisprudence constante sur la preuve par déduction de l\'intention homicide'],
    articles_pivots: ['Art. 295 et s. C. pén. — homicide volontaire et ses aggravations']
  },
  {
    id: 'c-cg-01',
    matiere: 'culture_generale',
    titre: 'L\'indépendance de la magistrature — principe et garanties',
    contenu_cours: `
<h4>1. Un principe à double dimension</h4>
<p>L'indépendance de la magistrature se décline en indépendance institutionnelle (vis-à-vis du pouvoir exécutif et législatif) et en indépendance fonctionnelle (le magistrat du siège n'est soumis, dans l'exercice de sa fonction juridictionnelle, qu'à la loi).</p>
<h4>2. Les garanties statutaires</h4>
<p>Inamovibilité des magistrats du siège, gestion de la carrière par un Conseil Supérieur de la Magistrature indépendant de l'exécutif, procédure disciplinaire encadrée. Ces garanties ne sont pas des privilèges corporatistes mais des conditions structurelles d'un procès équitable.</p>
<h4>3. Les menaces contemporaines</h4>
<p>Pressions budgétaires, nominations discrétionnaires, campagnes médiatiques sur des affaires en cours. Le candidat doit savoir articuler ces enjeux avec des exemples précis d'actualité juridique nationale et comparée, sans jamais tomber dans l'opinion militante — l'exercice attend une analyse, pas un plaidoyer.</p>
<h4>4. Le piège à éviter en dissertation</h4>
<p>Ne jamais réduire le sujet à « les juges doivent être indépendants pour être justes » — c'est une pétition de principe journalistique. Il faut articuler la distinction institution/fonction, discuter les garanties concrètes, et interroger leur effectivité réelle dans le contexte institutionnel visé par le sujet.</p>
`,
    notions_cles: ['Inamovibilité', 'Conseil Supérieur de la Magistrature', 'Indépendance institutionnelle vs fonctionnelle', 'Impartialité'],
    jurisprudence_associee: ['CEDH, jurisprudence constante sur l\'art. 6§1 — tribunal indépendant et impartial'],
    articles_pivots: ['Constitution — dispositions relatives au pouvoir judiciaire', 'Statut de la magistrature']
  },
  {
    id: 'c-soc-01',
    matiere: 'droit_social',
    titre: 'La rupture du contrat de travail — licenciement pour motif personnel',
    contenu_cours: `
<h4>1. L'exigence de cause réelle et sérieuse</h4>
<p>Tout licenciement pour motif personnel doit reposer sur une cause à la fois réelle (objective, vérifiable, non fictive) et sérieuse (suffisamment grave pour justifier la rupture, à l'exclusion des motifs futiles).</p>
<h4>2. La procédure — un formalisme protecteur</h4>
<p>Convocation à entretien préalable, respect du délai, notification motivée par écrit. Un vice de procédure n'entraîne pas nécessairement la nullité du licenciement mais ouvre droit à une indemnisation distincte de celle sanctionnant l'absence de cause réelle et sérieuse — distinction que les candidats confondent systématiquement, ce qui coûte cher en cas pratique.</p>
<h4>3. La faute grave et la faute lourde</h4>
<p>La faute grave rend impossible le maintien du salarié dans l'entreprise, même pendant le préavis. La faute lourde suppose en outre une intention de nuire à l'employeur — élément subjectif dont la preuve incombe à l'employeur.</p>
<h4>4. Le réflexe de qualification</h4>
<p>Jamais « le patron a viré le salarié parce qu'il n'était pas content ». Toujours : « la rupture est intervenue pour motif personnel ; il convient de vérifier si elle repose sur une cause réelle et sérieuse au sens de l'article pivot, à défaut de quoi elle expose l'employeur à une condamnation pour licenciement sans cause réelle et sérieuse ».</p>
`,
    notions_cles: ['Cause réelle et sérieuse', 'Faute grave', 'Faute lourde', 'Entretien préalable', 'Vice de procédure'],
    jurisprudence_associee: ['Jurisprudence sociale constante sur la charge de la preuve de la faute grave'],
    articles_pivots: ['Code du travail — dispositions sur le licenciement pour motif personnel']
  }
];
