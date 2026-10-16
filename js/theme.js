/* =========================================================
   AMADICAS STUDY — TEMA
   ========================================================= */

function loadTheme() {

  const savedTheme =
    localStorage.getItem(
      THEME_STORAGE_KEY
    );

  const shouldUseDark =
    savedTheme === "dark";

  document.documentElement.classList.toggle(
    "dark",
    shouldUseDark
  );

  updateThemeButtons();

}


function toggleTheme() {

  const isDark =
    document.documentElement.classList.contains(
      "dark"
    );

  const newTheme =
    isDark
      ? "light"
      : "dark";

  document.documentElement.classList.toggle(
    "dark",
    newTheme === "dark"
  );

  localStorage.setItem(
    THEME_STORAGE_KEY,
    newTheme
  );

  updateThemeButtons();

}


function updateThemeButtons() {

  const isDark =
    document.documentElement.classList.contains(
      "dark"
    );

  document
    .querySelectorAll(
      "[data-theme-toggle]"
    )
    .forEach(
      button => {

        const icon =
          button.querySelector(
            ".theme-toggle-icon"
          );

        const text =
          button.querySelector(
            ".theme-toggle-text"
          );

        if (icon) {

          icon.textContent =
            isDark
              ? "☀"
              : "☾";

        }

        if (text) {

          text.textContent =
            isDark
              ? "Modo claro"
              : "Modo escuro";

        }

        button.setAttribute(
          "aria-label",
          isDark
            ? "Ativar modo claro"
            : "Ativar modo escuro"
        );

        button.setAttribute(
          "title",
          isDark
            ? "Ativar modo claro"
            : "Ativar modo escuro"
        );

      }
    );

}