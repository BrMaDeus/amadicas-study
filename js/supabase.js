
/* =========================================================
   AMADICAS STUDY — SUPABASE CONNECTION
   ========================================================= */

const SUPABASE_URL =
  "https://flysgrwjrverkbeenobw.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_WMdPGZDw24cq-Wrbbm1Yog_7gKOmfhJ";

let supabaseClient = null;

function initializeSupabase() {
  if (!window.supabase) {
    console.error(
      "Supabase JS não foi carregado."
    );

    return false;
  }

  if (supabaseClient) {
    return true;
  }

  supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
  );

  console.log(
    "Amadicas Study: conexão Supabase inicializada."
  );

  return true;
}
initializeSupabase();