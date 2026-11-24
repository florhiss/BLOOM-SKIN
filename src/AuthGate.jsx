import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import "./AuthGate.css";

function traduire(message) {
  const m = (message || "").toLowerCase();
  if (m.includes("invalid login")) return "Email ou mot de passe incorrect.";
  if (m.includes("already registered")) return "Un compte existe déjà avec cet email.";
  if (m.includes("at least 6")) return "Le mot de passe doit faire au moins 6 caractères.";
  if (m.includes("email not confirmed")) return "Confirme d'abord ton email avec le lien reçu.";
  if (m.includes("rate limit")) return "Trop d'essais. Réessaie dans quelques minutes.";
  return "Une erreur est survenue : " + message;
}

export default function AuthGate({ children }) {
  const [session, setSession] = useState(undefined);
  const [mode, setMode] = useState("connexion");
  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [erreur, setErreur] = useState("");
  const [info, setInfo] = useState("");
  const [envoi, setEnvoi] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = supabase.auth.onAuthStateChange((_evenement, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, []);

  async function valider(e) {
    e.preventDefault();
    setErreur("");
    setInfo("");
    setEnvoi(true);
    const identifiants = { email: email.trim(), password: motDePasse };
    const { data, error } =
      mode === "connexion"
        ? await supabase.auth.signInWithPassword(identifiants)
        : await supabase.auth.signUp(identifiants);
    setEnvoi(false);
    if (error) {
      setErreur(traduire(error.message));
      return;
    }
    if (mode === "inscription" && !data.session) {
      setInfo("Compte créé. Ouvre le lien de confirmation reçu par email, puis connecte-toi.");
    }
  }

  if (!supabase) {
    return (
      <main className="auth">
        <div className="auth-carte">
          <h1>Configuration manquante</h1>
          <p>
            Les variables VITE_SUPABASE_URL et VITE_SUPABASE_PUBLISHABLE_KEY ne sont pas définies.
            Ajoute-les dans le fichier .env.local (en local) ou dans les réglages de Vercel (en ligne).
          </p>
        </div>
      </main>
    );
  }

  if (session === undefined) {
    return (
      <main className="auth">
        <p className="auth-chargement">Chargement…</p>
      </main>
    );
  }

  if (session) {
    return (
      <>
        <div className="auth-barre">
          <span>{session.user.email}</span>
          <button onClick={() => supabase.auth.signOut()}>Se déconnecter</button>
        </div>
        {children}
      </>
    );
  }

  const inscription = mode === "inscription";

  return (
    <main className="auth">
      <div className="auth-carte">
        <h1>Bloom Skin</h1>
        <p className="auth-sous-titre">
          {inscription ? "Crée ton compte" : "Connecte-toi pour retrouver ton journal"}
        </p>

        <form onSubmit={valider}>
          <label>
            Email
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>

          <label>
            Mot de passe
            <input
              type="password"
              required
              minLength={6}
              autoComplete={inscription ? "new-password" : "current-password"}
              value={motDePasse}
              onChange={(e) => setMotDePasse(e.target.value)}
            />
            {inscription && <small>6 caractères minimum</small>}
          </label>

          {erreur && <p className="auth-erreur" role="alert">{erreur}</p>}
          {info && <p className="auth-info" role="status">{info}</p>}

          <button type="submit" className="auth-envoyer" disabled={envoi}>
            {envoi ? "Un instant…" : inscription ? "Créer mon compte" : "Se connecter"}
          </button>
        </form>

        <button
          type="button"
          className="auth-bascule"
          onClick={() => {
            setMode(inscription ? "connexion" : "inscription");
            setErreur("");
            setInfo("");
          }}
        >
          {inscription ? "J'ai déjà un compte" : "Pas encore de compte ? Inscris-toi"}
        </button>
      </div>
    </main>
  );
}
