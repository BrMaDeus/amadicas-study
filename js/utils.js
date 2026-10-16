/* =========================================================
   AMADICAS STUDY — UTILIDADES
   ========================================================= */


/* =========================================================
   DATE HELPERS
   ========================================================= */

function todayISO() {

  const date =
    new Date();

  const year =
    date.getFullYear();

  const month =
    String(
      date.getMonth() + 1
    ).padStart(
      2,
      "0"
    );

  const day =
    String(
      date.getDate()
    ).padStart(
      2,
      "0"
    );

  return `${year}-${month}-${day}`;

}


function parseLocalDate(
  iso
) {

  if (!iso) return null;

  const [
    year,
    month,
    day
  ] =
    iso
      .split("-")
      .map(Number);

  return new Date(
    year,
    month - 1,
    day
  );

}


function formatDate(
  iso
) {

  if (!iso) return "—";

  const date =
    parseLocalDate(
      iso
    );

  if (
    !date ||
    isNaN(
      date.getTime()
    )
  ) {

    return "—";

  }

  return date.toLocaleDateString(
    "pt-BR",
    {
      day: "2-digit",
      month: "2-digit"
    }
  );

}


function formatDateLong(
  iso
) {

  if (!iso) return "—";

  const date =
    parseLocalDate(
      iso
    );

  if (
    !date ||
    isNaN(
      date.getTime()
    )
  ) {

    return "—";

  }

  return date.toLocaleDateString(
    "pt-BR",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    }
  );

}


function addDays(
  iso,
  days
) {

  const date =
    parseLocalDate(
      iso
    );

  if (!date) return null;

  date.setDate(
    date.getDate() +
    days
  );

  const year =
    date.getFullYear();

  const month =
    String(
      date.getMonth() + 1
    ).padStart(
      2,
      "0"
    );

  const day =
    String(
      date.getDate()
    ).padStart(
      2,
      "0"
    );

  return `${year}-${month}-${day}`;

}


function dateStatus(
  iso
) {

  if (!iso) return "";

  const today =
    todayISO();

  if (
    iso < today
  ) {

    return "overdue";

  }

  if (
    iso === today
  ) {

    return "today";

  }

  return "future";

}


function daysDifference(
  from,
  to
) {

  const a =
    parseLocalDate(
      from
    );

  const b =
    parseLocalDate(
      to
    );

  return Math.round(
    (
      b - a
    ) / 86400000
  );

}


/* =========================================================
   ID
   ========================================================= */

function generateId() {

  return (
    Date.now().toString(36) +
    Math.random()
      .toString(36)
      .slice(2, 8)
  );

}


/* =========================================================
   AREA
   ========================================================= */

function areaClass(
  area
) {

  const classes = {

    GO: "go",

    CM: "clinica",

    PREV: "preventiva",

    PED: "pediatria",

    CIR: "cirurgia"

  };

  return (
    classes[area] ||
    "default"
  );

}


function areaHTML(
  area
) {

  const data =
    AREAS[area] ||
    AREAS.GO;

  return `

    <span
      class="area-tag area-badge area-${areaClass(area)}"
    >

      <span class="emoji">
        ${data.emoji}
      </span>

      ${escapeHTML(
        data.name
      )}

    </span>

  `;

}


/* =========================================================
   ESCAPE
   ========================================================= */

function escapeHTML(
  value
) {

  if (
    value === null ||
    value === undefined
  ) {

    return "";

  }

  return String(value)

    .replace(
      /&/g,
      "&amp;"
    )

    .replace(
      /</g,
      "&lt;"
    )

    .replace(
      />/g,
      "&gt;"
    )

    .replace(
      /"/g,
      "&quot;"
    )

    .replace(
      /'/g,
      "&#039;"
    );

}


function escapeAttribute(
  value
) {

  return escapeHTML(
    value
  );

}