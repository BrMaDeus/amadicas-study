/* =========================================================
   AMADICAS STUDY — NAVEGAÇÃO
   ========================================================= */

function setupNavigation() {

  document
    .querySelectorAll(
      ".nav-item"
    )
    .forEach(
      button => {

        button.addEventListener(
          "click",
          () => {

            document
              .querySelectorAll(
                ".nav-item"
              )
              .forEach(
                item =>
                  item.classList.remove(
                    "active"
                  )
              );

            button.classList.add(
              "active"
            );

            renderPage(
              button.dataset.page
            );

          }
        );

      }
    );

}


function renderPage(page) {

  const container =
    document.getElementById(
      "pageContent"
    );

  if (!container) return;

  switch (page) {

    case "dashboard":

      renderDashboard(
        container
      );

      break;

    case "revisoes":

      renderReviews(
        container
      );

      break;

    case "assuntos":

      renderSubjects(
        container
      );

      break;

    case "simulados":

      renderTests(
        container
      );

      break;

    case "calendario":

      renderCalendar(
        container
      );

      break;

    default:

      renderDashboard(
        container
      );

  }

}