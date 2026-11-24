import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const cle = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// Reste à null si les variables manquent : l'app affiche alors un message clair
// au lieu d'une page blanche.
export const supabase = url && cle ? createClient(url, cle) : null;
