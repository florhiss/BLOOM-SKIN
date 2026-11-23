import "./Recommandations.css";

const PRODUITS = {
  nettoyant: { nom: "Gel nettoyant doux", type: "Nettoyant" },
  hydratant: { nom: "Crème hydratante", type: "Hydratant" },
  solaire: { nom: "Protection solaire SPF 50", type: "Protection" },
  niacinamide: { nom: "Sérum niacinamide", type: "Sérum" },
  vitc: { nom: "Sérum vitamine C", type: "Sérum" },
  masque: { nom: "Masque hydratant", type: "Masque" },
};

const moyenne = (liste) =>
  liste.length ? liste.reduce((a, b) => a + b, 0) / liste.length : null;

const fmt = (n) => n.toFixed(1).replace(".", ",");

function analyser(entrees) {
  const limite = new Date();
  limite.setDate(limite.getDate() - 13);
  const debut = limite.toISOString().slice(0, 10);

  const recentes = Object.entries(entrees)
    .filter(([date]) => date >= debut)
    .map(([, e]) => e);

  if (recentes.length < 3) return null;

  const etatMoyen = moyenne(recentes.map((e) => e.etat));
  const sommeilMoyen = moyenne(recentes.map((e) => e.sommeil));
  const stressMoyen = moyenne(recentes.map((e) => e.stress));
  const joursBoutons = recentes.filter((e) => e.boutons).length;

  const conseils = [];
  const produits = new Set();

  // Règle 1 : sommeil
  const courtes = recentes.filter((e) => e.sommeil < 6.5);
  const longues = recentes.filter((e) => e.sommeil >= 7);
  if (courtes.length >= 2 && longues.length >= 2) {
    const ecart = moyenne(longues.map((e) => e.etat)) - moyenne(courtes.map((e) => e.etat));
    if (ecart >= 0.7) {
      conseils.push({
        titre: "Ton sommeil influence ta peau",
        texte: `Les jours après une nuit courte, ta peau est notée ${fmt(
          moyenne(courtes.map((e) => e.etat))
        )}/5 en moyenne, contre ${fmt(
          moyenne(longues.map((e) => e.etat))
        )}/5 après 7 h ou plus. Essaie de te coucher un peu plus tôt cette semaine.`,
      });
      produits.add("hydratant");
    }
  }

  // Règle 2 : stress
  const stresses = recentes.filter((e) => e.stress >= 4);
  const calmes = recentes.filter((e) => e.stress <= 2);
  if (stresses.length >= 2 && calmes.length >= 2) {
    const ecart = moyenne(calmes.map((e) => e.etat)) - moyenne(stresses.map((e) => e.etat));
    if (ecart >= 0.7) {
      conseils.push({
        titre: "Le stress se voit sur ta peau",
        texte: "Les jours très stressés, ta peau est moins belle. Une routine douce et un masque hydratant le soir peuvent t'aider à te détendre.",
      });
      produits.add("masque");
    }
  }

  // Règle 3 : boutons
  if (joursBoutons >= 3) {
    conseils.push({
      titre: "Des poussées de boutons reviennent",
      texte: `Tu as noté ${joursBoutons} jours avec des boutons sur cette période. Garde un nettoyant doux, évite de tester plusieurs nouveaux produits en même temps et note chaque nouveauté dans ton journal.`,
    });
    produits.add("nettoyant");
    produits.add("niacinamide");
  }

  // Règle 4 : peau irritée
  if (etatMoyen <= 2.5) {
    conseils.push({
      titre: "Ta peau a besoin de douceur",
      texte: "Ta peau est souvent difficile ou irritée. Mets en pause les actifs forts (comme la vitamine C) et concentre-toi sur nettoyer doucement et hydrater.",
    });
    produits.add("nettoyant");
    produits.add("hydratant");
    produits.add("masque");
  }

  // Règle 5 : peau en forme
  if (etatMoyen >= 4 && joursBoutons <= 1) {
    conseils.push({
      titre: "Ta routine fonctionne bien",
      texte: "Ta peau est belle depuis plusieurs jours. Garde la même routine et n'ajoute pas trop de nouveautés d'un coup.",
    });
    produits.add("vitc");
  }

  // Conseil de base : protection solaire
  produits.add("solaire");
  if (conseils.length === 0) {
    conseils.push({
      titre: "Rien d'alarmant pour le moment",
      texte: "Ton journal ne montre pas de problème particulier. Continue à le remplir : plus il y a de jours, plus les conseils seront précis.",
    });
    produits.add("hydratant");
  }

  return {
    nb: recentes.length,
    etatMoyen,
    sommeilMoyen,
    stressMoyen,
    conseils,
    produits: [...produits].slice(0, 4).map((k) => PRODUITS[k]),
  };
}

export default function Recommandations({ entrees }) {
  const analyse = analyser(entrees);

  return (
    <section className="reco">
      <h2>Mes conseils</h2>

      {!analyse && (
        <p className="reco-vide">
          Enregistre au moins 3 jours dans ton journal pour recevoir des conseils personnalisés.
        </p>
      )}

      {analyse && (
        <>
          <p className="reco-periode">Basé sur {analyse.nb} jours des 14 derniers jours.</p>

          <dl className="reco-chiffres">
            <div>
              <dt>Peau</dt>
              <dd>{fmt(analyse.etatMoyen)} / 5</dd>
            </div>
            <div>
              <dt>Sommeil</dt>
              <dd>{fmt(analyse.sommeilMoyen)} h</dd>
            </div>
            <div>
              <dt>Stress</dt>
              <dd>{fmt(analyse.stressMoyen)} / 5</dd>
            </div>
          </dl>

          <ul className="reco-conseils">
            {analyse.conseils.map((c) => (
              <li key={c.titre}>
                <strong>{c.titre}</strong>
                <p>{c.texte}</p>
              </li>
            ))}
          </ul>

          <h3>Produits à regarder</h3>
          <ul className="reco-produits">
            {analyse.produits.map((p) => (
              <li key={p.nom}>
                <span>{p.nom}</span>
                <small>{p.type}</small>
              </li>
            ))}
          </ul>

          <p className="reco-avertissement">
            Ces conseils sont généraux et ne remplacent pas l'avis d'un dermatologue. Si un problème persiste, consulte un professionnel.
          </p>
        </>
      )}
    </section>
  );
}
