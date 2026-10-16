/* =========================================================
   AMADICAS STUDY — STORAGE
   ========================================================= */


/* =========================================================
   DATABASE
   ========================================================= */

function loadDatabase() {

  try {

    const current =
      localStorage.getItem(
        STORAGE_KEY
      );

    if (current) {

      db =
        normalizeDatabase(
          JSON.parse(current)
        );

      saveDatabase();

      return;

    }

    const old =
      localStorage.getItem(
        "amadicas-study-v2"
      );

    if (old) {

      db =
        migrateOldDatabase(
          JSON.parse(old)
        );

      db =
        normalizeDatabase(db);

      saveDatabase();

      return;

    }

  } catch (error) {

    console.error(
      "Erro ao carregar banco:",
      error
    );

  }

  db = {

    subjects: [],
    errors: [],
    tests: []

  };

}


function saveDatabase() {

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(db)
  );

}


function normalizeDatabase(
  database
) {

  if (
    !database ||
    typeof database !== "object"
  ) {

    return {

      subjects: [],
      errors: [],
      tests: []

    };

  }

  database.subjects =
    Array.isArray(
      database.subjects
    )
      ? database.subjects
      : [];

  database.errors =
    Array.isArray(
      database.errors
    )
      ? database.errors
      : [];

  database.tests =
    Array.isArray(
      database.tests
    )
      ? database.tests
      : [];

  database.subjects =
    database.subjects.map(
      subject => {

        if (!subject.reviews) {

          subject.reviews = {};

        }

        if (
          subject.reviews.d90 &&
          !subject.reviews.d60
        ) {

          subject.reviews.d60 =
            subject.reviews.d90;

        }

        STAGES.forEach(
          stage => {

            if (
              !subject.reviews[stage]
            ) {

              subject.reviews[stage] = {

                completed: false,
                date: null,
                plannedDate: null

              };

            } else {

              subject.reviews[stage]
                .completed =
                Boolean(
                  subject.reviews[stage]
                    .completed
                );

              subject.reviews[stage]
                .date =
                subject.reviews[stage]
                  .date || null;

              subject.reviews[stage]
                .plannedDate =
                subject.reviews[stage]
                  .plannedDate || null;

            }

          }
        );

        if (
          !Array.isArray(
            subject.history
          )
        ) {

          subject.history = [];

        }

        return subject;

      }
    );

  database.tests =
    database.tests.map(
      test => {

        const total =
          Number.isInteger(
            Number(test.total)
          )
            ? Number(test.total)
            : 0;

        const correct =
          Number.isInteger(
            Number(test.correct)
          )
            ? Number(test.correct)
            : 0;

        const annulled =
          Number.isInteger(
            Number(
              test.annulledQuestions ??
              test.annulled ??
              0
            )
          )
            ? Number(
                test.annulledQuestions ??
                test.annulled ??
                0
              )
            : 0;

        let areaResults =
          test.areaResults;

        if (
          !areaResults ||
          typeof areaResults !== "object" ||
          Array.isArray(areaResults)
        ) {

          areaResults = null;

        } else {

          AREA_ORDER.forEach(
            area => {

              const data =
                areaResults[area];

              if (
                !data ||
                typeof data !== "object"
              ) {

                areaResults[area] = {

                  questions: 0,
                  correct: 0

                };

                return;

              }

              areaResults[area] = {

                questions:
                  Number.isInteger(
                    Number(data.questions)
                  )
                    ? Math.max(
                        0,
                        Number(data.questions)
                      )
                    : 0,

                correct:
                  Number.isInteger(
                    Number(data.correct)
                  )
                    ? Math.max(
                        0,
                        Number(data.correct)
                      )
                    : 0

              };

            }
          );

        }

        return {

          id:
            test.id ||
            generateId(),

          name:
            test.name ||
            "Prova sem nome",

          source:
            test.source ||
            "",

          type:
            test.type ||
            "Outro",

          date:
            test.date ||
            todayISO(),

          total:
            Math.max(
              0,
              total
            ),

          correct:
            Math.max(
              0,
              correct
            ),

          annulledQuestions:
            Math.max(
              0,
              annulled
            ),

          areaResults

        };

      }
    );

  return database;

}


function migrateOldDatabase(
  old
) {

  const migrated = {

    subjects: [],

    errors:
      old.errors || [],

    tests:
      old.tests || []

  };

  (
    old.subjects || []
  ).forEach(
    oldSubject => {

      const firstStudy =
        oldSubject.firstStudy ||
        oldSubject.createdAt ||
        todayISO();

      const subject =
        createEmptySubject(
          oldSubject.name ||
            "Assunto",

          oldSubject.area ||
            "GO",

          firstStudy
        );

      if (
        Array.isArray(
          oldSubject.history
        )
      ) {

        subject.history =
          oldSubject.history;

      }

      const stage =
        oldSubject.stage;

      if (stage === "d1") {

        subject.reviews.d1.plannedDate =
          oldSubject.nextReview ||
          addDays(
            firstStudy,
            1
          );

      }

      if (stage === "d7") {

        subject.reviews.d1.completed =
          true;

        subject.reviews.d1.date =
          oldSubject.lastReview ||
          null;

        subject.reviews.d7.plannedDate =
          oldSubject.nextReview ||
          null;

      }

      if (stage === "d30") {

        subject.reviews.d1.completed =
          true;

        subject.reviews.d7.completed =
          true;

        subject.reviews.d7.date =
          oldSubject.lastReview ||
          null;

        subject.reviews.d30.plannedDate =
          oldSubject.nextReview ||
          null;

      }

      if (stage === "d90") {

        subject.reviews.d1.completed =
          true;

        subject.reviews.d7.completed =
          true;

        subject.reviews.d30.completed =
          true;

        subject.reviews.d30.date =
          oldSubject.lastReview ||
          null;

        subject.reviews.d60.plannedDate =
          oldSubject.nextReview ||
          null;

      }

      migrated.subjects.push(
        subject
      );

    }
  );

  return migrated;

}


/* =========================================================
   SUBJECT FACTORY
   ========================================================= */

function createEmptySubject(
  name,
  area,
  firstStudy
) {

  return {

    id: generateId(),

    name,

    area,

    firstStudy,

    reviews: {

      d1: {

        completed: false,

        date: null,

        plannedDate:
          addDays(
            firstStudy,
            STAGE_INTERVALS.d1
          )

      },

      d7: {

        completed: false,

        date: null,

        plannedDate: null

      },

      d30: {

        completed: false,

        date: null,

        plannedDate: null

      },

      d60: {

        completed: false,

        date: null,

        plannedDate: null

      }

    },

    history: []

  };

}


/* =========================================================
   EXPORT / IMPORT
   ========================================================= */

function exportData() {

  const blob =
    new Blob(
      [
        JSON.stringify(
          db,
          null,
          2
        )
      ],
      {
        type:
          "application/json"
      }
    );

  const url =
    URL.createObjectURL(
      blob
    );

  const link =
    document.createElement(
      "a"
    );

  link.href =
    url;

  link.download =
    `amadicas-study-${todayISO()}.json`;

  link.click();

  URL.revokeObjectURL(
    url
  );

  showToast(
    "Dados exportados."
  );

}


function importData(
  event
) {

  const file =
    event.target.files[0];

  if (!file) return;

  const reader =
    new FileReader();

  reader.onload = () => {

    try {

      const imported =
        normalizeDatabase(
          JSON.parse(
            reader.result
          )
        );

      if (
        !confirm(
          "Importar estes dados vai substituir os dados atuais. Continuar?"
        )
      ) {

        return;

      }

      db =
        imported;

      saveDatabase();

      showToast(
        "Dados importados."
      );

      renderPage(
        "dashboard"
      );

    } catch (error) {

      console.error(
        error
      );

      alert(
        "Não foi possível importar este arquivo."
      );

    }

  };

  reader.readAsText(
    file
  );

}


function resetData() {

  const confirmed =
    confirm(
      "Isso apagará todos os assuntos e provas/simulados. Continuar?"
    );

  if (!confirmed)
    return;

  localStorage.removeItem(
    STORAGE_KEY
  );

  db = {

    subjects: [],
    errors: [],
    tests: []

  };

  showToast(
    "Dados resetados."
  );

  renderPage(
    "dashboard"
  );

}