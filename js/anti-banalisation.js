/**
 * MOTEUR ANTI-BANALISATION
 * ------------------------
 * Prototype local (heuristique par dictionnaire + regex) qui tourne 100%
 * hors-ligne, sans clé API, sans dépendance externe — conforme à l'exigence
 * "bibliothèque autonome".
 *
 * Pour une V2 avec un vrai LLM (nuances contextuelles, cas non couverts par
 * le dictionnaire), voir js/llm-bridge.js et le README section 5 : il suffit
 * de brancher un appel à l'API Anthropic (ou toute API compatible) en
 * envoyant le texte_brut_utilisateur + le cours associé comme contexte, et
 * de lui demander un JSON structuré identique au format ci-dessous.
 */
const ANTI_BANALISATION = (() => {

  // Dictionnaire : expression banale -> { correction, article_vise, matieres concernées ou 'all' }
  const DICTIONNAIRE = [
    { motif: /\bil a tu[ée]\b/i, correction: 'il a porté volontairement atteinte à la vie d\'autrui (animus necandi caractérisé)', article: 'Homicide volontaire — art. pivot du Code pénal', matieres: ['droit_penal_special'] },
    { motif: /\bil a fait exprès\b/i, correction: 'l\'élément moral est caractérisé par le dol général', article: 'Théorie générale de l\'infraction', matieres: ['droit_penal_general', 'droit_penal_special'] },
    { motif: /\bles gens? (?:se sont|s\'est) mis(?:es)? d\'accord\b/i, correction: 'la rencontre des volontés caractérisant l\'échange des consentements s\'est opérée', article: 'Art. 1113 s. — formation du contrat', matieres: ['droit_civil'] },
    { motif: /\bil a le droit de\b/i, correction: 'il est titulaire du droit de / il peut valablement se prévaloir de', article: 'Qualification des droits subjectifs', matieres: ['all'] },
    { motif: /\ble patron a vir[ée] (?:le|la)\b/i, correction: 'l\'employeur a procédé au licenciement du salarié', article: 'Droit du licenciement — cause réelle et sérieuse', matieres: ['droit_social'] },
    { motif: /\bc\'est de sa faute\b/i, correction: 'la responsabilité lui incombe au titre du manquement caractérisé à l\'obligation qui pesait sur lui', article: 'Art. 1240-1241 — responsabilité délictuelle', matieres: ['droit_civil'] },
    { motif: /\bil doit payer\b/i, correction: 'il est débiteur de l\'obligation de réparation / il est tenu au paiement de dommages-intérêts', article: 'Régime de la réparation', matieres: ['droit_civil'] },
    { motif: /\bce n\'est pas juste\b/i, correction: 'cette solution se heurte au principe de [préciser le principe juridique visé]', article: '—', matieres: ['all'] },
    { motif: /\bla loi dit que\b/i, correction: 'il résulte des dispositions de l\'article [X] que', article: '—', matieres: ['all'] },
    { motif: /\bon peut pas\b/i, correction: 'il n\'est pas permis de / la loi prohibe', article: '—', matieres: ['all'] },
    { motif: /\bil y a un probl[eè]me\b/i, correction: 'se pose la question de savoir si / une difficulté juridique surgit quant à', article: '—', matieres: ['all'] },
    { motif: /\bcar c\'est comme [çc]a\b/i, correction: 'en application du principe selon lequel', article: '—', matieres: ['all'] },
    { motif: /\bles juges? doivent être indépendants pour être justes\b/i, correction: 'l\'indépendance institutionnelle et fonctionnelle du juge constitue une garantie structurelle du procès équitable', article: 'Art. 6§1 CEDH — tribunal indépendant et impartial', matieres: ['culture_generale'] },
    { motif: /\bl\'entreprise (?:a|avait) le droit de virer\b/i, correction: 'l\'employeur dispose du pouvoir disciplinaire lui permettant de rompre le contrat pour cause réelle et sérieuse', article: 'Code du travail — licenciement disciplinaire', matieres: ['droit_social'] },
    { motif: /\btout le monde sait que\b/i, correction: 'il est de principe constant que / la doctrine majoritaire retient que', article: '—', matieres: ['all'] },
    { motif: /\ben gros\b/i, correction: '(à supprimer — aucune valeur en rédaction juridique)', article: '—', matieres: ['all'] },
    { motif: /\bdonc du coup\b/i, correction: 'il en résulte que / il s\'ensuit que', article: '—', matieres: ['all'] },
    { motif: /\bpour faire simple\b/i, correction: '(à supprimer — un magistrat ne simplifie pas, il qualifie)', article: '—', matieres: ['all'] },
  ];

  // Marqueurs valorisants — présence de connecteurs et structure de syllogisme
  const MARQUEURS_RIGUEUR = [
    /il (?:en )?résulte que/i, /il ressort de/i, /en application de l'article/i,
    /au sens de l'article/i, /il convient de (?:relever|souligner|distinguer)/i,
    /en l'espèce/i, /attendu que/i, /dès lors que/i, /il s'ensuit que/i,
    /la majeure|la mineure|en conclusion/i, /conformément à/i
  ];

  function analyser(texte, matiere) {
    const trouvailles = [];
    DICTIONNAIRE.forEach(entry => {
      if (entry.matieres.includes('all') || entry.matieres.includes(matiere)) {
        const match = texte.match(entry.motif);
        if (match) {
          trouvailles.push({
            terme: match[0],
            correction: entry.correction,
            article_vise: entry.article
          });
        }
      }
    });

    // Score de rigorisme : base 100, pénalité par banalisation, bonus par marqueur de rigueur
    const nbMots = texte.trim().split(/\s+/).filter(Boolean).length || 1;
    const densiteBanalisation = trouvailles.length / Math.max(nbMots / 40, 1); // banalisations pour 40 mots
    let score = 100 - densiteBanalisation * 18;

    const nbMarqueurs = MARQUEURS_RIGUEUR.filter(rx => rx.test(texte)).length;
    score += Math.min(nbMarqueurs * 4, 20);

    // Pénalité longueur insuffisante — un syllogisme ne tient pas en 20 mots
    if (nbMots < 40) score -= 25;

    score = Math.max(0, Math.min(100, Math.round(score * 10) / 10));

    return { trouvailles, score, nbMots, nbMarqueurs };
  }

  function verdictCoach(score) {
    if (score >= 85) return { ton: 'positif', texte: 'Correct. C\'est le niveau qu\'on garde, pas celui dont on se contente.' };
    if (score >= 65) return { ton: 'neutre', texte: 'Passable. Mais "passable" n\'a jamais fait admettre personne. On corrige et on recommence.' };
    if (score >= 40) return { ton: 'severe', texte: 'Insuffisant. Trop de mots journalistiques, pas assez de qualification. Reprends chaque terme signalé.' };
    return { ton: 'critique', texte: 'Inacceptable. Ce texte ne passerait pas le premier tri d\'un jury. On retourne au cours et on réécrit intégralement.' };
  }

  return { analyser, verdictCoach };
})();
