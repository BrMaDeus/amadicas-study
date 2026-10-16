
/* =========================================================
   AMADICAS STUDY — REVISÕES
   ========================================================= */

function renderReviews(
  container
) {

  container.innerHTML = `

    <div class="page-header">

      <div
        class="page-title"
        data-page="revisoes"
      >

        <h1>
          Revisões
        </h1>

        <p>
          D1 → D7 → D30 → D60.
          A próxima data é calculada a partir
          da data planejada da revisão.
        </p>

      </div>

      <div class="page-actions">

        <button
          class="btn btn-primary"
          onclick="openSubjectModal()"
        >
          + Novo assunto
        </button>

      </div>

    </div>


    <div class="filter-bar">

      <div class="search-box">

        <span>⌕</span>

        <input
          type="text"
          id="reviewSearch"
          placeholder="Pesquisar assunto..."
          oninput="filterReviewTable()"
        >

      </div>


      <select
        id="reviewArea"
        class="filter-select"
        onchange="filterReviewTable()"
      >

        <option value="all">
          Todas as grandes áreas
        </option>

        ${AREA_ORDER
          .map(
            area => `

              <option value="${area}">
                ${AREAS[area].emoji}
                ${AREAS[area].name}
              </option>

            `
          )
          .join("")}

      </select>


      <select
        id="reviewStatus"
        class="filter-select"
        onchange="filterReviewTable()"
      >

        <option value="all">
          Todos
        </option>

        <option value="today">
          Revisar hoje
        </option>

        <option value="overdue">
          Atrasadas
        </option>

        <option value="upcoming">
          Próximas
        </option>

        <option value="completed">
          Concluídas
        </option>

      </select>

    </div>


    <div class="table-wrapper">

      <table class="review-table">

        <thead>

          <tr>

            <th>Grande área</th>
            <th>Assunto</th>
            <th>1º estudo</th>
            <th>D1</th>
            <th>D7</th>
            <th>D30</th>
            <th>D60</th>
            <th>Próxima</th>
            <th></th>

          </tr>

        </thead>


        <tbody id="reviewTableBody">

          ${buildReviewRows(
            db.subjects
          )}

        </tbody>

      </table>

    </div>

  `;

}


function buildReviewRows(
  subjects
) {

  if (!subjects.length) {

    return `

      <tr>

        <td colspan="9">

          <div class="empty-state">

            <div class="empty-icon">
              ✓
            </div>

            <strong>
              Nenhum assunto cadastrado
            </strong>

            <p>
              Comece adicionando seu primeiro assunto.
            </p>

          </div>

        </td>

      </tr>

    `;

  }

  return subjects
    .map(
      subject => `

        <tr
          data-subject-id="${subject.id}"
          data-area="${subject.area}"
          data-name="${escapeHTML(
            subject.name
          ).toLowerCase()}"
        >

          <td>
            ${areaHTML(
              subject.area
            )}
          </td>


          <td>

            <div class="subject-name">
              ${escapeHTML(
                subject.name
              )}
            </div>

            <div class="subject-meta">

              ${
                subject.history.length
              }

              registro${
                subject.history.length === 1
                  ? ""
                  : "s"
              }

            </div>

          </td>


          <td>

            <span class="first-date">
              ${formatDate(
                subject.firstStudy
              )}
            </span>

          </td>


          ${buildReviewCell(
            subject,
            "d1"
          )}

          ${buildReviewCell(
            subject,
            "d7"
          )}

          ${buildReviewCell(
            subject,
            "d30"
          )}

          ${buildReviewCell(
            subject,
            "d60"
          )}


          <td>
            ${buildNextReview(
              subject
            )}
          </td>


          <td>

            <div class="row-actions">

              <button
                class="icon-btn"
                title="Histórico"
                onclick="showHistory('${subject.id}')"
              >
                ↺
              </button>


              <button
                class="icon-btn"
                title="Editar assunto"
                onclick="openSubjectModal('${subject.id}')"
              >
                ⋯
              </button>

            </div>

          </td>

        </tr>

      `
    )
    .join("");

}


function buildReviewCell(
  subject,
  stage
) {

  const review =
    subject.reviews[stage];

  if (!review) {

    return `<td>—</td>`;

  }

  if (review.completed) {

    return `

      <td>

        <div class="review-cell">

          <input
            type="checkbox"
            class="review-checkbox"
            checked
            onchange="
              undoReview(
                '${subject.id}',
                '${stage}'
              )
            "
          >


          <span class="review-date completed">

            ${formatDate(
              review.plannedDate || review.date
            )}

          </span>

        </div>

      </td>

    `;

  }

  if (!review.plannedDate) {

    return `

      <td>

        <div class="review-cell">

          <input
            type="checkbox"
            class="review-checkbox"
            disabled
          >

          <span class="review-date empty">
            —
          </span>

        </div>

      </td>

    `;

  }

  const status =
    dateStatus(
      review.plannedDate
    );

  return `

    <td>

      <div class="review-cell ${status}">

        <input
          type="checkbox"
          class="review-checkbox"
          onchange="
            completeReview(
              '${subject.id}',
              '${stage}'
            )
          "
        >

        <span
          class="review-date clickable"
          onclick="
            editPlannedDate(
              '${subject.id}',
              '${stage}'
            )
          "
          title="Editar data planejada"
        >

          ${formatDate(
            review.plannedDate
          )}

        </span>

      </div>

    </td>

  `;

}


function buildNextReview(
  subject
) {

  const next =
    getNextReview(
      subject
    );

  if (!next) {

    return `

      <span class="next-review done">
        ✓ Concluído
      </span>

    `;

  }

  const status =
    dateStatus(
      next.date
    );

  let label = "";

  if (
    status === "overdue"
  ) {

    label =
      `Atrasada · ${formatDate(
        next.date
      )}`;

  } else if (
    status === "today"
  ) {

    label =
      `Hoje · ${STAGE_LABELS[
        next.stage
      ]}`;

  } else {

    label =
      `${STAGE_LABELS[
        next.stage
      ]} · ${formatDate(
        next.date
      )}`;

  }

  return `

    <span
      class="next-review ${status}"
    >
      ${label}
    </span>

  `;

}


function getNextReview(
  subject
) {

  for (
    const stage of STAGES
  ) {

    const review =
      subject.reviews[
        stage
      ];

    if (
      review &&
      !review.completed &&
      review.plannedDate
    ) {

      return {

        stage,

        date:
          review.plannedDate

      };

    }

  }

  return null;

}


/* =========================================================
   CONCLUIR REVISÃO
   ========================================================= */

function completeReview(
  subjectId,
  stage
) {

  const subject =
    db.subjects.find(
      item =>
        item.id === subjectId
    );

  if (!subject) return;

  const review =
    subject.reviews[stage];

  if (
    !review ||
    review.completed ||
    !review.plannedDate
  ) {

    return;

  }

  /*
    A data em que o usuário realmente marcou
    a revisão continua sendo registrada no
    histórico e no campo "date".

    Porém, a próxima revisão usa como referência
    a data planejada da revisão atual.
  */

  const actualDate =
    todayISO();

  const plannedDate =
    review.plannedDate;

  const currentIndex =
    STAGES.indexOf(
      stage
    );

  review.completed =
    true;

  review.date =
    actualDate;

  subject.history.push({

    id:
      generateId(),

    type:
      "revisão",

    stage,

    date:
      actualDate,

    createdAt:
      new Date().toISOString()

  });

  if (
    currentIndex <
    STAGES.length - 1
  ) {

    const nextStage =
      STAGES[
        currentIndex + 1
      ];

    const nextReview =
      subject.reviews[
        nextStage
      ];

    nextReview.completed =
      false;

    nextReview.date =
      null;

    nextReview.plannedDate =
      addDays(
        plannedDate,
        STAGE_INTERVALS[
          nextStage
        ]
      );

  }

  saveDatabase();

  const currentPage =
    document
      .querySelector(
        ".nav-item.active"
      )
      ?.dataset.page ||
    "revisoes";

  renderPage(
    currentPage
  );

  showToast(
    `${STAGE_LABELS[
      stage
    ]} registrada!`
  );

}


/* =========================================================
   DESMARCAR REVISÃO
   ========================================================= */

function undoReview(
  subjectId,
  stage
) {

  const subject =
    db.subjects.find(
      item =>
        item.id === subjectId
    );

  if (!subject) return;

  const currentIndex =
    STAGES.indexOf(
      stage
    );

  if (
    currentIndex === -1
  ) {

    return;

  }

  const review =
    subject.reviews[
      stage
    ];

  if (
    !review ||
    !review.completed
  ) {

    return;

  }

  subject.history =
    subject.history.filter(
      item =>
        !(
          item.type === "revisão" &&
          item.stage === stage &&
          item.date === review.date
        )
    );

  for (
    let i = currentIndex;
    i < STAGES.length;
    i++
  ) {

    const currentStage =
      STAGES[i];

    subject.reviews[
      currentStage
    ].completed =
      false;

    subject.reviews[
      currentStage
    ].date =
      null;

    subject.reviews[
      currentStage
    ].plannedDate =
      null;

  }

  if (
    currentIndex === 0
  ) {

    subject.reviews.d1.plannedDate =
      addDays(
        subject.firstStudy,
        STAGE_INTERVALS.d1
      );

  } else {

    const previousStage =
      STAGES[
        currentIndex - 1
      ];

    const previousReview =
      subject.reviews[
        previousStage
      ];

    if (
      previousReview &&
      previousReview.completed &&
      (
        previousReview.plannedDate ||
        previousReview.date
      )
    ) {

      const referenceDate =
        previousReview.plannedDate ||
        previousReview.date;

      subject.reviews[
        stage
      ].plannedDate =
        addDays(
          referenceDate,
          STAGE_INTERVALS[
            stage
          ]
        );

    }

  }

  saveDatabase();

  const currentPage =
    document
      .querySelector(
        ".nav-item.active"
      )
      ?.dataset.page ||
    "revisoes";

  renderPage(
    currentPage
  );

  showToast(
    `${STAGE_LABELS[
      stage
    ]} desmarcada.`
  );

}


/* =========================================================
   EDITAR DATA PLANEJADA
   ========================================================= */

function editPlannedDate(
  subjectId,
  stage
) {

  const subject =
    db.subjects.find(
      item =>
        item.id === subjectId
    );

  if (!subject) return;

  const review =
    subject.reviews[stage];

  if (
    !review ||
    review.completed
  ) {

    return;

  }

  const current =
    review.plannedDate ||
    todayISO();

  document.getElementById(
    "modalRoot"
  ).innerHTML = `

    <div
      class="modal-backdrop"
      onclick="closeModal(event)"
    >

      <div
        class="modal"
        onclick="event.stopPropagation()"
      >

        <div class="modal-header">

          <h2>
            Editar data
          </h2>

          <button
            class="modal-close"
            onclick="closeModal()"
          >
            ×
          </button>

        </div>


        <div class="modal-body">

          <div
            style="
              margin-bottom:18px;
              font-size:14px;
              color:var(--text-muted);
            "
          >

            <strong>
              ${STAGE_LABELS[stage]}
            </strong>

            ·

            ${escapeHTML(
              subject.name
            )}

          </div>


          <div class="form-group">

            <label>
              Nova data planejada
            </label>

            <input
              id="plannedDateInput"
              class="form-control"
              type="date"
              value="${current}"
            >

          </div>


          <div
            style="
              margin-top:12px;
              font-size:12px;
              line-height:1.5;
              color:var(--text-muted);
            "
          >

            Essa alteração muda apenas a data planejada.
            A revisão só será registrada quando você marcar
            o checkbox.

          </div>

        </div>


        <div class="modal-footer">

          <button
            class="btn"
            onclick="closeModal()"
          >
            Cancelar
          </button>


          <button
            class="btn btn-primary"
            onclick="
              savePlannedDate(
                '${subject.id}',
                '${stage}'
              )
            "
          >
            Salvar data
          </button>

        </div>

      </div>

    </div>

  `;

}


function savePlannedDate(
  subjectId,
  stage
) {

  const subject =
    db.subjects.find(
      item =>
        item.id === subjectId
    );

  if (!subject) return;

  const input =
    document.getElementById(
      "plannedDateInput"
    );

  if (!input) return;

  const newDate =
    input.value;

  if (!newDate) {

    showToast(
      "Selecione uma data."
    );

    return;

  }

  const review =
    subject.reviews[
      stage
    ];

  if (!review) return;

  const oldDate =
    review.plannedDate;

  review.plannedDate =
    newDate;

  subject.history.push({

    id:
      generateId(),

    type:
      "alteração de data",

    stage,

    date:
      todayISO(),

    oldDate,

    newDate,

    createdAt:
      new Date().toISOString()

  });

  saveDatabase();

  closeModal();

  const currentPage =
    document
      .querySelector(
        ".nav-item.active"
      )
      ?.dataset.page ||
    "revisoes";

  renderPage(
    currentPage
  );

  showToast(
    `Data do ${STAGE_LABELS[
      stage
    ]} alterada.`
  );

}


function filterReviewTable() {

  const search =
    (
      document.getElementById(
        "reviewSearch"
      )?.value || ""
    )
      .toLowerCase()
      .trim();

  const area =
    document.getElementById(
      "reviewArea"
    )?.value ||
    "all";

  const status =
    document.getElementById(
      "reviewStatus"
    )?.value ||
    "all";

  document
    .querySelectorAll(
      "#reviewTableBody tr[data-subject-id]"
    )
    .forEach(
      row => {

        const subject =
          db.subjects.find(
            item =>
              item.id ===
              row.dataset.subjectId
          );

        if (!subject) return;

        let visible = true;

        if (
          search &&
          !subject.name
            .toLowerCase()
            .includes(search)
        ) {

          visible = false;

        }

        if (
          area !== "all" &&
          subject.area !== area
        ) {

          visible = false;

        }

        const next =
          getNextReview(
            subject
          );

        if (
          status === "today"
        ) {

          if (
            !next ||
            next.date !==
              todayISO()
          ) {

            visible = false;

          }

        }

        if (
          status === "overdue"
        ) {

          if (
            !next ||
            next.date >=
              todayISO()
          ) {

            visible = false;

          }

        }

        if (
          status === "upcoming"
        ) {

          if (
            !next ||
            next.date <=
              todayISO()
          ) {

            visible = false;

          }

        }

        if (
          status === "completed"
        ) {

          if (next) {

            visible = false;

          }

        }

        row.style.display =
          visible
            ? ""
            : "none";

      }
    );

}