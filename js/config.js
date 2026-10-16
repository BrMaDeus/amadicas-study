/* =========================================================
   AMADICAS STUDY — CONFIG
   ========================================================= */

const STORAGE_KEY = "amadicas-study-v3";
const THEME_STORAGE_KEY = "amadicas-study-theme";
const SIDEBAR_STORAGE_KEY = "amadicas_sidebar_state";


/* =========================================================
   GRANDES ÁREAS
   ========================================================= */

const AREAS = {

  GO: {
    name: "Ginecologia e Obstetrícia",
    emoji: "🩺"
  },

  CM: {
    name: "Clínica Médica",
    emoji: "🫀"
  },

  PREV: {
    name: "Preventiva",
    emoji: "🌎"
  },

  PED: {
    name: "Pediatria",
    emoji: "🧸"
  },

  CIR: {
    name: "Cirurgia Geral",
    emoji: "🔪"
  }

};

const AREA_ORDER = [
  "GO",
  "CM",
  "PREV",
  "PED",
  "CIR"
];


/* =========================================================
   REVISÕES
   ========================================================= */

const STAGES = [
  "d1",
  "d7",
  "d30",
  "d60"
];

const STAGE_LABELS = {
  d1: "D1",
  d7: "D7",
  d30: "D30",
  d60: "D60"
};

const STAGE_INTERVALS = {
  d1: 1,
  d7: 7,
  d30: 30,
  d60: 60
};


/* =========================================================
   TIPOS DE PROVA
   ========================================================= */

const TEST_TYPES = [
  "Simulado Medcof",
  "Enamed",
  "Prova de residência",
  "Prova da faculdade",
  "Outro"
];