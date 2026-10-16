/* =========================================================
   AMADICAS STUDY — SIDEBAR
   ========================================================= */

function setSidebarCollapsed(
  collapsed,
  save = true
) {

  const app =
    document.getElementById(
      "app"
    );

  const button =
    document.getElementById(
      "sidebarToggle"
    );

  if (!app) return;

  app.classList.toggle(
    "sidebar-collapsed",
    collapsed
  );

  if (button) {

    button.textContent = "☰";

    button.setAttribute(
      "aria-expanded",
      String(!collapsed)
    );

    button.setAttribute(
      "aria-label",
      collapsed
        ? "Abrir menu"
        : "Fechar menu"
    );

    button.setAttribute(
      "title",
      collapsed
        ? "Abrir menu"
        : "Fechar menu"
    );

  }

  if (save) {

    localStorage.setItem(
      SIDEBAR_STORAGE_KEY,
      collapsed
        ? "collapsed"
        : "open"
    );

  }

  updateSidebarBackdrop();

}


function toggleSidebar() {

  const app =
    document.getElementById(
      "app"
    );

  if (!app) return;

  const collapsed =
    app.classList.contains(
      "sidebar-collapsed"
    );

  setSidebarCollapsed(
    !collapsed
  );

}


function loadSidebarState() {

  const saved =
    localStorage.getItem(
      SIDEBAR_STORAGE_KEY
    );

  const collapsed =
    saved === "collapsed" ||
    (
      saved === null &&
      window.innerWidth <= 800
    );

  setSidebarCollapsed(
    collapsed,
    false
  );

}


function setupSidebarBackdrop() {

  let backdrop =
    document.getElementById(
      "sidebarBackdrop"
    );

  if (!backdrop) {

    backdrop =
      document.createElement(
        "div"
      );

    backdrop.id =
      "sidebarBackdrop";

    document.body.appendChild(
      backdrop
    );

  }

  Object.assign(
    backdrop.style,
    {

      position: "fixed",

      top: "0",

      right: "0",

      bottom: "0",

      left: "0",

      background:
        "rgba(0,0,0,0.28)",

      zIndex: "90",

      display: "none",

      touchAction: "manipulation",

      cursor: "default"

    }
  );

  backdrop.addEventListener(
    "pointerdown",
    event => {

      event.preventDefault();

      event.stopPropagation();

      setSidebarCollapsed(
        true
      );

    }
  );

  const sidebar =
    document.querySelector(
      ".sidebar"
    );

  if (sidebar) {

    sidebar.style.zIndex =
      "100";

  }

  const button =
    document.getElementById(
      "sidebarToggle"
    );

  if (button) {

    button.style.zIndex =
      "110";

  }

  updateSidebarBackdrop();

}


function updateSidebarBackdrop() {

  const backdrop =
    document.getElementById(
      "sidebarBackdrop"
    );

  const app =
    document.getElementById(
      "app"
    );

  if (
    !backdrop ||
    !app
  ) {

    return;

  }

  const sidebar =
    document.querySelector(
      ".sidebar"
    );

  const button =
    document.getElementById(
      "sidebarToggle"
    );

  const isMobileOrTablet =
    window.innerWidth <= 1050;

  const isCollapsed =
    app.classList.contains(
      "sidebar-collapsed"
    );

  if (
    isMobileOrTablet &&
    !isCollapsed
  ) {

    backdrop.style.display =
      "block";

    if (sidebar) {

      sidebar.style.zIndex =
        "100";

    }

    if (button) {

      button.style.zIndex =
        "110";

    }

  } else {

    backdrop.style.display =
      "none";

  }

}


document.addEventListener(
  "pointerdown",
  function (event) {

    /*
      PC (>1050px):
      sidebar permanece fixa e não fecha
      ao clicar fora.

      Tablet/celular (<=1050px):
      clicar fora fecha a sidebar.
    */

    if (
      window.innerWidth > 1050
    ) {

      return;

    }

    const app =
      document.getElementById(
        "app"
      );

    const sidebar =
      document.querySelector(
        ".sidebar"
      );

    const toggle =
      document.getElementById(
        "sidebarToggle"
      );

    if (
      !app ||
      !sidebar ||
      !toggle
    ) {

      return;

    }

    const isCollapsed =
      app.classList.contains(
        "sidebar-collapsed"
      );

    if (isCollapsed) {

      return;

    }

    if (
      toggle.contains(
        event.target
      )
    ) {

      return;

    }

    if (
      sidebar.contains(
        event.target
      )
    ) {

      return;

    }

    setSidebarCollapsed(
      true
    );

  }
);


window.addEventListener(
  "resize",
  updateSidebarBackdrop
);