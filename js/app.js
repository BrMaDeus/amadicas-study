/* =========================================================
   AMADICAS STUDY — APP
   ========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    loadTheme();

    loadSidebarState();

    setupSidebarBackdrop();

    document
      .querySelectorAll(
        "[data-theme-toggle]"
      )
      .forEach(
        button => {

          button.addEventListener(
            "click",
            toggleTheme
          );

        }
      );

    loadDatabase();

    setupNavigation();

    renderPage(
      "dashboard"
    );

  }
);