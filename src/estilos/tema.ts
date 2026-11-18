/**
 * ARQUIVO: src/estilos/tema.ts
 *
 * PARA QUE SERVE?
 * É o "arquivo de variáveis" do visual do app: TODAS as cores, tamanhos de fonte,
 * espaçamentos, bordas e sombras ficam aqui.
 *
 * POR QUÊ?
 * React Native não usa CSS de verdade, mas a ideia é a mesma de variáveis CSS:
 * se mudarmos cores.primaria aqui, o app inteiro muda junto.
 * Regra do projeto: nenhum arquivo usa cor "solta" (ex.: "#FF0000"); todos
 * pegam as cores deste arquivo.
 */
import { Platform, ViewStyle } from "react-native";
import { CategoriaEvento, StatusEvento } from "../tipos/evento";

/* ---------- Cores gerais ---------- */

export const cores = {
  primaria: "#4F46E5",
  primariaEscura: "#3730A3",
  primariaClara: "#EEF2FF",

  fundo: "#F5F6FA", // fundo das telas
  superficie: "#FFFFFF", // fundo dos cartões e campos
  borda: "#E2E4EE",

  texto: "#1F2333",
  textoSecundario: "#5B6075",
  textoSuave: "#8C91A6",
  textoSobreCor: "#FFFFFF", // texto em cima de fundo colorido (ex.: botão primário)

  sucesso: "#15803D",
  sucessoClaro: "#DCFCE7",
  erro: "#B91C1C",
  erroClaro: "#FEE2E2",
  aviso: "#B45309",
  avisoClaro: "#FEF3C7",

  desativado: "#9CA3AF",
  desativadoClaro: "#F1F2F5",

  favorito: "#E11D48",
  sombra: "#000000",
};

/* ---------- Cores por categoria de evento ---------- */

/**
 * Cada categoria tem uma cor "forte" (texto e destaque) e uma "clara" (fundo).
 * O tipo Record<CategoriaEvento, ...> obriga a ter uma entrada para CADA categoria:
 * se criarmos uma categoria nova e esquecermos a cor, o TypeScript avisa.
 */
export const coresCategorias: Record<CategoriaEvento, { forte: string; clara: string }> = {
  Palestra: { forte: "#2563EB", clara: "#DBEAFE" },
  Oficina: { forte: "#C2410C", clara: "#FFEDD5" },
  Hackathon: { forte: "#7C3AED", clara: "#EDE9FE" },
  "Semana Acadêmica": { forte: "#0F766E", clara: "#CCFBF1" },
  "Evento Profissional": { forte: "#BE185D", clara: "#FCE7F3" },
};

/* ---------- Cores por status ---------- */

export const coresStatus: Record<StatusEvento, { texto: string; fundo: string }> = {
  aberto: { texto: cores.sucesso, fundo: cores.sucessoClaro },
  encerrado: { texto: cores.textoSecundario, fundo: cores.desativadoClaro },
  indisponivel: { texto: cores.erro, fundo: cores.erroClaro },
};

/* ---------- Tipografia ---------- */

export const fontes = {
  pequena: 12,
  normal: 14,
  media: 16,
  grande: 20,
  titulo: 24,
};

/**
 * Pesos de fonte. O "as const" diz ao TypeScript que esses valores são fixos
 * ("400", "600"...), e não um texto qualquer. O StyleSheet exige isso.
 */
export const pesos = {
  normal: "400",
  medio: "600",
  negrito: "700",
} as const;

/* ---------- Espaçamentos e bordas ---------- */

export const espacamento = {
  minimo: 4,
  pequeno: 8,
  medio: 16,
  grande: 24,
  enorme: 32,
};

export const bordas = {
  raioPequeno: 8,
  raioMedio: 12,
  raioGrande: 16,
  raioPilula: 999, // valor alto deixa as pontas totalmente arredondadas
  espessura: 1,
};

/** Transparência usada nos cartões de eventos encerrados ou indisponíveis. */
export const opacidadeDesativado = 0.6;

/* ---------- Sombra (diferente em cada plataforma) ---------- */

/**
 * CONCEITO: Platform.select
 * Recebe um objeto com uma opção para cada plataforma e devolve só a opção da
 * plataforma em que o app está rodando.
 *
 * Por que a sombra é diferente?
 * - No iOS, a sombra é desenhada com as propriedades shadowColor, shadowOffset,
 *   shadowOpacity e shadowRadius.
 * - No Android, essas propriedades não funcionam. Usamos "elevation", que simula
 *   a altura do elemento (padrão Material Design).
 * - "default" é usado em outras plataformas (ex.: web).
 */
export const sombra: ViewStyle = Platform.select<ViewStyle>({
  ios: {
    shadowColor: cores.sombra,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  android: {
    elevation: 3,
  },
  default: {},
});
