import { useEffect, useState } from "react";
import "./Journal.css";
import Recommandations from "./Recommandations";

const ETATS = [
  { valeur: 1, emoji: "😣", label: "Difficile" },
  { valeur: 2, emoji: "😕", label: "Irritée" },
  { valeur: 3, emoji: "😐", label: "Correcte" },
  { valeur: 4, emoji: "🙂", label: "Belle" },
  { valeur: 5, emoji: "😍", label: "Éclatante" },
];

const jourISO = (d = new Date()) => d.toISOString().slice(0, 10);

function charger() {
  try {
    const v = localStorage.getItem("bloom-journal");
    return v ? JSON.parse(v) : {};
  } catch {
    return {};
  }
}

function formater(iso) {
  return new Date(iso + "T12:00:00").toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

export default function Journal() {
  const aujourdhui = jourISO();
  const [entrees, setEntrees] = useState(charger);
  const existante = entrees[aujourdhui];

  const [etat, setEtat] = useState(existante?.etat ?? 0);
  const [sommeil, setSommeil] = useState(existante?.sommeil ?? 7);
  const [stress, setStress] = useState(existante?.stress ?? 2);
  const [boutons, setBoutons] = useState(existante?.boutons ?? false);
  const [note, setNote] = useState(existante?.note ?? "");
  const [message, setMessage] = useState("");

  useEffect(() => {
    localStorage.setItem("bloom-journal", JSON.stringify(entrees));
  }, [entrees]);

  function enregistrer(e) {
    e.preventDefault();
    if (!etat) {
      setMessage("Choisis d'abord l'état de ta peau.");
      return;
    }
    setEntrees({
      ...entrees,
      [aujourdhui]: { etat, sommeil: Number(sommeil), stress: Number(stress), boutons, note: note.trim() },
    });
    setMessage(existante ? "Entrée du jour mise à jour." : "Entrée du jour enregistrée.");
  }

  function supprimer(date) {
    const copie = { ...entrees };
    delete copie[date];
    setEntrees(copie);
    if (date === aujourdhui) {
      setEtat(0);
      setNote("");
      setBoutons(false);
    }
  }

  const dates = Object.keys(entrees).sort().reverse();

  const quatorzeJours = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (13 - i));
    const iso = jourISO(d);
    return { iso, jour: d.getDate(), etat: entrees[iso]?.etat ?? 0 };
  });

  return (
    <section className="journal">
      <h1>Mon journal de peau</h1>
      <p className="journal-date">{formater(aujourdhui)}</p>

      <form onSubmit={enregistrer}>
        <fieldset>
          <legend>Comment est ta peau aujourd'hui ?</legend>
          <div className="journal-etats">
            {ETATS.map((x) => (
              <button
                type="button"
                key={x.valeur}
                className={etat === x.valeur ? "actif" : ""}
                onClick={() => setEtat(x.valeur)}
                aria-pressed={etat === x.valeur}
              >
                <span className="journal-emoji">{x.emoji}</span>
                <span>{x.label}</span>
              </button>
            ))}
          </div>
        </fieldset>

        <label className="journal-champ">
          Sommeil : <strong>{sommeil} h</strong>
          <input type="range" min="0" max="12" step="0.5" value={sommeil} onChange={(e) => setSommeil(e.target.value)} />
        </label>

        <label className="journal-champ">
          Stress : <strong>{stress} / 5</strong>
          <input type="range" min="1" max="5" value={stress} onChange={(e) => setStress(e.target.value)} />
        </label>

        <label className="journal-boutons">
          <input type="checkbox" checked={boutons} onChange={(e) => setBoutons(e.target.checked)} />
          Poussée de boutons aujourd'hui
        </label>

        <label className="journal-champ">
          Note (alimentation, nouveau produit, cycle…)
          <textarea rows="3" value={note} onChange={(e) => setNote(e.target.value)} />
        </label>

        <button type="submit" className="journal-envoyer">
          {existante ? "Mettre à jour" : "Enregistrer"}
        </button>
        {message && <p className="journal-message" role="status">{message}</p>}
      </form>

      <h2>14 derniers jours</h2>
      <div className="journal-graphique" role="img" aria-label="Évolution de l'état de la peau sur 14 jours">
        {quatorzeJours.map((j) => (
          <div key={j.iso} className="journal-colonne">
            <div className="journal-barre-zone">
              <div className="journal-barre" style={{ height: `${j.etat * 20}%` }} />
            </div>
            <span>{j.jour}</span>
          </div>
        ))}
      </div>

      <h2>Historique</h2>
      {dates.length === 0 && <p className="journal-vide">Aucune entrée. Enregistre ta première journée ci-dessus.</p>}
      <ul className="journal-historique">
        {dates.map((d) => {
          const x = entrees[d];
          const e = ETATS.find((s) => s.valeur === x.etat);
          return (
            <li key={d}>
              <div>
                <strong>{formater(d)}</strong>
                <p>
                  {e?.emoji} {e?.label} · {x.sommeil} h de sommeil · stress {x.stress}/5
                  {x.boutons ? " · boutons" : ""}
                </p>
                {x.note && <p className="journal-note">{x.note}</p>}
              </div>
              <button onClick={() => supprimer(d)} aria-label={`Supprimer l'entrée du ${formater(d)}`}>×</button>
            </li>
          );
        })}
      </ul>

      <Recommandations entrees={entrees} />
    </section>
  );
}
