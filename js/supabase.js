
/* =========================================================
   AMADICAS STUDY — SUPABASE E AUTENTICAÇÃO
   ========================================================= */

const SUPABASE_URL =
  "https://flysgrwjrverkbeenobw.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_WMdPGZDw24cq-Wrbbm1Yog_7gKOmfhJ";

let supabaseClient = null;

/* =========================================================
   INICIALIZAÇÃO
   ========================================================= */

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

/* =========================================================
   AUTENTICAÇÃO
   ========================================================= */

// Criar conta
async function signUp(email, password) {
  if (!supabaseClient) {
    throw new Error("Supabase não foi inicializado.");
  }

  const { data, error } =
    await supabaseClient.auth.signUp({
      email: email.trim(),
      password
    });

  if (error) {
    throw error;
  }

  return data;
}

// Entrar
async function signIn(email, password) {
  if (!supabaseClient) {
    throw new Error("Supabase não foi inicializado.");
  }

  const { data, error } =
    await supabaseClient.auth.signInWithPassword({
      email: email.trim(),
      password
    });

  if (error) {
    throw error;
  }

  return data;
}

// Sair
async function signOut() {
  if (!supabaseClient) {
    throw new Error("Supabase não foi inicializado.");
  }

  const { error } =
    await supabaseClient.auth.signOut();

  if (error) {
    throw error;
  }
}

// Recuperar usuário da sessão atual
async function getCurrentUser() {
  if (!supabaseClient) {
    throw new Error("Supabase não foi inicializado.");
  }

  const { data, error } =
    await supabaseClient.auth.getUser();

  if (error) {
    throw error;
  }

  return data.user;
}

// Observar mudanças de autenticação
function onAuthStateChange(callback) {
  if (!supabaseClient) {
    throw new Error("Supabase não foi inicializado.");
  }

  return supabaseClient.auth.onAuthStateChange(
    (event, session) => {
      callback(event, session);
    }
  );
}

// Enviar e-mail para recuperação de senha
async function resetPassword(email) {
  if (!supabaseClient) {
    throw new Error("Supabase não foi inicializado.");
  }

  const { error } =
    await supabaseClient.auth.resetPasswordForEmail(
      email.trim(),
      {
        redirectTo: window.location.origin +
          window.location.pathname
      }
    );

  if (error) {
    throw error;
  }
}

/* =========================================================
   INICIALIZAR
   ========================================================= */

initializeSupabase();
