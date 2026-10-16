/* =========================================================
   AMADICAS STUDY — ASSUNTOS
   ========================================================= */

function renderSubjects(
  container
) {

  container.innerHTML = `

    <div class="page-header">

      <div
        class="page-title"
        data-page="assuntos"
      >

        <h1>
          Assuntos
        </h1>

        <p>
          Todos os assuntos cadastrados no seu ciclo de estudos.
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


    <div class="content-grid">

      ${
        db.subjects.length

          ? db.subjects
              .map(
                subject => `

                  <div class="data-card">

                    ${areaHTML(
                      subject.area
                    )}


                    <h3
                      style="margin-top:12px;"
                    >
                      ${escapeHTML(
                        subject.name
                      )}
                    </h3>


                    <p>
                      Primeiro estudo:
                      ${formatDateLong(
                        subject.firstStudy
                      )}
                    </p>


                    <div
                      class="data-card-footer"
                    >

                      <span class="data-tag">
                        ${getProgressLabel(
                          subject
                        )}
                      </span>


                      <button
                        class="btn btn-small"
                        onclick="
                          openSubjectModal(
                            '${subject.id}'
                          )
                        "
                      >
                        Editar
                      </button>

                    </div>

                  </div>

                `
              )
              .join("")

          : `

              <div class="data-card">

                <h3>
                  Nenhum assunto
                </h3>

                <p>
                  Adicione assuntos para começar
                  seu ciclo de revisões.
                </p>

              </div>

            `
      }

    </div>

  `;

}


function getProgressLabel(
  subject
) {

  const completed =
    STAGES.filter(
      stage =>
        subject.reviews[
          stage
        ]?.completed
    ).length;

  return `${completed}/4 revisões`;

}


function openSubjectModal(
  subjectId = null
) {

  const subject =
    subjectId
      ? db.subjects.find(
          item =>
            item.id === subjectId
        )
      : null;

  const editing =
    Boolean(subject);

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
            ${
              editing
                ? "Editar assunto"
                : "Novo assunto"
            }
          </h2>


          <button
            class="modal-close"
            onclick="closeModal()"
          >
            ×
          </button>

        </div>


        <div class="modal-body">

          <div class="form-grid">

            <div
              class="
                form-group
                full
              "
            >

              <label>
                Assunto
              </label>


              <input
                id="subjectName"
                class="form-control"
                type="text"
                placeholder="Ex.: Pré-eclâmpsia"
                value="${
                  editing
                    ? escapeAttribute(
                        subject.name
                      )
                    : ""
                }"
              >

            </div>


            <div class="form-group">

              <label>
                Grande área
              </label>


              <select
                id="subjectArea"
                class="form-control"
              >

                ${AREA_ORDER
                  .map(
                    area => `

                      <option
                        value="${area}"
                        ${
                          editing &&
                          subject.area ===
                            area
                            ? "selected"
                            : ""
                        }
                      >

                        ${
                          AREAS[
                            area
                          ].emoji
                        }

                        ${
                          AREAS[
                            area
                          ].name
                        }

                      </option>

                    `
                  )
                  .join("")}

              </select>

            </div>


            <div class="form-group">

              <label>
                Primeiro estudo
              </label>


              <input
                id="subjectFirstStudy"
                class="form-control"
                type="date"
                value="${
                  editing
                    ? subject.firstStudy
                    : todayISO()
                }"
              >

            </div>

          </div>

        </div>


        <div class="modal-footer">

          ${
            editing
              ? `

                <button
                  class="btn btn-danger"
                  onclick="
                    deleteSubject(
                      '${subject.id}'
                    )
                  "
                >
                  Excluir
                </button>

              `
              : ""
          }


          <button
            class="btn"
            onclick="closeModal()"
          >
            Cancelar
          </button>


          <button
            class="btn btn-primary"
            onclick="${
              editing
                ? `saveSubject('${subject.id}')`
                : "saveSubject()"
            }"
          >

            ${
              editing
                ? "Salvar alterações"
                : "Adicionar assunto"
            }

          </button>

        </div>

      </div>

    </div>

  `;

}


function saveSubject(
  subjectId = null
) {

  const name =
    document
      .getElementById(
        "subjectName"
      )
      .value
      .trim();

  const area =
    document
      .getElementById(
        "subjectArea"
      )
      .value;

  const firstStudy =
    document
      .getElementById(
        "subjectFirstStudy"
      )
      .value;

  if (!name) {

    alert(
      "Digite o nome do assunto."
    );

    return;

  }

  if (!firstStudy) {

    alert(
      "Selecione a data do primeiro estudo."
    );

    return;

  }

  if (subjectId) {

    const subject =
      db.subjects.find(
        item =>
          item.id === subjectId
      );

    if (!subject) return;

    subject.name =
      name;

    subject.area =
      area;

    saveDatabase();

    closeModal();

    showToast(
      "Assunto atualizado."
    );

  } else {

    const subject =
      createEmptySubject(
        name,
        area,
        firstStudy
      );

    db.subjects.push(
      subject
    );

    saveDatabase();

    closeModal();

    showToast(
      "Assunto adicionado."
    );

  }

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

}


function deleteSubject(
  subjectId
) {

  const subject =
    db.subjects.find(
      item =>
        item.id === subjectId
    );

  if (!subject) return;

  const confirmed =
    confirm(
      `Excluir "${subject.name}"? Esta ação não pode ser desfeita.`
    );

  if (!confirmed) return;

  db.subjects =
    db.subjects.filter(
      item =>
        item.id !== subjectId
    );

  saveDatabase();

  closeModal();

  showToast(
    "Assunto excluído."
  );

  renderPage(
    "assuntos"
  );

}


function showHistory(
  subjectId
) {

  const subject =
    db.subjects.find(
      item =>
        item.id === subjectId
    );

  if (!subject) return;

  const history =
    [...subject.history]
      .reverse();

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
            Histórico
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
            style="margin-bottom:16px;"
          >

            ${areaHTML(
              subject.area
            )}


            <div
              style="
                margin-top:9px;
                font-size:14px;
                font-weight:600;
              "
            >

              ${escapeHTML(
                subject.name
              )}

            </div>

          </div>


          ${
            history.length

              ? `

                <div class="history-list">

                  ${history
                    .map(
                      item => {

                        if (
                          item.type ===
                          "revisão"
                        ) {

                          return `

                            <div
                              class="history-item"
                            >

                              <div
                                class="history-dot"
                              ></div>


                              <div
                                class="history-content"
                              >

                                <strong>

                                  ${
                                    STAGE_LABELS[
                                      item.stage
                                    ]
                                  }

                                  realizada

                                </strong>


                                <span>

                                  ${formatDateLong(
                                    item.date
                                  )}

                                </span>

                              </div>

                            </div>

                          `;

                        }

                        if (
                          item.type ===
                          "alteração de data"
                        ) {

                          return `

                            <div
                              class="history-item"
                            >

                              <div
                                class="history-dot"
                                style="
                                  background:#bd7417;
                                "
                              ></div>


                              <div
                                class="history-content"
                              >

                                <strong>

                                  Data do

                                  ${
                                    STAGE_LABELS[
                                      item.stage
                                    ]
                                  }

                                  alterada

                                </strong>


                                <span>

                                  ${formatDate(
                                    item.oldDate
                                  )}

                                  →

                                  ${formatDate(
                                    item.newDate
                                  )}

                                </span>

                              </div>

                            </div>

                          `;

                        }

                        return "";

                      }
                    )
                    .join("")}

                </div>

              `

              : `

                <div class="empty-state">

                  <div
                    class="empty-icon"
                  >
                    ↺
                  </div>


                  <strong>
                    Nenhum registro ainda
                  </strong>


                  <p>
                    O histórico aparecerá conforme
                    você realizar as revisões.
                  </p>

                </div>

              `
          }

        </div>

      </div>

    </div>

  `;

}