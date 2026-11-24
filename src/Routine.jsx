import { useEffect, useState } from "react";
import "./Routine.css";
import { supabase } from "./supabaseClient";

const DEFAULTS = {
  matin: [
    { id: 1, nom: "Nettoyant", produit: "" },
    { id: 2, nom: "Sérum", produit: "" },
    { id: 3, nom: "Crème hydratante", produit: "" },
    { id: 4, nom: "Crème solaire", produit: "" },
  ],
  soir: [
    { id: 5, nom: "Démaquillant", produit: "" },
    { id: 6, nom: "Nettoyant", produit: "" },
    { id: 7, nom: "Soin ciblé", produit: "" },
    { id: 8, nom: "Crème de nuit", produit: "" },
  ],
};

const aujourdhui = () => new Date().toISOString().slice(0, 10);

// On ne garde que les 60 derniers jours pour que la sauvegarde reste légère.
function garderRecents(faits) {
  const limite = new Date();
  limite.setDate(limite.getDate() - 60);
  const debut = limite.toISOString().slice(0, 10);
  return Object.fromEntries(Object.entries(faits).filter(([date]) => date >= debut));
}

export default function Routine() {
  const [moment, setMoment] = useState("matin");
  const [routines, setRoutines] = useState(DEFAULTS);
  const [faits, setFaits] = useState({});
  const [nouvelle, setNouvelle] = useState("");
  const [pret, setPret] = useState(false);
  const [erreur, setErreur] = useState("");

  // Chargement depuis la base
  useEffect(() => {
    let actif = true;

    async function charger() {
      const { data, error } = await supabase.from("routines").select("etapes, faits").maybeSingle();
      if (!actif) return;
      if (error) {
        setErreur("Impossible de charger ta routine. Vérifie ta connexion.");
        return;
      }
      if (data?.etapes?.matin && data?.etapes?.soir) setRoutines(data.etapes);
      if (data?.faits) setFaits(data.faits);
      setPret(true);
    }

    charger();
    return () => {
      actif = false;
    };
  }, []);

  // Sauvegarde automatique, un court instant après chaque changement
  useEffect(() => {
    if (!pret) return;

    const minuteur = setTimeout(async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user.id;
      if (!userId) return;

      const { error } = await supabase
        .from("routines")
        .upsert({ user_id: userId, etapes: routines, faits: garderRecents(faits) }, { onConflict: "user_id" });

      setErreur(error ? "Sauvegarde impossible pour le moment." : "");
    }, 600);

    return () => clearTimeout(minuteur);
  }, [routines, faits, pret]);

  const jour = aujourdhui();
  const etapes = routines[moment];
  const cochees = faits[jour]?.[moment] ?? [];
  const progression = etapes.length
    ? Math.round((etapes.filter((e) => cochees.includes(e.id)).length / etapes.length) * 100)
    : 0;

  function basculer(id) {
    const maj = cochees.includes(id) ? cochees.filter((x) => x !== id) : [...cochees, id];
    setFaits({ ...faits, [jour]: { ...faits[jour], [moment]: maj } });
  }

  function ajouter(e) {
    e.preventDefault();
    const nom = nouvelle.trim();
    if (!nom) return;
    setRoutines({ ...routines, [moment]: [...etapes, { id: Date.now(), nom, produit: "" }] });
    setNouvelle("");
  }

  function supprimer(id) {
    setRoutines({ ...routines, [moment]: etapes.filter((e) => e.id !== id) });
  }

  function renommerProduit(id, produit) {
    setRoutines({
      ...routines,
      [moment]: etapes.map((e) => (e.id === id ? { ...e, produit } : e)),
    });
  }

  if (!pret && !erreur) {
    return (
      <section className="routine">
        <h1>Ma routine</h1>
        <p className="routine-vide">Chargement de ta routine…</p>
      </section>
    );
  }

  return (
    <section className="routine">
      <h1>Ma routine</h1>

      <div className="routine-onglets">
        {["matin", "soir"].map((m) => (
          <button
            key={m}
            className={m === moment ? "actif" : ""}
            onClick={() => setMoment(m)}
          >
            {m === "matin" ? "Matin" : "Soir"}
          </button>
        ))}
      </div>

      <div className="routine-barre" aria-label={`Progression : ${progression}%`}>
        <div className="routine-barre-remplie" style={{ width: `${progression}%` }} />
      </div>
      <p className="routine-progression">
        {progression === 100 ? "Routine terminée pour aujourd'hui" : `${progression}% fait aujourd'hui`}
      </p>

      {erreur && <p role="alert" style={{ color: "#9b1c1c" }}>{erreur}</p>}

      <ul className="routine-liste">
        {etapes.map((e) => (
          <li key={e.id} className={cochees.includes(e.id) ? "fait" : ""}>
            <label>
              <input
                type="checkbox"
                checked={cochees.includes(e.id)}
                onChange={() => basculer(e.id)}
              />
              <span>{e.nom}</span>
            </label>
            <input
              className="routine-produit"
              placeholder="Produit utilisé"
              value={e.produit}
              onChange={(ev) => renommerProduit(e.id, ev.target.value)}
            />
            <button className="routine-suppr" onClick={() => supprimer(e.id)} aria-label={`Supprimer ${e.nom}`}>
              ×
            </button>
          </li>
        ))}
      </ul>

      {etapes.length === 0 && <p className="routine-vide">Aucune étape. Ajoute la première ci-dessous.</p>}

      <form className="routine-ajout" onSubmit={ajouter}>
        <input
          value={nouvelle}
          onChange={(e) => setNouvelle(e.target.value)}
          placeholder="Ajouter une étape"
        />
        <button type="submit">Ajouter</button>
      </form>
    </section>
  );
}
