/* =========================================================
   AMADICAS STUDY — UI
   ========================================================= */


/* =========================================================
   MODAL
   ========================================================= */

function closeModal(
  event
) {

  if (
    event &&
    event.target !==
      event.currentTarget
  ) {

    return;

  }

  const modalRoot =
    document.getElementById(
      "modalRoot"
    );

  if (modalRoot) {

    modalRoot.innerHTML =
      "";

  }

}


/* =========================================================
   TOAST
   ========================================================= */

function showToast(
  message
) {

  const existing =
    document.querySelector(
      ".toast"
    );

  if (existing) {

    existing.remove();

  }

  const toast =
    document.createElement(
      "div"
    );

  toast.className =
    "toast";

  toast.textContent =
    message;

  document.body.appendChild(
    toast
  );

  setTimeout(
    () => {

      if (
        toast.parentNode
      ) {

        toast.remove();

      }

    },
    2800
  );

}