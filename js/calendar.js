/* =========================================================
   AMADICAS STUDY — CALENDÁRIO
   ========================================================= */

function renderCalendar(
  container
) {

  const year =
    calendarDate.getFullYear();

  const month =
    calendarDate.getMonth();

  const monthName =
    calendarDate.toLocaleDateString(
      "pt-BR",
      {
        month: "long",
        year: "numeric"
      }
    );

  const firstDay =
    new Date(
      year,
      month,
      1
    ).getDay();

  const daysInMonth =
    new Date(
      year,
      month + 1,
      0
    ).getDate();

  let cells = "";

  const weekdays = [

    "Dom",
    "Seg",
    "Ter",
    "Qua",
    "Qui",
    "Sex",
    "Sáb"

  ];

  weekdays.forEach(
    day => {

      cells += `

        <div
          class="calendar-weekday"
        >
          ${day}
        </div>

      `;

    }
  );

  for (
    let i = 0;
    i < firstDay;
    i++
  ) {

    cells += `

      <div
        class="calendar-day"
      ></div>

    `;

  }

  for (
    let day = 1;
    day <= daysInMonth;
    day++
  ) {

    const iso =
      `${year}-${
        String(
          month + 1
        ).padStart(
          2,
          "0"
        )
      }-${
        String(day)
          .padStart(
            2,
            "0"
          )
      }`;

    const events =
      getCalendarEvents(
        iso
      );

    const isToday =
      iso === todayISO();

    cells += `

      <div
        class="calendar-day"
      >

        <div
          class="
            calendar-number
            ${
              isToday
                ? "today"
                : ""
            }
          "
        >
          ${day}
        </div>


        ${events
          .map(
            event => `

              <div
                class="calendar-event"
                title="${escapeAttribute(
                  event.name
                )}"
              >

                ${
                  STAGE_LABELS[
                    event.stage
                  ]
                }

                ·

                ${escapeHTML(
                  event.name
                )}

              </div>

            `
          )
          .join("")}

      </div>

    `;

  }

  container.innerHTML = `

    <div class="page-header">

      <div
        class="page-title"
        data-page="calendario"
      >

        <h1>
          Calendário
        </h1>

        <p>
          Visualização das revisões programadas.
        </p>

      </div>

    </div>


    <div class="calendar-header">

      <h2>
        ${monthName.charAt(0).toUpperCase() + monthName.slice(1)}
      </h2>


      <div class="calendar-actions">

        <button
          class="btn btn-small"
          onclick="changeMonth(-1)"
        >
          ←
        </button>


        <button
          class="btn btn-small"
          onclick="goToCurrentMonth()"
        >
          Hoje
        </button>


        <button
          class="btn btn-small"
          onclick="changeMonth(1)"
        >
          →
        </button>

      </div>

    </div>


    <div class="calendar-grid">

      ${cells}

    </div>

  `;

}


function getCalendarEvents(
  iso
) {

  const events = [];

  db.subjects.forEach(
    subject => {

      STAGES.forEach(
        stage => {

          const review =
            subject.reviews[
              stage
            ];

          if (
            review &&
            !review.completed &&
            review.plannedDate ===
              iso
          ) {

            events.push({

              name:
                subject.name,

              stage

            });

          }

        }
      );

    }
  );

  return events;

}


function changeMonth(
  delta
) {

  calendarDate.setMonth(
    calendarDate.getMonth() +
    delta
  );

  renderCalendar(
    document.getElementById(
      "pageContent"
    )
  );

}


function goToCurrentMonth() {

  calendarDate =
    new Date();

  renderCalendar(
    document.getElementById(
      "pageContent"
    )
  );

}