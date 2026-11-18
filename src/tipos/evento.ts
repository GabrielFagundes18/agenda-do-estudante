/**
 * ARQUIVO: src/tipos/evento.ts
 *
 * PARA QUE SERVE?
 * Aqui ficam os "moldes" dos dados do app, escritos com TypeScript.
 *
 * - Um "type" dá um nome a um conjunto de valores permitidos.
 *   Ex.: Modalidade só pode ser "Presencial" ou "Online". Se alguém escrever
 *   "presencial" (minúsculo), o editor já acusa o erro antes de rodar o app.
 * - Uma "interface" descreve o formato de um objeto: quais campos ele tem e
 *   o tipo de cada campo.
 *
 * Tipos e interfaces NÃO viram código no aplicativo final. Eles servem só para
 * o editor e o compilador nos avisarem quando usamos um dado do jeito errado.
 *
 * POR QUE UM FORMATO ÚNICO DE EVENTO?
 * O app busca eventos em duas APIs diferentes, e cada uma tem um JSON diferente.
 * Os conversores (utilitarios/conversoresEventos.ts) transformam os dois formatos
 * neste formato único, a interface "Evento". Assim, as telas e os componentes só
 * precisam conhecer UM tipo de dado.
 */

/** As cinco categorias de evento que o app trabalha. */
export type CategoriaEvento =
  | "Palestra"
  | "Oficina"
  | "Hackathon"
  | "Semana Acadêmica"
  | "Evento Profissional";

/** Se o evento acontece em um lugar físico ou pela internet. */
export type Modalidade = "Presencial" | "Online";

/**
 * Situação do evento, CALCULADA pelo app (veja utilitarios/statusEvento.ts):
 * - "aberto": dá para se inscrever;
 * - "encerrado": o evento já terminou;
 * - "indisponivel": ainda não terminou, mas não aceita inscrições (cancelado ou sem vagas).
 */
export type StatusEvento = "aberto" | "encerrado" | "indisponivel";

/** Situação que a própria API informou (pode estar desatualizada; por isso o app recalcula). */
export type SituacaoInformada = "disponivel" | "esgotado" | "cancelado" | "encerrado";

/** De qual API o evento veio. */
export type OrigemEvento = "hackathons" | "academica";

/** Uma informação adicional mostrada na tela de detalhes (ex.: "Prêmio: $10,000"). */
export interface InformacaoExtra {
  rotulo: string;
  valor: string;
}

/** O formato ÚNICO de evento usado no app inteiro. */
export interface Evento {
  id: string; // ex.: "hackathon-30078" ou "academico-3" (o prefixo evita ids repetidos entre as APIs)
  titulo: string;
  categoria: CategoriaEvento;
  dataInicio: string; // data no formato ISO 8601, ex.: "2026-11-25T19:00:00-03:00"
  dataFim: string | null; // null quando a API não informa o término
  possuiHorario: boolean; // hackathons só informam o dia; eventos acadêmicos têm horário
  local: string;
  modalidade: Modalidade;
  link: string | null;
  imagem: string | null;
  organizador: string;
  temas: string[];
  vagas: number | null; // null = a API não informa limite de vagas
  situacao: SituacaoInformada;
  descricao: string;
  informacoesExtras: InformacaoExtra[];
  origem: OrigemEvento;
}

/** Os campos que o estudante preenche no formulário de inscrição. */
export interface DadosFormularioInscricao {
  nome: string;
  email: string;
  matricula: string;
  curso: string;
  observacao: string;
}

/** O nome de cada campo do formulário (útil para saber qual campo mudou). */
export type CampoFormulario = "nome" | "email" | "matricula" | "curso" | "observacao";

/**
 * Mensagens de erro do formulário. O "?" indica campo opcional:
 * se o campo não aparece no objeto, é porque ele não tem erro.
 */
export interface ErrosFormularioInscricao {
  nome?: string;
  email?: string;
  matricula?: string;
  curso?: string;
  observacao?: string;
}

/**
 * Uma inscrição salva no aparelho. "extends" significa que ela tem TODOS os campos
 * de DadosFormularioInscricao e mais os campos listados aqui.
 */
export interface Inscricao extends DadosFormularioInscricao {
  id: string;
  eventoId: string;
  tituloEvento: string;
  dataInicioEvento: string;
  criadaEm: string; // data ISO de quando a inscrição foi feita
}

/** Opções do filtro de data da lista de eventos. */
export type PeriodoFiltro = "todos" | "hoje" | "semana" | "mes";

/** Todos os filtros da lista de eventos juntos em um objeto. */
export interface FiltrosEventos {
  textoBusca: string;
  categoria: CategoriaEvento | "todas";
  periodo: PeriodoFiltro;
  modalidade: Modalidade | "todas";
  mostrarEncerrados: boolean;
}
