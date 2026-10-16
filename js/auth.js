
/* =========================================================
   AMADICAS STUDY — AUTENTICAÇÃO
   ========================================================= */

let authMode = "login";

function renderAuthScreen() {
  const screen = document.getElementById("authScreen");
  if (!screen) return;

  screen.hidden = false;
  document.getElementById("app").hidden = true;

  screen.innerHTML = `
    <main class="auth-screen">
      <section class="auth-card">
        <div class="auth-brand">
          <div class="brand-mark">A</div>
          <div>
            <strong>Amadicas</strong>
            <span>Study</span>
          </div>
        </div>

        <div class="auth-heading">
          <p class="auth-eyebrow">SEU ESPAÇO DE ESTUDOS</p>
          <h1 id="authTitle">Bem-vindo de volta!</h1>
          <p id="authDescription">
            Entre na sua conta para acessar seus estudos.
          </p>
        </div>

        <form id="authForm">
          <label for="authEmail">E-mail</label>
          <input id="authEmail" type="email"
            autocomplete="email" placeholder="seuemail@exemplo.com" required>

          <label for="authPassword">Senha</label>
          <input id="authPassword" type="password"
            autocomplete="current-password" minlength="6"
            placeholder="Sua senha" required>

          <button id="authSubmit" class="btn btn-primary auth-submit"
            type="submit">Entrar</button>
        </form>

        <p id="authMessage" class="auth-message" role="status"></p>

        <div class="auth-links">
          <button id="authForgot" type="button">Esqueci minha senha</button>
          <p>
            <span id="authSwitchText">Ainda não tem conta?</span>
            <button id="authSwitch" type="button">Criar conta</button>
          </p>
        </div>
      </section>
    </main>
  `;

  setupAuthForm();
}

function setAuthMessage(text, isError = false) {
  const message = document.getElementById("authMessage");
  if (!message) return;
  message.textContent = text;
  message.className = isError ? "auth-message error" : "auth-message";
}

function setupAuthForm() {
  const form = document.getElementById("authForm");
  const switchButton = document.getElementById("authSwitch");

  switchButton.addEventListener("click", () => {
    authMode = authMode === "login" ? "signup" : "login";

    document.getElementById("authTitle").textContent =
      authMode === "login" ? "Bem-vindo de volta!" : "Crie sua conta";

    document.getElementById("authDescription").textContent =
      authMode === "login"
        ? "Entre na sua conta para acessar seus estudos."
        : "Cadastre-se para ter seu espaço de estudos.";

    document.getElementById("authPassword").autocomplete =
      authMode === "login" ? "current-password" : "new-password";

    document.getElementById("authSubmit").textContent =
      authMode === "login" ? "Entrar" : "Criar conta";

    document.getElementById("authSwitchText").textContent =
      authMode === "login" ? "Ainda não tem conta?" : "Já tem uma conta?";

    switchButton.textContent =
      authMode === "login" ? "Criar conta" : "Entrar";

    setAuthMessage("");
  });

  form.addEventListener("submit", async event => {
    event.preventDefault();

    const email = document.getElementById("authEmail").value.trim();
    const password = document.getElementById("authPassword").value;
    const button = document.getElementById("authSubmit");

    button.disabled = true;
    setAuthMessage("Aguarde...");

    try {
      if (authMode === "signup") {
        const result = await signUp(email, password);

        if (result.session) {
          setAuthMessage("Conta criada. Carregando seus estudos...");
          await handleAuthenticatedSession(result.session);
        } else {
          setAuthMessage(
            "Cadastro iniciado! Confirme seu e-mail pelo link enviado antes de entrar."
          );
        }
      } else {
        const result = await signIn(email, password);
        await handleAuthenticatedSession(result);
      }
    } catch (error) {
      console.error("Erro de autenticação:", error);
      setAuthMessage(getAuthErrorMessage(error), true);
    } finally {
      button.disabled = false;
    }
  });

  document.getElementById("authForgot").addEventListener("click", async () => {
    const email = document.getElementById("authEmail").value.trim();

    if (!email) {
      setAuthMessage("Digite seu e-mail primeiro.", true);
      document.getElementById("authEmail").focus();
      return;
    }

    try {
      await resetPassword(email);
      setAuthMessage(
        "Se o e-mail estiver cadastrado, você receberá instruções para recuperar a senha."
      );
    } catch (error) {
      setAuthMessage(getAuthErrorMessage(error), true);
    }
  });
}

function getAuthErrorMessage(error) {
  const message = (error?.message || "").toLowerCase();

  if (message.includes("invalid login credentials")) {
    return "E-mail ou senha incorretos.";
  }
  if (message.includes("email not confirmed")) {
    return "Confirme seu e-mail antes de entrar.";
  }
  if (message.includes("already registered")) {
    return "Este e-mail já possui uma conta. Tente entrar.";
  }
  if (message.includes("rate limit")) {
    return "Muitas tentativas. Aguarde um pouco e tente novamente.";
  }

  return error?.message || "Não foi possível concluir a operação.";
}
