/* =========================================================
   AMADICAS STUDY — DASHBOARD
   ========================================================= */

function renderDashboard(
  container
) {

  const total =
    db.subjects.length;

  const today =
    db.subjects.filter(
      subject => {

        const next =
          getNextReview(
            subject
          );

        return (
          next &&
          next.date ===
            todayISO()
        );

      }
    ).length;

  const overdue =
    db.subjects.filter(
      subject => {

        const next =
          getNextReview(
            subject
          );

        return (
          next &&
          next.date <
            todayISO()
        );

      }
    ).length;

  const completedReviews =
    db.subjects.reduce(
      (
        total,
        subject
      ) =>
        total +
        STAGES.filter(
          stage =>
            subject
              .reviews[
                stage
              ]
              ?.completed
        ).length,
      0
    );

  container.innerHTML = `

    <div class="page-header">

      <div
        class="page-title"
        data-page="dashboard"
      >

        <h1>
          Dashboard
        </h1>

        <p>
          Visão geral do seu ciclo de estudos.
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


    <div class="stats-grid">

      <div class="stat-card">

        <div class="stat-label">
          Assuntos
        </div>

        <div class="stat-number">
          ${total}
        </div>

        <div class="stat-description">
          cadastrados
        </div>

      </div>


      <div class="stat-card">

        <div class="stat-label">
          Revisar hoje
        </div>

        <div class="stat-number">
          ${today}
        </div>

        <div class="stat-description">
          revisões programadas
        </div>

      </div>


      <div class="stat-card">

        <div class="stat-label">
          Atrasadas
        </div>

        <div
          class="stat-number"
          style="${
            overdue
              ? "color:var(--red)"
              : ""
          }"
        >
          ${overdue}
        </div>

        <div class="stat-description">
          precisam de atenção
        </div>

      </div>


      <div class="stat-card">

        <div class="stat-label">
          Revisões feitas
        </div>

        <div class="stat-number">
          ${completedReviews}
        </div>

        <div class="stat-description">
          no histórico
        </div>

      </div>

    </div>


    <div class="dashboard-grid">

      ${buildDashboardAreaPerformance()}


      <div>

        ${buildOverdueReviews()}

        <div style="height:16px;"></div>

        ${buildUpcomingReviews()}

      </div>

    </div>

  `;

}


/* =========================================================
   DESEMPENHO POR GRANDE ÁREA
   ========================================================= */

function buildDashboardAreaPerformance() {

  const stats =
    calculateAreaStats();

  const hasData =
    AREA_ORDER.some(
      area =>
        stats[area]
          .questions > 0
    );

  if (!hasData) {

    return `

      <div class="panel">

        <div class="panel-title">

          <h3>
            Desempenho por grande área
          </h3>

          <span>
            questões
          </span>

        </div>


        <div class="empty-state">

          <strong>
            Ainda não há dados por área
          </strong>

          <p>
            Ao cadastrar uma prova, marque a opção
            de registrar o desempenho por grande área.
          </p>

        </div>

      </div>

    `;

  }

  return `

    <div class="panel">

      <div class="panel-title">

        <h3>
          Desempenho por grande área
        </h3>

        <span>
          acumulado
        </span>

      </div>


      <div class="area-chart">

        ${AREA_ORDER
          .map(
            area => {

              const item =
                stats[area];

              const hasAreaData =
                item.questions > 0;

              const percentage =
                item.percentage;

              return `

                <div
                  class="area-column"
                >

                  <div
                    class="area-percentage"
                  >

                    ${
                      hasAreaData
                        ? percentage.toFixed(1) + "%"
                        : "—"
                    }

                  </div>


                  <div
                    class="area-bar-container"
                    title="${
                      hasAreaData
                        ? `${item.correct} acertos de ${item.questions} questões`
                        : "Sem questões registradas"
                    }"
                  >

                    <div
                      class="area-bar-fill"
                      style="
                        height:${
                          hasAreaData
                            ? percentage
                            : 0
                        }%;
                      "
                    ></div>

                  </div>


                  <div
                    class="area-label"
                  >

                    <span class="area-emoji">
                      ${
                        AREAS[
                          area
                        ].emoji
                      }
                    </span>

                    <span>
                      ${
                        AREAS[
                          area
                        ].name
                      }
                    </span>

                  </div>


                  <div
                    style="
                      margin-top:6px;
                      font-size:11px;
                      color:var(--text-muted);
                      text-align:center;
                    "
                  >

                    ${
                      hasAreaData
                        ? `${item.correct}/${item.questions} questões`
                        : "Sem dados"
                    }

                  </div>

                </div>

              `;

            }
          )
          .join("")}

      </div>


      <div
        style="
          margin-top:16px;
          font-size:12px;
          color:var(--text-muted);
        "
      >

        Considera apenas as questões das provas
        com desempenho informado por grande área.

      </div>

    </div>

  `;

}


/* =========================================================
   REVISÕES ATRASADAS
   ========================================================= */

function buildOverdueReviews() {

  const today =
    todayISO();

  const overdue =
    db.subjects
      .map(
        subject => {

          const next =
            getNextReview(
              subject
            );

          if (
            !next ||
            next.date >= today
          ) {

            return null;

          }

          return {

            subject,

            next

          };

        }
      )
      .filter(Boolean)
      .sort(
        (a, b) =>
          a.next.date
            .localeCompare(
              b.next.date
            )
      )
      .slice(
        0,
        5
      );


  return `

    <div class="panel">

      <div class="panel-title">

        <h3>
          Revisões atrasadas
        </h3>

        <span
          style="
            color:var(--red);
          "
        >
          ${overdue.length}
        </span>

      </div>


      <div class="simple-list">

        ${
          overdue.length
            ? overdue
                .map(
                  item => {

                    const days =
                      daysDifference(
                        item.next.date,
                        today
                      );

                    return `

                      <div class="list-item">

                        <div
                          class="list-item-main"
                        >

                          <strong>
                            ${escapeHTML(
                              item.subject.name
                            )}
                          </strong>

                          <span>

                            ${
                              AREAS[
                                item.subject.area
                              ].emoji
                            }

                            ${
                              STAGE_LABELS[
                                item.next.stage
                              ]
                            }

                          </span>

                        </div>


                        <div
                          class="list-item-value"
                          style="
                            color:var(--red);
                          "
                        >

                          ${days} ${
                            days === 1
                              ? "dia"
                              : "dias"
                          }

                        </div>

                      </div>

                    `;

                  }
                )
                .join("")
            : `

              <div
                class="empty-state"
              >

                <strong>
                  Tudo em dia 🎉
                </strong>

                <p>
                  Nenhuma revisão está atrasada.
                </p>

              </div>

            `
        }

      </div>


      ${
        overdue.length >= 5
          ? `

            <div
              style="
                margin-top:12px;
                font-size:12px;
                color:var(--text-muted);
              "
            >

              Mostrando as 5 revisões mais antigas.

            </div>

          `
          : ""
      }

    </div>

  `;

}


/* =========================================================
   PRÓXIMAS REVISÕES
   ========================================================= */

function buildUpcomingReviews() {

  const today =
    todayISO();

  const upcoming =
    db.subjects
      .map(
        subject => {

          const next =
            getNextReview(
              subject
            );

          if (
            !next ||
            next.date <= today
          ) {

            return null;

          }

          return {

            subject,

            next

          };

        }
      )
      .filter(Boolean)
      .sort(
        (a, b) =>
          a.next.date
            .localeCompare(
              b.next.date
            )
      )
      .slice(
        0,
        5
      );


  return `

    <div class="panel">

      <div class="panel-title">

        <h3>
          Próximas revisões
        </h3>

        <span>
          futuras
        </span>

      </div>


      <div class="simple-list">

        ${
          upcoming.length
            ? upcoming
                .map(
                  item => `

                    <div class="list-item">

                      <div
                        class="list-item-main"
                      >

                        <strong>
                          ${escapeHTML(
                            item.subject.name
                          )}
                        </strong>

                        <span>

                          ${
                            AREAS[
                              item.subject.area
                            ].emoji
                          }

                          ${
                            STAGE_LABELS[
                              item.next.stage
                            ]
                          }

                        </span>

                      </div>


                      <div
                        class="list-item-value"
                      >

                        ${formatDate(
                          item.next.date
                        )}

                      </div>

                    </div>

                  `
                )
                .join("")
            : `

              <div
                class="empty-state"
              >

                <strong>
                  Nenhuma revisão futura
                </strong>

                <p>
                  Não há revisões programadas para os próximos dias.
                </p>

              </div>

            `
        }

      </div>


      ${
        upcoming.length >= 5
          ? `

            <div
              style="
                margin-top:12px;
                font-size:12px;
                color:var(--text-muted);
              "
            >

              Mostrando as 5 próximas revisões.

            </div>

          `
          : ""
      }

    </div>

  `;

}