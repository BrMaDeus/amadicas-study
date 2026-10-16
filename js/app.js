/* =========================================================
   AMADICAS STUDY — APP
   Autenticação, inicialização e controle de sessão
   ========================================================= */

let appInitialized = false;
let activeUserId = null;
let handlingUserId = null;

/* =========================================================
   SESSÃO AUTENTICADA
   ========================================================= */

async function handleAuthenticatedSession(sessionOrResult) {
  const session = sessionOrResult?.session || sessionOrResult;
  const userId = session?.user?.id;

  if (!userId) {
    activeUserId = null;
    renderAuthScreen();
    return;
  }

  // Evita inicializações repetidas para a mesma conta.
  if (appInitialized && activeUserId === userId) {
    return;
  }

  // Evita duas inicializações simultâneas da mesma conta.
  if (handlingUserId === userId) {
    return;
  }

  handlingUserId = userId;

  try {
    // Primeiro carrega os dados da conta autenticada.
    // Nenhum dado antigo do navegador é importado automaticamente.
    await initializeUserDatabase(userId);

    activeUserId = userId;

    const authScreen = document.getElementById("authScreen");
    const app = document.getElementById("app");

    if (!app) {
      throw new Error("Não foi possível encontrar a aplicação.");
    }

    if (authScreen) {
      authScreen.hidden = true;
      authScreen.innerHTML = "";
    }

    app.hidden = false;

    // Configura os eventos da interface apenas uma vez.
    if (!appInitialized) {
      loadTheme();
      loadSidebarState();
      setupSidebarBackdrop();

      document.querySelectorAll("[data-theme-toggle]").forEach(button => {
        button.addEventListener("click", toggleTheme);
      });

      setupNavigation();
      addAccountButton();

      appInitialized = true;
    }

    // Sempre começa no dashboard após entrar na conta.
    renderPage("dashboard");

  } catch (error) {
    console.error("Erro ao carregar a conta:", error);

    activeUserId = null;

    const app = document.getElementById("app");
    if (app) app.hidden = true;

    renderAuthScreen();

    if (typeof setAuthMessage === "function") {
      setAuthMessage(
        "Não foi possível carregar seus dados. Verifique sua conexão e tente entrar novamente.",
        true
      );
    }

    throw error;

  } finally {
    if (handlingUserId === userId) {
      handlingUserId = null;
    }
  }
}

/* =========================================================
   BOTÃO DE SAÍDA
   ========================================================= */

function addAccountButton() {
  const bottom = document.querySelector(".sidebar-bottom");

  if (!bottom || document.getElementById("accountSignOut")) {
    return;
  }

  const button = document.createElement("button");

  button.id = "accountSignOut";
  button.type = "button";
  button.className = "side-action";
  button.textContent = "⇥ Sair da conta";

  button.addEventListener("click", async () => {
    if (!activeUserId) return;

    if (!confirm("Deseja sair da sua conta?")) {
      return;
    }

    button.disabled = true;

    try {
      // Aguarda os salvamentos já enfileirados antes de sair.
      if (typeof cloudSaveQueue !== "undefined") {
        await cloudSaveQueue;
      }

      await signOut();

      activeUserId = null;

      const app = document.getElementById("app");
      if (app) app.hidden = true;

      renderAuthScreen();

    } catch (error) {
      console.error("Erro ao sair da conta:", error);

      alert(
        "Não foi possível concluir a saída da conta. Tente novamente."
      );

      button.disabled = false;
    }
  });

  bottom.appendChild(button);
}

/* =========================================================
   INICIALIZAÇÃO
   ========================================================= */

document.addEventListener("DOMContentLoaded", async () => {
  const app = document.getElementById("app");

  if (app) {
    app.hidden = true;
  }

  try {
    if (
      typeof supabaseClient === "undefined" ||
      !supabaseClient
    ) {
      throw new Error(
        "A conexão com o Supabase não foi inicializada."
      );
    }

    const { data, error } =
      await supabaseClient.auth.getSession();

    if (error) throw error;

    if (data.session) {
      await handleAuthenticatedSession(data.session);
    } else {
      renderAuthScreen();
    }

  } catch (error) {
    console.error("Erro ao inicializar a aplicação:", error);

    renderAuthScreen();

    if (typeof setAuthMessage === "function") {
      setAuthMessage(
        "Não foi possível verificar sua sessão. Confira a conexão e tente novamente.",
        true
      );
    }
  }
});