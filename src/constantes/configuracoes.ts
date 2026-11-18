/**
 * ARQUIVO: src/constantes/configuracoes.ts
 *
 * PARA QUE SERVE?
 * Junta em um só lugar os valores "fixos" do app: endereços das APIs, tempo
 * limite das requisições, lista de categorias, chaves do AsyncStorage, etc.
 *
 * POR QUÊ?
 * Se a URL da API mudar, alteramos só aqui, e não em vários arquivos.
 * Constantes costumam ser escritas em LETRAS_MAIUSCULAS para destacar que
 * não mudam enquanto o app roda.
 */
import { CategoriaEvento, Modalidade, PeriodoFiltro } from "../tipos/evento";
import { NomeIcone } from "../tipos/icones";

/* ---------- APIs ---------- */

/** API pública de hackathons (não precisa de chave). */
export const URL_API_HACKATHONS = "https://webdevharsha.github.io/open-hackathons-api/data.json";

/**
 * URL da API acadêmica (palestras, oficinas, semanas acadêmicas, eventos profissionais).
 *
 * COMO CONFIGURAR (veja o README):
 * 1. Crie um projeto no https://mockapi.io e um recurso chamado "eventos".
 * 2. Cole o conteúdo de dados/eventosAcademicos.json nos dados do recurso.
 * 3. Coloque aqui a URL, por exemplo:
 *    "https://6745abc123def.mockapi.io/api/v1/eventos"
 *
 * Enquanto este valor estiver VAZIO, o app usa o arquivo local
 * dados/eventosAcademicos.json. Assim ele funciona logo na primeira vez que rodar.
 */
export const URL_API_ACADEMICA = "";

/** Tempo máximo (em milissegundos) de espera por uma API. 10000 ms = 10 segundos. */
export const TEMPO_LIMITE_REQUISICAO_MS = 10000;

/* ---------- Categorias e filtros ---------- */

export const CATEGORIAS: CategoriaEvento[] = [
  "Palestra",
  "Oficina",
  "Hackathon",
  "Semana Acadêmica",
  "Evento Profissional",
];

/** Ícone que representa cada categoria (usado quando o evento não tem imagem). */
export const ICONES_CATEGORIAS: Record<CategoriaEvento, NomeIcone> = {
  Palestra: "mic-outline",
  Oficina: "construct-outline",
  Hackathon: "code-slash-outline",
  "Semana Acadêmica": "school-outline",
  "Evento Profissional": "briefcase-outline",
};

export const OPCOES_PERIODO: { valor: PeriodoFiltro; rotulo: string }[] = [
  { valor: "todos", rotulo: "Qualquer data" },
  { valor: "hoje", rotulo: "Hoje" },
  { valor: "semana", rotulo: "Esta semana" },
  { valor: "mes", rotulo: "Este mês" },
];

export const OPCOES_MODALIDADE: { valor: Modalidade | "todas"; rotulo: string }[] = [
  { valor: "todas", rotulo: "Todas" },
  { valor: "Presencial", rotulo: "Presencial" },
  { valor: "Online", rotulo: "Online" },
];

/* ---------- Armazenamento local (AsyncStorage) ---------- */

/**
 * O AsyncStorage guarda dados no formato "chave → texto".
 * O prefixo "@agendaEstudante:" evita conflito com chaves de outras bibliotecas.
 */
export const CHAVES_ARMAZENAMENTO = {
  favoritos: "@agendaEstudante:favoritos",
  inscricoes: "@agendaEstudante:inscricoes",
  lembretes: "@agendaEstudante:lembretes",
};

/* ---------- Notificações ---------- */

/** Canal de notificação do Android (veja servicos/servicoNotificacoes.ts). */
export const CANAL_LEMBRETES = {
  id: "lembretes-eventos",
  nome: "Lembretes de eventos",
};

/** Quantos minutos antes do evento o lembrete deve tocar. */
export const ANTECEDENCIA_LEMBRETE_MINUTOS = 60;

/* ---------- Formulário de inscrição ---------- */

export const LIMITES_FORMULARIO = {
  nomeMinimo: 3,
  matriculaMinima: 5,
  matriculaMaxima: 15,
  cursoMinimo: 3,
  observacaoMaxima: 300,
};
