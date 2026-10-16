
/* =========================================================
   AMADICAS STUDY — STORAGE
   Banco individual por usuário + Supabase
   ========================================================= */

let cloudSaveQueue = Promise.resolve();
let cloudSaveErrorShown = false;

/* =========================================================
   BANCO INDIVIDUAL
   ========================================================= */

function userStorageKey(userId) {
  return `${STORAGE_KEY}-user-${userId}`;
}

async function initializeUserDatabase(userId) {
  if (!supabaseClient || !userId) {
    throw new Error("Usuário não autenticado.");
  }

  // Busca somente os dados associados à conta autenticada.
  const { data, error } = await supabaseClient
    .from("user_databases")
    .select("data")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;

  if (data) {
    db = normalizeDatabase(data.data);
  } else {
    // Conta nova começa vazia.
    const emptyDatabase = {
      subjects: [],
      errors: [],
      tests: []
    };

    const { error: insertError } = await supabaseClient
      .from("user_databases")
      .insert({
        user_id: userId,
        data: emptyDatabase
      });

    if (insertError) throw insertError;

    db = emptyDatabase;
  }

  localStorage.setItem(
    userStorageKey(userId),
    JSON.stringify(db)
  );
}

/*
 * Não carrega dados antigos antes do login.
 * Os dados antigos do navegador permanecem intactos.
 */
function loadDatabase() {
  db = {
    subjects: [],
    errors: [],
    tests: []
  };
}

/* =========================================================
   SALVAMENTO E SINCRONIZAÇÃO
   ========================================================= */

function saveDatabase() {
  const userId = activeUserId;

  if (!userId || !supabaseClient) {
    console.warn(
      "Salvamento ignorado: nenhuma conta autenticada."
    );
    return;
  }

  const snapshot = JSON.parse(JSON.stringify(db));

  // Salva uma cópia local exclusiva desta conta.
  try {
    localStorage.setItem(
      userStorageKey(userId),
      JSON.stringify(snapshot)
    );
  } catch (error) {
    console.error("Erro ao salvar cópia local:", error);
  }

  // Mantém os salvamentos na ordem em que foram solicitados.
  cloudSaveQueue = cloudSaveQueue
    .catch(() => {
      // Permite que a fila continue após uma falha anterior.
    })
    .then(async () => {
      if (activeUserId !== userId) return;

      const { error } = await supabaseClient
        .from("user_databases")
        .upsert(
          {
            user_id: userId,
            data: snapshot,
            updated_at: new Date().toISOString()
          },
          {
            onConflict: "user_id"
          }
        );

      if (error) throw error;

      cloudSaveErrorShown = false;
    })
    .catch(error => {
      console.error(
        "Erro ao sincronizar com Supabase:",
        error
      );

      if (!cloudSaveErrorShown) {
        cloudSaveErrorShown = true;

        if (typeof showToast === "function") {
          showToast(
            "Falha na sincronização. Confira sua conexão."
          );
        }
      }
    });
}

/* =========================================================
   NORMALIZAÇÃO
   ========================================================= */

function normalizeDatabase(database) {
  if (!database || typeof database !== "object") {
    return {
      subjects: [],
      errors: [],
      tests: []
    };
  }

  database.subjects = Array.isArray(database.subjects)
    ? database.subjects
    : [];

  database.errors = Array.isArray(database.errors)
    ? database.errors
    : [];

  database.tests = Array.isArray(database.tests)
    ? database.tests
    : [];

  database.subjects = database.subjects.map(subject => {
    if (!subject.reviews) {
      subject.reviews = {};
    }

    if (subject.reviews.d90 && !subject.reviews.d60) {
      subject.reviews.d60 = subject.reviews.d90;
    }

    STAGES.forEach(stage => {
      if (!subject.reviews[stage]) {
        subject.reviews[stage] = {
          completed: false,
          date: null,
          plannedDate: null
        };
      } else {
        subject.reviews[stage].completed =
          Boolean(subject.reviews[stage].completed);

        subject.reviews[stage].date =
          subject.reviews[stage].date || null;

        subject.reviews[stage].plannedDate =
          subject.reviews[stage].plannedDate || null;
      }
    });

    if (!Array.isArray(subject.history)) {
      subject.history = [];
    }

    return subject;
  });

  database.tests = database.tests.map(test => {
    const total = Number.isInteger(Number(test.total))
      ? Number(test.total)
      : 0;

    const correct = Number.isInteger(Number(test.correct))
      ? Number(test.correct)
      : 0;

    const annulledValue =
      test.annulledQuestions ?? test.annulled ?? 0;

    const annulled = Number.isInteger(Number(annulledValue))
      ? Number(annulledValue)
      : 0;

    let areaResults = test.areaResults;

    if (
      !areaResults ||
      typeof areaResults !== "object" ||
      Array.isArray(areaResults)
    ) {
      areaResults = null;
    } else {
      areaResults = { ...areaResults };

      AREA_ORDER.forEach(area => {
        const areaData = areaResults[area];

        if (!areaData || typeof areaData !== "object") {
          areaResults[area] = {
            questions: 0,
            correct: 0
          };
          return;
        }

        areaResults[area] = {
          questions: Number.isInteger(Number(areaData.questions))
            ? Math.max(0, Number(areaData.questions))
            : 0,
          correct: Number.isInteger(Number(areaData.correct))
            ? Math.max(0, Number(areaData.correct))
            : 0
        };
      });
    }

    return {
      id: test.id || generateId(),
      name: test.name || "Prova sem nome",
      source: test.source || "",
      type: test.type || "Outro",
      date: test.date || todayISO(),
      total: Math.max(0, total),
      correct: Math.max(0, correct),
      annulledQuestions: Math.max(0, annulled),
      areaResults
    };
  });

  return database;
}

/* =========================================================
   MIGRAÇÃO DO FORMATO ANTIGO
   Mantida para compatibilidade; não executada no login.
   ========================================================= */

function migrateOldDatabase(old) {
  const migrated = {
    subjects: [],
    errors: old.errors || [],
    tests: old.tests || []
  };

  (old.subjects || []).forEach(oldSubject => {
    const firstStudy =
      oldSubject.firstStudy ||
      oldSubject.createdAt ||
      todayISO();

    const subject = createEmptySubject(
      oldSubject.name || "Assunto",
      oldSubject.area || "GO",
      firstStudy
    );

    if (Array.isArray(oldSubject.history)) {
      subject.history = oldSubject.history;
    }

    const stage = oldSubject.stage;

    if (stage === "d1") {
      subject.reviews.d1.plannedDate =
        oldSubject.nextReview || addDays(firstStudy, 1);
    }

    if (stage === "d7") {
      subject.reviews.d1.completed = true;
      subject.reviews.d1.date = oldSubject.lastReview || null;
      subject.reviews.d7.plannedDate = oldSubject.nextReview || null;
    }

    if (stage === "d30") {
      subject.reviews.d1.completed = true;
      subject.reviews.d7.completed = true;
      subject.reviews.d7.date = oldSubject.lastReview || null;
      subject.reviews.d30.plannedDate = oldSubject.nextReview || null;
    }

    if (stage === "d90") {
      subject.reviews.d1.completed = true;
      subject.reviews.d7.completed = true;
      subject.reviews.d30.completed = true;
      subject.reviews.d30.date = oldSubject.lastReview || null;
      subject.reviews.d60.plannedDate = oldSubject.nextReview || null;
    }

    migrated.subjects.push(subject);
  });

  return migrated;
}

/* =========================================================
   CRIAÇÃO DE ASSUNTO
   ========================================================= */

function createEmptySubject(name, area, firstStudy) {
  return {
    id: generateId(),
    name,
    area,
    firstStudy,
    reviews: {
      d1: {
        completed: false,
        date: null,
        plannedDate: addDays(firstStudy, STAGE_INTERVALS.d1)
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
   EXPORTAR
   ========================================================= */

function exportData() {
  const blob = new Blob(
    [JSON.stringify(db, null, 2)],
    { type: "application/json" }
  );

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `amadicas-study-${todayISO()}.json`;
  link.click();

  URL.revokeObjectURL(url);
  showToast("Dados exportados.");
}

/* =========================================================
   IMPORTAR
   ========================================================= */

function importData(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onload = async () => {
    try {
      const imported = normalizeDatabase(
        JSON.parse(reader.result)
      );

      if (
        !confirm(
          "Importar estes dados vai substituir os dados atuais desta conta. Continuar?"
        )
      ) {
        return;
      }

      db = imported;
      saveDatabase();

      // Aguarda a tentativa de sincronização terminar.
      await cloudSaveQueue;

      showToast("Importação processada.");
      renderPage("dashboard");
    } catch (error) {
      console.error(error);
      alert("Não foi possível importar este arquivo.");
    } finally {
      event.target.value = "";
    }
  };

  reader.readAsText(file);
}

/* =========================================================
   RESETAR
   ========================================================= */

function resetData() {
  const confirmed = confirm(
    "Isso apagará os assuntos, erros e simulados desta conta. Continuar?"
  );

  if (!confirmed) return;

  db = {
    subjects: [],
    errors: [],
    tests: []
  };

  saveDatabase();
  showToast("Dados desta conta resetados.");
  renderPage("dashboard");
}
