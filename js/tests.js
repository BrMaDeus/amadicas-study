/* =========================================================
   AMADICAS STUDY — PROVAS E SIMULADOS
   ========================================================= */


/* =========================================================
   FILTROS DE PROVAS
   ========================================================= */

let testFilters = {

  period: "all",

  source: "all",

  type: "all",

  area: "all",

  dateFrom: "",

  dateTo: ""

};


/* =========================================================
   FONTES / TIPOS
   ========================================================= */

function getTestSources() {

  return [
    ...new Set(
      db.tests
        .map(
          test =>
            String(
              test.source || ""
            ).trim()
        )
        .filter(Boolean)
    )
  ].sort(
    (a, b) =>
      a.localeCompare(
        b,
        "pt-BR",
        {
          sensitivity: "base"
        }
      )
  );

}


function getTestTypes() {

  return [
    ...new Set(
      db.tests
        .map(
          test =>
            String(
              test.type ||
              "Outro"
            ).trim()
        )
        .filter(Boolean)
    )
  ].sort(
    (a, b) =>
      a.localeCompare(
        b,
        "pt-BR",
        {
          sensitivity: "base"
        }
      )
  );

}


/* =========================================================
   DATAS DOS FILTROS
   ========================================================= */

function getTestPeriodDates() {

  const today =
    parseLocalDate(
      todayISO()
    );

  if (!today) {

    return {

      from: null,

      to: null

    };

  }

  let from = null;

  if (
    testFilters.period ===
    "30"
  ) {

    from =
      new Date(
        today
      );

    from.setDate(
      from.getDate() - 30
    );

  }

  else if (
    testFilters.period ===
    "90"
  ) {

    from =
      new Date(
        today
      );

    from.setDate(
      from.getDate() - 90
    );

  }

  else if (
    testFilters.period ===
    "180"
  ) {

    from =
      new Date(
        today
      );

    from.setDate(
      from.getDate() - 180
    );

  }

  else if (
    testFilters.period ===
    "365"
  ) {

    from =
      new Date(
        today
      );

    from.setDate(
      from.getDate() - 365
    );

  }

  else if (
    testFilters.period ===
    "custom"
  ) {

    from =
      testFilters.dateFrom
        ? parseLocalDate(
            testFilters.dateFrom
          )
        : null;

  }

  const to =
    testFilters.period ===
    "custom"
      ? (
          testFilters.dateTo
            ? parseLocalDate(
                testFilters.dateTo
              )
            : null
        )
      : today;

  return {

    from,

    to

  };

}


/* =========================================================
   FILTRO POR ÁREA
   ========================================================= */

function testMatchesArea(
  test,
  area
) {

  if (
    area ===
    "all"
  ) {

    return true;

  }

  return Boolean(

    test.areaResults &&

    test.areaResults[
      area
    ] &&

    Number(
      test.areaResults[
        area
      ].questions
    ) > 0

  );

}


/* =========================================================
   PROVAS FILTRADAS
   ========================================================= */

function getFilteredTests() {

  const {
    from,
    to
  } =
    getTestPeriodDates();

  return db.tests.filter(
    test => {

      if (
        testFilters.source !==
        "all"
      ) {

        const source =
          String(
            test.source || ""
          ).trim();

        if (
          source !==
          testFilters.source
        ) {

          return false;

        }

      }


      if (
        testFilters.type !==
        "all"
      ) {

        const type =
          String(
            test.type ||
            "Outro"
          ).trim();

        if (
          type !==
          testFilters.type
        ) {

          return false;

        }

      }


      if (
        !testMatchesArea(
          test,
          testFilters.area
        )
      ) {

        return false;

      }


      if (
        from ||
        to
      ) {

        const testDate =
          parseLocalDate(
            test.date
          );

        if (!testDate) {

          return false;

        }

        if (
          from &&
          testDate <
            from
        ) {

          return false;

        }

        if (
          to &&
          testDate >
            to
        ) {

          return false;

        }

      }


      return true;

    }
  );

}


/* =========================================================
   ALTERAR FILTRO
   ========================================================= */

function setTestFilter(
  filter,
  value
) {

  testFilters[
    filter
  ] = value;

  if (
    filter ===
    "period" &&
    value !==
    "custom"
  ) {

    testFilters.dateFrom =
      "";

    testFilters.dateTo =
      "";

  }

  renderTests(
    document.getElementById(
      "pageContent"
    )
  );

}


/* =========================================================
   DATAS PERSONALIZADAS
   ========================================================= */

function isoToDisplayDate(
  value
) {

  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(
      value || ""
    )
  ) {

    return "";

  }

  const [
    year,
    month,
    day
  ] =
    value.split("-");

  return `${day}/${month}/${year}`;

}


function displayToISODate(
  value
) {

  const digits =
    String(
      value || ""
    )
      .replace(
        /\D/g,
        ""
      )
      .slice(
        0,
        8
      );

  if (
    digits.length !==
    8
  ) {

    return "";

  }

  const day =
    digits.slice(
      0,
      2
    );

  const month =
    digits.slice(
      2,
      4
    );

  const year =
    digits.slice(
      4,
      8
    );

  const iso =
    `${year}-${month}-${day}`;

  const parsed =
    parseLocalDate(
      iso
    );

  if (!parsed) {

    return "";

  }

  if (
    parsed.getFullYear() !==
      Number(year) ||
    parsed.getMonth() + 1 !==
      Number(month) ||
    parsed.getDate() !==
      Number(day)
  ) {

    return "";

  }

  return iso;

}


function formatTestCustomDateInput(
  input
) {

  if (!input) {

    return "";

  }

  const digits =
    String(
      input.value || ""
    )
      .replace(
        /\D/g,
        ""
      )
      .slice(
        0,
        8
      );

  let formatted =
    digits;

  if (
    digits.length > 4
  ) {

    formatted =
      `${digits.slice(
        0,
        2
      )}/${digits.slice(
        2,
        4
      )}/${digits.slice(
        4
      )}`;

  }

  else if (
    digits.length > 2
  ) {

    formatted =
      `${digits.slice(
        0,
        2
      )}/${digits.slice(
        2
      )}`;

  }

  input.value =
    formatted;

  return formatted;

}


function handleTestCustomDateInput(
  field,
  input
) {

  const formatted =
    formatTestCustomDateInput(
      input
    );

  const digits =
    formatted.replace(
      /\D/g,
      ""
    );

  if (
    digits.length ===
    0
  ) {

    testFilters[
      field
    ] = "";

    testFilters.period =
      "custom";

    renderTests(
      document.getElementById(
        "pageContent"
      )
    );

    return;

  }


  if (
    digits.length <
    8
  ) {

    return;

  }


  const iso =
    displayToISODate(
      formatted
    );

  if (!iso) {

    return;

  }


  testFilters[
    field
  ] = iso;

  testFilters.period =
    "custom";

  renderTests(
    document.getElementById(
      "pageContent"
    )
  );

}


function setTestCustomDate(
  field,
  value
) {

  const iso =
    displayToISODate(
      value
    );

  if (
    !iso &&
    value
  ) {

    return;

  }

  testFilters[
    field
  ] = iso;

  testFilters.period =
    "custom";

  renderTests(
    document.getElementById(
      "pageContent"
    )
  );

}


/* =========================================================
   CALENDÁRIO DOS FILTROS PERSONALIZADOS
   ========================================================= */

function openTestDatePicker(
  field
) {

  const picker =
    document.getElementById(
      field === "dateFrom"
        ? "testDateFromPicker"
        : "testDateToPicker"
    );

  if (!picker) return;

  if (
    typeof picker.showPicker ===
    "function"
  ) {

    picker.showPicker();

  }

  else {

    picker.focus();

    picker.click();

  }

}


function handleTestCustomDatePicker(
  field,
  value
) {

  if (!value) return;

  testFilters[
    field
  ] = value;

  testFilters.period =
    "custom";

  renderTests(
    document.getElementById(
      "pageContent"
    )
  );

}


/* =========================================================
   LIMPAR FILTROS
   ========================================================= */

function clearTestFilters() {

  testFilters = {

    period: "all",

    source: "all",

    type: "all",

    area: "all",

    dateFrom: "",

    dateTo: ""

  };

  renderTests(
    document.getElementById(
      "pageContent"
    )
  );

}


/* =========================================================
   CONSTRUÇÃO DOS FILTROS
   ========================================================= */

function buildTestFilters() {

  const sources =
    getTestSources();

  const types =
    getTestTypes();

  const customPeriod =
    testFilters.period ===
    "custom";

  const filteredCount =
    getFilteredTests().length;

  return `

    <div
      class="panel"
      style="margin-bottom:20px;"
    >

      <div class="panel-title">

        <h3>
          Filtrar provas
        </h3>

        <button
          class="btn btn-small"
          onclick="clearTestFilters()"
        >
          Limpar filtros
        </button>

      </div>


      <div
        style="
          display:grid;
          grid-template-columns:
            repeat(
              auto-fit,
              minmax(170px, 1fr)
            );
          gap:12px;
          margin-top:16px;
        "
      >

        <div class="form-group">

          <label>
            Período
          </label>

          <select
            class="form-control"
            onchange="
              setTestFilter(
                'period',
                this.value
              )
            "
          >

            <option
              value="all"
              ${
                testFilters.period ===
                "all"
                  ? "selected"
                  : ""
              }
            >
              Todas as datas
            </option>


            <option
              value="30"
              ${
                testFilters.period ===
                "30"
                  ? "selected"
                  : ""
              }
            >
              Últimos 30 dias
            </option>


            <option
              value="90"
              ${
                testFilters.period ===
                "90"
                  ? "selected"
                  : ""
              }
            >
              Últimos 3 meses
            </option>


            <option
              value="180"
              ${
                testFilters.period ===
                "180"
                  ? "selected"
                  : ""
              }
            >
              Últimos 6 meses
            </option>


            <option
              value="365"
              ${
                testFilters.period ===
                "365"
                  ? "selected"
                  : ""
              }
            >
              Último ano
            </option>


            <option
              value="custom"
              ${
                customPeriod
                  ? "selected"
                  : ""
              }
            >
              Período personalizado
            </option>

          </select>

        </div>


        <div class="form-group">

          <label>
            Banca / fonte
          </label>

          <select
            class="form-control"
            onchange="
              setTestFilter(
                'source',
                this.value
              )
            "
          >

            <option
              value="all"
            >
              Todas
            </option>


            ${
              sources
                .map(
                  source => `

                    <option
                      value="${escapeAttribute(
                        source
                      )}"
                      ${
                        testFilters.source ===
                        source
                          ? "selected"
                          : ""
                      }
                    >
                      ${escapeHTML(
                        source
                      )}
                    </option>

                  `
                )
                .join("")
            }

          </select>

        </div>


        <div class="form-group">

          <label>
            Tipo
          </label>

          <select
            class="form-control"
            onchange="
              setTestFilter(
                'type',
                this.value
              )
            "
          >

            <option
              value="all"
            >
              Todos
            </option>


            ${
              types
                .map(
                  type => `

                    <option
                      value="${escapeAttribute(
                        type
                      )}"
                      ${
                        testFilters.type ===
                        type
                          ? "selected"
                          : ""
                      }
                    >
                      ${escapeHTML(
                        type
                      )}
                    </option>

                  `
                )
                .join("")
            }

          </select>

        </div>


        <div class="form-group">

          <label>
            Grande área
          </label>

          <select
            class="form-control"
            onchange="
              setTestFilter(
                'area',
                this.value
              )
            "
          >

            <option
              value="all"
            >
              Todas
            </option>


            ${
              AREA_ORDER
                .map(
                  area => `

                    <option
                      value="${area}"
                      ${
                        testFilters.area ===
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
                .join("")
            }

          </select>

        </div>

      </div>


      ${
        customPeriod
          ? `

            <div
              style="
                display:grid;
                grid-template-columns:
                  repeat(
                    auto-fit,
                    minmax(170px, 1fr)
                  );
                gap:12px;
                margin-top:12px;
              "
            >

              <div class="form-group">

                <label>
                  Data inicial
                </label>

                <div
                  style="
                    display:flex;
                    gap:8px;
                    align-items:center;
                  "
                >

                  <input
                    class="form-control"
                    type="text"
                    inputmode="numeric"
                    autocomplete="off"
                    maxlength="10"
                    placeholder="DD/MM/AAAA"
                    value="${escapeAttribute(
                      isoToDisplayDate(
                        testFilters.dateFrom
                      )
                    )}"
                    oninput="
                      handleTestCustomDateInput(
                        'dateFrom',
                        this
                      )
                    "
                    style="flex:1;"
                  >

                  <button
                    type="button"
                    class="btn btn-small"
                    title="Selecionar no calendário"
                    onclick="
                      openTestDatePicker(
                        'dateFrom'
                      )
                    "
                    style="
                      min-width:42px;
                      padding:8px 10px;
                      font-size:16px;
                    "
                  >
                    📅
                  </button>

                  <input
                    id="testDateFromPicker"
                    type="date"
                    value="${escapeAttribute(
                      testFilters.dateFrom
                    )}"
                    onchange="
                      handleTestCustomDatePicker(
                        'dateFrom',
                        this.value
                      )
                    "
                    style="
                      position:absolute;
                      width:1px;
                      height:1px;
                      opacity:0;
                      pointer-events:none;
                    "
                  >

                </div>

              </div>


              <div class="form-group">

                <label>
                  Data final
                </label>

                <div
                  style="
                    display:flex;
                    gap:8px;
                    align-items:center;
                  "
                >

                  <input
                    class="form-control"
                    type="text"
                    inputmode="numeric"
                    autocomplete="off"
                    maxlength="10"
                    placeholder="DD/MM/AAAA"
                    value="${escapeAttribute(
                      isoToDisplayDate(
                        testFilters.dateTo
                      )
                    )}"
                    oninput="
                      handleTestCustomDateInput(
                        'dateTo',
                        this
                      )
                    "
                    style="flex:1;"
                  >

                  <button
                    type="button"
                    class="btn btn-small"
                    title="Selecionar no calendário"
                    onclick="
                      openTestDatePicker(
                        'dateTo'
                      )
                    "
                    style="
                      min-width:42px;
                      padding:8px 10px;
                      font-size:16px;
                    "
                  >
                    📅
                  </button>

                  <input
                    id="testDateToPicker"
                    type="date"
                    value="${escapeAttribute(
                      testFilters.dateTo
                    )}"
                    onchange="
                      handleTestCustomDatePicker(
                        'dateTo',
                        this.value
                      )
                    "
                    style="
                      position:absolute;
                      width:1px;
                      height:1px;
                      opacity:0;
                      pointer-events:none;
                    "
                  >

                </div>

              </div>

            </div>

          `
          : ""
      }


      <div
        style="
          margin-top:14px;
          font-size:12px;
          color:var(--text-muted);
        "
      >

        ${
          filteredCount
        }
        ${
          filteredCount ===
          1
            ? "prova encontrada"
            : "provas encontradas"
        }

      </div>

    </div>

  `;

}


/* =========================================================
   DADOS POR ÁREA
   ========================================================= */

function testsWithAreaData() {

  return getFilteredTests().filter(
    test =>
      test.areaResults &&
      typeof test.areaResults ===
        "object"
  );

}


function getValidQuestions(
  test
) {

  const total =
    Number(test?.total) || 0;

  const annulled =
    Number(
      test?.annulledQuestions ??
      test?.annulled ??
      0
    ) || 0;

  return Math.max(
    0,
    total - annulled
  );

}


function getTestPercentage(
  test
) {

  const valid =
    getValidQuestions(
      test
    );

  if (!valid) return 0;

  const correct =
    Math.min(
      Math.max(
        0,
        Number(test.correct) || 0
      ),
      valid
    );

  return (
    correct /
    valid *
    100
  );

}


/* =========================================================
   RENDERIZAÇÃO PRINCIPAL
   ========================================================= */

function renderTests(
  container
) {

  const stats =
    calculateTestStats();

  const areaStats =
    calculateAreaStats();

  container.innerHTML = `

    <div class="page-header">

      <div
        class="page-title"
        data-page="simulados"
      >

        <h1>
          Provas e simulados
        </h1>

        <p>
          Acompanhe sua evolução e veja seu desempenho
          por grande área.
        </p>

      </div>


      <div class="page-actions">

        <button
          class="btn btn-primary"
          onclick="openTestModal()"
        >
          + Nova prova
        </button>

      </div>

    </div>


    ${buildTestFilters()}


    ${
      db.tests.length
        ? buildTestStatistics(
            stats
          )
        : ""
    }


    ${
      db.tests.length
        ? buildTestEvolution()
        : ""
    }


    ${
      db.tests.length
        ? buildAreaStatistics(
            areaStats
          )
        : ""
    }


    <div class="panel">

      <div class="panel-title">

        <h3>
          Histórico de provas
        </h3>

        <span>
          ${
            getFilteredTests().length
          }
          ${
            getFilteredTests().length ===
            1
              ? "prova"
              : "provas"
          }
        </span>

      </div>


      ${
        db.tests.length
          ? buildTestsHistory()
          : `

              <div class="empty-state">

                <div class="empty-icon">
                  ▤
                </div>

                <strong>
                  Nenhuma prova registrada
                </strong>

                <p>
                  Cadastre sua primeira prova ou simulado
                  para começar a acompanhar sua evolução.
                </p>

              </div>

            `
      }

    </div>

  `;

}


/* =========================================================
   ESTATÍSTICAS
   ========================================================= */

function calculateTestStats() {

  const tests =
    getFilteredTests();

  const totalTests =
    tests.length;

  const totalQuestions =
    tests.reduce(
      (
        sum,
        test
      ) =>
        sum +
        Math.max(
          0,
          Number(test.total) || 0
        ),
      0
    );

  const totalAnnulled =
    tests.reduce(
      (
        sum,
        test
      ) =>
        sum +
        Math.max(
          0,
          Number(
            test.annulledQuestions ??
            test.annulled ??
            0
          ) || 0
        ),
      0
    );

  const totalValid =
    tests.reduce(
      (
        sum,
        test
      ) =>
        sum +
        getValidQuestions(
          test
        ),
      0
    );

  const totalCorrect =
    tests.reduce(
      (
        sum,
        test
      ) => {

        const valid =
          getValidQuestions(
            test
          );

        const correct =
          Math.min(
            Math.max(
              0,
              Number(test.correct) || 0
            ),
            valid
          );

        return sum + correct;

      },
      0
    );

  const percentage =
    totalValid
      ? totalCorrect /
        totalValid *
        100
      : 0;

  return {

    totalTests,

    totalQuestions,

    totalAnnulled,

    totalValid,

    totalCorrect,

    percentage

  };

}


function buildTestStatistics(
  stats
) {

  return `

    <div class="stats-grid">

      <div class="stat-card">

        <div class="stat-label">
          Provas
        </div>

        <div class="stat-number">
          ${stats.totalTests}
        </div>

        <div class="stat-description">
          cadastradas
        </div>

      </div>


      <div class="stat-card">

        <div class="stat-label">
          Questões
        </div>

        <div class="stat-number">
          ${stats.totalQuestions}
        </div>

        <div class="stat-description">

          ${
            stats.totalAnnulled
          }
          ${
            stats.totalAnnulled === 1
              ? "anulada"
              : "anuladas"
          }

        </div>

      </div>


      <div class="stat-card">

        <div class="stat-label">
          Acertos
        </div>

        <div class="stat-number">
          ${stats.totalCorrect}
        </div>

        <div class="stat-description">
          de
          ${stats.totalValid}
          válidas
        </div>

      </div>


      <div class="stat-card">

        <div class="stat-label">
          Aproveitamento
        </div>

        <div class="stat-number">
          ${stats.percentage.toFixed(1)}%
        </div>

        <div class="stat-description">
          média geral ponderada
        </div>

      </div>

    </div>

  `;

}


/* =========================================================
   EVOLUÇÃO
   ========================================================= */

function buildTestEvolution() {

  const ordered =
    [...getFilteredTests()]
      .sort(
        (a, b) =>
          a.date.localeCompare(
            b.date
          )
      );

  if (!ordered.length) {

    return "";

  }

  const tests =
    ordered.slice(
      -12
    );

  const width = 900;

  const height = 300;

  const padding = 45;

  const chartWidth =
    width -
    padding * 2;

  const chartHeight =
    height -
    padding * 2;

  const points =
    tests.map(
      (
        test,
        index
      ) => {

        const percentage =
          getTestPercentage(
            test
          );

        const x =
          tests.length === 1
            ? width / 2
            : padding +
              (
                index /
                (
                  tests.length -
                  1
                )
              ) *
              chartWidth;

        const y =
          padding +
          (
            100 -
            percentage
          ) /
          100 *
          chartHeight;

        return {

          x,

          y,

          percentage,

          test

        };

      }
    );

  const polyline =
    points
      .map(
        point =>
          `${point.x},${point.y}`
      )
      .join(" ");

  const labels =
    points
      .map(
        (
          point,
          index
        ) => {

          return `

            <text
              x="${point.x}"
              y="${height - 14}"
              text-anchor="middle"
              font-size="11"
              fill="currentColor"
              opacity="0.65"
            >
              ${index + 1}
            </text>


            <circle
              cx="${point.x}"
              cy="${point.y}"
              r="5"
              fill="currentColor"
            />


            <text
              x="${point.x}"
              y="${point.y - 12}"
              text-anchor="middle"
              font-size="11"
              font-weight="600"
              fill="currentColor"
            >
              ${point.percentage.toFixed(0)}%
            </text>

          `;

        }
      )
      .join("");

  return `

    <div
      class="panel"
      style="margin-top:20px;"
    >

      <div class="panel-title">

        <h3>
          Evolução nas provas
        </h3>

        <span>
          últimas ${
            tests.length
          }
        </span>

      </div>


      <div
        style="
          width:100%;
          overflow-x:auto;
          padding:10px 0 4px;
        "
      >

        <svg
          viewBox="0 0 ${width} ${height}"
          width="100%"
          height="300"
          preserveAspectRatio="none"
          style="
            min-width:650px;
            color:var(--accent);
          "
        >

          <line
            x1="${padding}"
            y1="${padding}"
            x2="${width - padding}"
            y2="${padding}"
            stroke="currentColor"
            opacity="0.08"
          />


          <line
            x1="${padding}"
            y1="${height / 2}"
            x2="${width - padding}"
            y2="${height / 2}"
            stroke="currentColor"
            opacity="0.08"
          />


          <line
            x1="${padding}"
            y1="${height - padding}"
            x2="${width - padding}"
            y2="${height - padding}"
            stroke="currentColor"
            opacity="0.08"
          />


          <text
            x="8"
            y="${padding + 4}"
            font-size="11"
            fill="currentColor"
            opacity="0.55"
          >
            100%
          </text>


          <text
            x="15"
            y="${height / 2 + 4}"
            font-size="11"
            fill="currentColor"
            opacity="0.55"
          >
            50%
          </text>


          <text
            x="23"
            y="${height - padding + 4}"
            font-size="11"
            fill="currentColor"
            opacity="0.55"
          >
            0%
          </text>


          <polyline
            points="${polyline}"
            fill="none"
            stroke="currentColor"
            stroke-width="3"
            stroke-linecap="round"
            stroke-linejoin="round"
          />


          ${labels}

        </svg>

      </div>


      <div
        style="
          font-size:12px;
          color:var(--text-muted);
          text-align:center;
        "
      >

        Os números representam a ordem cronológica
        das provas cadastradas.

      </div>

    </div>

  `;

}


/* =========================================================
   POR ÁREA
   ========================================================= */

function calculateAreaStats() {

  const result = {};

  AREA_ORDER.forEach(
    area => {

      result[area] = {

        questions: 0,

        correct: 0,

        tests: 0

      };

    }
  );

  testsWithAreaData()
    .forEach(
      test => {

        AREA_ORDER.forEach(
          area => {

            const data =
              test.areaResults[
                area
              ];

            if (!data) return;

            const questions =
              Number(
                data.questions
              ) || 0;

            const correct =
              Number(
                data.correct
              ) || 0;

            if (
              questions <= 0
            ) {

              return;

            }

            result[area]
              .questions +=
              questions;

            result[area]
              .correct +=
              Math.min(
                Math.max(
                  0,
                  correct
                ),
                questions
              );

            result[area]
              .tests += 1;

          }
        );

      }
    );

  AREA_ORDER.forEach(
    area => {

      const item =
        result[area];

      item.percentage =
        item.questions
          ? item.correct /
            item.questions *
            100
          : 0;

    }
  );

  return result;

}


function buildAreaStatistics(
  stats
) {

  const hasData =
    AREA_ORDER.some(
      area =>
        stats[area]
          .questions > 0
    );

  if (!hasData) {

    return `

      <div
        class="panel"
        style="margin-top:20px;"
      >

        <div class="panel-title">

          <h3>
            Desempenho por grande área
          </h3>

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

    <div
      class="panel"
      style="margin-top:20px;"
    >

      <div class="panel-title">

        <h3>
          Desempenho por grande área
        </h3>

        <span>
          acumulado de ${getFilteredTests().length}
          ${
            getFilteredTests().length === 1
              ? "prova"
              : "provas"
          }
        </span>

      </div>


      <div class="area-chart">

        ${AREA_ORDER
          .map(
            area => {

              const item =
                stats[area];

              const percentage =
                item.percentage;

              const hasAreaData =
                item.questions > 0;

              return `

                <div
                  class="area-column"
                >

                  <div
                    class="area-percentage"
                    style="
                      display:flex;
                      flex-direction:column;
                      align-items:center;
                      gap:2px;
                    "
                  >

                    ${
                      hasAreaData
                        ? `
                          <div>
                            ${percentage.toFixed(1)}%
                          </div>

                          <div
                            style="
                              font-size:11px;
                              font-weight:500;
                              color:var(--text-muted);
                            "
                          >
                            ${item.correct}/${item.questions}
                          </div>
                        `
                        : "—"
                    }

                  </div>


                  <div
                    class="area-bar-container"
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

        O percentual considera apenas as questões
        das provas em que você informou o desempenho
        por grande área.

      </div>

    </div>

  `;

}


/* =========================================================
   HISTÓRICO
   ========================================================= */

function buildTestsHistory() {

  const tests =
    [...getFilteredTests()]
      .sort(
        (a, b) =>
          b.date.localeCompare(
            a.date
          )
      );

  if (!tests.length) {

    return `

      <div class="empty-state">

        <div class="empty-icon">
          🔎
        </div>

        <strong>
          Nenhuma prova encontrada
        </strong>

        <p>
          Nenhuma prova corresponde aos filtros
          selecionados.
        </p>

        <button
          class="btn btn-small"
          onclick="clearTestFilters()"
        >
          Limpar filtros
        </button>

      </div>

    `;

  }

  return `

    <div
      class="content-grid"
      style="margin-top:16px;"
    >

      ${tests
        .map(
          test => {

            const valid =
              getValidQuestions(
                test
              );

            const percentage =
              getTestPercentage(
                test
              );

            const hasAreas =
              Boolean(
                test.areaResults
              );

            return `

              <div class="data-card">

                <span class="data-tag">

                  ${escapeHTML(
                    test.type ||
                    "Outro"
                  )}

                </span>


                <h3
                  style="
                    margin-top:12px;
                  "
                >

                  ${escapeHTML(
                    test.name
                  )}

                </h3>


                <p>

                  ${
                    test.correct
                  }
                  acertos de
                  ${
                    valid
                  }
                  questões válidas.

                </p>


                ${
                  test.annulledQuestions
                    ? `

                      <p
                        style="
                          font-size:12px;
                          color:var(--text-muted);
                        "
                      >

                        ${
                          test.annulledQuestions
                        }
                        questão${
                          test.annulledQuestions === 1
                            ? ""
                            : "ões"
                        }
                        anulada${
                          test.annulledQuestions === 1
                            ? ""
                            : "s"
                        }.

                      </p>

                    `
                    : ""
                }


                ${
                  test.source
                    ? `

                      <p
                        style="
                          font-size:12px;
                          color:var(--text-muted);
                        "
                      >

                        ${escapeHTML(
                          test.source
                        )}

                      </p>

                    `
                    : ""
                }


                ${
                  hasAreas
                    ? `

                      <span
                        class="data-tag"
                        style="
                          margin-top:6px;
                        "
                      >
                        📊 Por área
                      </span>

                    `
                    : ""
                }


                <div
                  class="data-card-footer"
                >

                  <span
                    style="
                      font-size:14px;
                      font-weight:700;
                      color:var(--accent);
                    "
                  >

                    ${
                      percentage.toFixed(
                        1
                      )
                    }%

                  </span>


                  <span
                    style="
                      font-size:12px;
                      color:var(--text-muted);
                    "
                  >

                    ${formatDateLong(
                      test.date
                    )}

                  </span>


                  <div
                    style="
                      display:flex;
                      gap:6px;
                      margin-left:auto;
                    "
                  >

                    <button
                      class="btn btn-small"
                      onclick="
                        openTestModal(
                          '${test.id}'
                        )
                      "
                    >
                      Editar
                    </button>


                    <button
                      class="
                        btn
                        btn-small
                        btn-danger
                      "
                      onclick="
                        deleteTest(
                          '${test.id}'
                        )
                      "
                    >
                      Excluir
                    </button>

                  </div>

                </div>

              </div>

            `;

          }
        )
        .join("")}

    </div>

  `;

}


/* =========================================================
   MODAL DE PROVA
   ========================================================= */

function openTestModal(
  testId = null
) {

  const test =
    testId
      ? db.tests.find(
          item =>
            item.id === testId
        )
      : null;

  const editing =
    Boolean(test);

  const existingAreas =
    test?.areaResults ||
    null;

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
                ? "Editar prova"
                : "Nova prova"
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
                Nome da prova
              </label>


              <input
                id="testName"
                class="form-control"
                type="text"
                placeholder="Ex.: Simulado geral Medcof"
                value="${
                  editing
                    ? escapeAttribute(
                        test.name
                      )
                    : ""
                }"
              >

            </div>


            <div class="form-group">

              <label>
                Tipo
              </label>


              <select
                id="testType"
                class="form-control"
              >

                ${TEST_TYPES
                  .map(
                    type => `

                      <option
                        value="${escapeAttribute(
                          type
                        )}"
                        ${
                          editing &&
                          (
                            test.type ||
                            "Outro"
                          ) ===
                            type
                            ? "selected"
                            : ""
                        }
                      >
                        ${escapeHTML(
                          type
                        )}
                      </option>

                    `
                  )
                  .join("")}

              </select>

            </div>


            <div class="form-group">

              <label>
                Plataforma / banca
              </label>


              <input
                id="testSource"
                class="form-control"
                type="text"
                placeholder="Medcof / FGV / SES-PE..."
                value="${
                  editing
                    ? escapeAttribute(
                        test.source ||
                        ""
                      )
                    : ""
                }"
              >

            </div>


            <div class="form-group">

              <label>
                Data
              </label>


              <input
                id="testDate"
                class="form-control"
                type="date"
                value="${
                  editing
                    ? test.date
                    : todayISO()
                }"
              >

            </div>


            <div class="form-group">

              <label>
                Questões totais
              </label>


              <input
                id="testTotal"
                class="form-control"
                type="number"
                min="1"
                step="1"
                oninput="updateTestModalSummary()"
                value="${
                  editing
                    ? test.total
                    : ""
                }"
              >

            </div>


            <div class="form-group">

              <label>
                Questões anuladas
              </label>


              <input
                id="testAnnulled"
                class="form-control"
                type="number"
                min="0"
                step="1"
                oninput="updateTestModalSummary()"
                value="${
                  editing
                    ? (
                        test.annulledQuestions ??
                        test.annulled ??
                        0
                      )
                    : 0
                }"
              >

            </div>


            <div class="form-group">

              <label>
                Acertos
              </label>


              <input
                id="testCorrect"
                class="form-control"
                type="number"
                min="0"
                step="1"
                oninput="updateTestModalSummary()"
                value="${
                  editing
                    ? test.correct
                    : ""
                }"
              >

            </div>


            <div
              class="
                form-group
                full
              "
            >

              <div
                id="testModalSummary"
                style="
                  padding:12px 14px;
                  border-radius:10px;
                  background:var(--surface-soft);
                  border:1px solid var(--border);
                  font-size:13px;
                  color:var(--text-secondary);
                  line-height:1.6;
                "
              >
                Preencha os dados acima.
              </div>

            </div>


            <div
              class="
                form-group
                full
              "
            >

              <label
                style="
                  display:flex;
                  align-items:center;
                  gap:8px;
                  cursor:pointer;
                "
              >

                <input
                  id="testUseAreas"
                  type="checkbox"
                  ${
                    existingAreas
                      ? "checked"
                      : ""
                  }
                  onchange="
                    toggleTestAreas()
                  "
                >

                Registrar desempenho por grande área

              </label>


              <div
                style="
                  margin-top:6px;
                  font-size:12px;
                  color:var(--text-muted);
                  line-height:1.5;
                "
              >

                Opcional. Use quando você souber
                quantas questões e acertos teve
                em cada grande área.

              </div>

            </div>


            <div
              id="testAreasContainer"
              class="
                form-group
                full
              "
              style="
                display:${
                  existingAreas
                    ? "block"
                    : "none"
                };
              "
            >

              <div
                style="
                  display:grid;
                  grid-template-columns:
                    minmax(150px, 1.5fr)
                    minmax(90px, 1fr)
                    minmax(90px, 1fr);
                  gap:8px;
                  align-items:center;
                  margin-bottom:8px;
                  font-size:11px;
                  font-weight:700;
                  color:var(--text-muted);
                  text-transform:uppercase;
                "
              >

                <span>
                  Grande área
                </span>

                <span>
                  Questões
                </span>

                <span>
                  Acertos
                </span>

              </div>


              ${AREA_ORDER
                .map(
                  area => {

                    const data =
                      existingAreas?.[
                        area
                      ] || {

                        questions: 0,

                        correct: 0

                      };

                    return `

                      <div
                        style="
                          display:grid;
                          grid-template-columns:
                            minmax(150px, 1.5fr)
                            minmax(90px, 1fr)
                            minmax(90px, 1fr);
                          gap:8px;
                          align-items:center;
                          margin-bottom:8px;
                        "
                      >

                        <span
                          style="
                            font-size:13px;
                            font-weight:600;
                          "
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

                        </span>


                        <input
                          id="areaQuestions_${area}"
                          class="form-control"
                          type="number"
                          min="0"
                          step="1"
                          value="${
                            Number(
                              data.questions
                            ) || 0
                          }"
                          oninput="
                            updateTestModalSummary()
                          "
                        >


                        <input
                          id="areaCorrect_${area}"
                          class="form-control"
                          type="number"
                          min="0"
                          step="1"
                          value="${
                            Number(
                              data.correct
                            ) || 0
                          }"
                          oninput="
                            updateTestModalSummary()
                          "
                        >

                      </div>

                    `;

                  }
                )
                .join("")}


              <div
                id="testAreaSummary"
                style="
                  margin-top:12px;
                  font-size:12px;
                  color:var(--text-muted);
                  line-height:1.6;
                "
              ></div>

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
                    deleteTest(
                      '${test.id}'
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
                ? `saveTest('${test.id}')`
                : "saveTest()"
            }"
          >

            ${
              editing
                ? "Salvar alterações"
                : "Salvar prova"
            }

          </button>

        </div>

      </div>

    </div>

  `;

  updateTestModalSummary();

}


/* =========================================================
   RESUMO DO MODAL
   ========================================================= */

function updateTestModalSummary() {

  const totalInput =
    document.getElementById(
      "testTotal"
    );

  const annulledInput =
    document.getElementById(
      "testAnnulled"
    );

  const correctInput =
    document.getElementById(
      "testCorrect"
    );

  const summary =
    document.getElementById(
      "testModalSummary"
    );

  if (
    !totalInput ||
    !annulledInput ||
    !correctInput ||
    !summary
  ) {

    return;

  }

  const total =
    Number(
      totalInput.value
    ) || 0;

  const annulled =
    Number(
      annulledInput.value
    ) || 0;

  const correct =
    Number(
      correctInput.value
    ) || 0;

  const valid =
    Math.max(
      0,
      total - annulled
    );

  const percentage =
    valid
      ? correct /
        valid *
        100
      : 0;

  if (!total) {

    summary.innerHTML =
      "Preencha o número total de questões.";

  }

  else if (
    annulled > total
  ) {

    summary.innerHTML = `

      <span
        style="
          color:var(--red);
          font-weight:600;
        "
      >

        ⚠ O número de anuladas não pode
        ultrapassar o total da prova.

      </span>

    `;

  }

  else if (
    correct > valid
  ) {

    summary.innerHTML = `

      <span
        style="
          color:var(--red);
          font-weight:600;
        "
      >

        ⚠ Os acertos não podem ultrapassar
        as ${valid} questões válidas.

      </span>

    `;

  }

  else {

    summary.innerHTML = `

      <strong>
        ${valid}
        questões válidas
      </strong>

      ·

      ${correct}
      acertos

      ·

      aproveitamento de

      <strong>
        ${percentage.toFixed(1)}%
      </strong>

      ${
        annulled
          ? `
              ·
              ${annulled}
              anulada${
                annulled === 1
                  ? ""
                  : "s"
              }
            `
          : ""
      }

    `;

  }

  const useAreas =
    document.getElementById(
      "testUseAreas"
    )?.checked;

  const areaSummary =
    document.getElementById(
      "testAreaSummary"
    );

  if (
    !useAreas ||
    !areaSummary
  ) {

    return;

  }

  let areaQuestions = 0;

  let areaCorrect = 0;

  let invalidArea = false;

  AREA_ORDER.forEach(
    area => {

      const questions =
        Number(
          document.getElementById(
            `areaQuestions_${area}`
          )?.value
        ) || 0;

      const correctArea =
        Number(
          document.getElementById(
            `areaCorrect_${area}`
          )?.value
        ) || 0;

      if (
        !Number.isInteger(
          questions
        ) ||
        questions < 0
      ) {

        invalidArea = true;

      }

      if (
        !Number.isInteger(
          correctArea
        ) ||
        correctArea < 0 ||
        correctArea > questions
      ) {

        invalidArea = true;

      }

      areaQuestions +=
        questions;

      areaCorrect +=
        correctArea;

    }
  );

  const messages = [];

  if (invalidArea) {

    messages.push(
      "Existe alguma quantidade inválida em uma das áreas."
    );

  }

  if (
    areaQuestions !==
    valid
  ) {

    messages.push(
      `Questões por área: ${areaQuestions}/${valid}.`
    );

  }

  if (
    areaCorrect !==
    correct
  ) {

    messages.push(
      `Acertos por área: ${areaCorrect}/${correct}.`
    );

  }

  if (
    !invalidArea &&
    areaQuestions === valid &&
    areaCorrect === correct
  ) {

    areaSummary.innerHTML = `

      <span
        style="
          color:var(--green);
          font-weight:600;
        "
      >

        ✓ Distribuição por área confere com a prova.

      </span>

    `;

  }

  else {

    areaSummary.innerHTML = `

      <span
        style="
          color:var(--red);
          font-weight:600;
        "
      >

        ⚠
        ${messages.join(" ")}

      </span>

      <br>

      <span>

        A soma das áreas deve ser igual às
        questões válidas e aos acertos informados
        acima.

      </span>

    `;

  }

}


/* =========================================================
   ÁREAS NO MODAL
   ========================================================= */

function toggleTestAreas() {

  const checkbox =
    document.getElementById(
      "testUseAreas"
    );

  const container =
    document.getElementById(
      "testAreasContainer"
    );

  if (
    !checkbox ||
    !container
  ) {

    return;

  }

  container.style.display =
    checkbox.checked
      ? "block"
      : "none";

  updateTestModalSummary();

}


/* =========================================================
   SALVAR PROVA
   ========================================================= */

function saveTest(
  testId = null
) {

  const name =
    document.getElementById(
      "testName"
    ).value.trim();

  const type =
    document.getElementById(
      "testType"
    ).value;

  const source =
    document.getElementById(
      "testSource"
    ).value.trim();

  const date =
    document.getElementById(
      "testDate"
    ).value;

  const total =
    Number(
      document.getElementById(
        "testTotal"
      ).value
    );

  const annulled =
    Number(
      document.getElementById(
        "testAnnulled"
      ).value
    ) || 0;

  const correct =
    Number(
      document.getElementById(
        "testCorrect"
      ).value
    );

  const useAreas =
    document.getElementById(
      "testUseAreas"
    ).checked;

  if (!name) {

    alert(
      "Digite o nome da prova."
    );

    return;

  }

  if (!date) {

    alert(
      "Selecione a data da prova."
    );

    return;

  }

  if (
    !Number.isInteger(total) ||
    total < 1
  ) {

    alert(
      "Informe um número válido de questões."
    );

    return;

  }

  if (
    !Number.isInteger(annulled) ||
    annulled < 0
  ) {

    alert(
      "O número de questões anuladas é inválido."
    );

    return;

  }

  if (
    annulled > total
  ) {

    alert(
      "O número de questões anuladas não pode ser maior que o total."
    );

    return;

  }

  const valid =
    total -
    annulled;

  if (
    !Number.isInteger(correct) ||
    correct < 0 ||
    correct > valid
  ) {

    alert(
      `Os acertos devem estar entre 0 e ${valid}.`
    );

    return;

  }

  let areaResults =
    null;

  if (useAreas) {

    areaResults = {};

    let areaQuestions = 0;

    let areaCorrect = 0;

    let invalidArea = false;

    AREA_ORDER.forEach(
      area => {

        const questionsInput =
          document.getElementById(
            `areaQuestions_${area}`
          );

        const correctInput =
          document.getElementById(
            `areaCorrect_${area}`
          );

        const questions =
          Number(
            questionsInput?.value
          );

        const areaCorrectValue =
          Number(
            correctInput?.value
          );

        if (
          !Number.isInteger(
            questions
          ) ||
          questions < 0
        ) {

          invalidArea = true;

          return;

        }

        if (
          !Number.isInteger(
            areaCorrectValue
          ) ||
          areaCorrectValue < 0 ||
          areaCorrectValue > questions
        ) {

          invalidArea = true;

          return;

        }

        areaResults[area] = {

          questions,

          correct:
            areaCorrectValue

        };

        areaQuestions +=
          questions;

        areaCorrect +=
          areaCorrectValue;

      }
    );

    if (invalidArea) {

      alert(
        "Verifique os números informados nas grandes áreas. Os valores devem ser inteiros e os acertos não podem ultrapassar as questões daquela área."
      );

      return;

    }

    if (
      areaQuestions !==
      valid
    ) {

      alert(
        `A soma das questões por grande área (${areaQuestions}) precisa ser igual às questões válidas da prova (${valid}).`
      );

      return;

    }

    if (
      areaCorrect !==
      correct
    ) {

      alert(
        `A soma dos acertos por grande área (${areaCorrect}) precisa ser igual ao total de acertos da prova (${correct}).`
      );

      return;

    }

  }

  if (testId) {

    const test =
      db.tests.find(
        item =>
          item.id === testId
      );

    if (!test) return;

    test.name =
      name;

    test.type =
      type;

    test.source =
      source;

    test.date =
      date;

    test.total =
      total;

    test.correct =
      correct;

    test.annulledQuestions =
      annulled;

    test.areaResults =
      areaResults;

    saveDatabase();

    closeModal();

    showToast(
      "Prova atualizada."
    );

    renderTests(
      document.getElementById(
        "pageContent"
      )
    );

    return;

  }

  db.tests.push({

    id:
      generateId(),

    name,

    source,

    type,

    date,

    total,

    correct,

    annulledQuestions:
      annulled,

    areaResults

  });

  saveDatabase();

  closeModal();

  showToast(
    "Prova registrada."
  );

  renderTests(
    document.getElementById(
      "pageContent"
    )
  );

}


/* =========================================================
   EXCLUIR PROVA
   ========================================================= */

function deleteTest(
  testId
) {

  const test =
    db.tests.find(
      item =>
        item.id === testId
    );

  if (!test) return;

  const confirmed =
    confirm(
      `Excluir "${test.name}"? Esta ação não pode ser desfeita.`
    );

  if (!confirmed) {

    return;

  }

  db.tests =
    db.tests.filter(
      item =>
        item.id !== testId
    );

  saveDatabase();

  closeModal();

  showToast(
    "Prova excluída."
  );

  renderTests(
    document.getElementById(
      "pageContent"
    )
  );

}