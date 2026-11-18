/**
 * ARQUIVO: src/utilitarios/conversoresEventos.ts
 *
 * PARA QUE SERVE?
 * Transforma o JSON de cada API no formato único "Evento" do app.
 *
 *   JSON da API de hackathons ──► converterHackathonParaEvento ──┐
 *                                                                ├──► Evento
 *   JSON da API acadêmica ──────► converterEventoAcademico ──────┘
 *
 * Os conversores também protegem o app contra dados ruins: se um item do JSON
 * vier sem um campo obrigatório ou com uma data que não dá para entender,
 * a função devolve null e esse item é ignorado (em vez de quebrar a tela).
 */
import { CATEGORIAS } from "../constantes/configuracoes";
import { CategoriaEvento, Evento, InformacaoExtra, SituacaoInformada } from "../tipos/evento";
import { EventoAcademicoApi, HackathonApi } from "../tipos/respostasApi";
import { formatarDataCurta } from "./formatarData";
import { normalizarTexto, removerTagsHtml } from "./texto";

/* =====================================================================
 * PARTE 1 — API DE HACKATHONS
 * ===================================================================== */

/** Abreviações dos meses em inglês, na ordem (a posição na lista é o número do mês). */
const MESES_EM_INGLES = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];

/** Pedaço de uma data lida do texto. "null" = essa parte não estava escrita. */
interface ParteDaData {
  mes: number | null;
  dia: number;
  ano: number | null;
}

/**
 * Lê UM lado do período escrito pela API de hackathons.
 *
 * Recebe textos como:
 *   "May 15"       → { mes: 4,    dia: 15, ano: null }
 *   "Jun 30, 2026" → { mes: 5,    dia: 30, ano: 2026 }
 *   "21, 2026"     → { mes: null, dia: 21, ano: 2026 }  (mês igual ao do início)
 * Devolve: as partes encontradas, ou null se o texto não estiver no formato esperado.
 */
function lerParteDaData(texto: string): ParteDaData | null {
  // Troca a vírgula por espaço e separa as palavras: "Jun 30, 2026" → ["Jun", "30", "2026"]
  const palavras = texto.replace(",", " ").split(" ").filter((palavra) => palavra !== "");
  if (palavras.length === 0) {
    return null;
  }

  let mes: number | null = null;

  // Se a primeira palavra não é um número, ela é o mês ("May").
  if (isNaN(Number(palavras[0]))) {
    mes = MESES_EM_INGLES.indexOf(palavras[0].slice(0, 3).toLowerCase());
    if (mes === -1) {
      return null; // não é um mês conhecido
    }
    palavras.shift(); // remove o mês da lista; sobram dia e (talvez) ano
  }

  const dia = Number(palavras[0]);
  const ano = palavras.length > 1 ? Number(palavras[1]) : null;

  if (isNaN(dia) || (ano !== null && isNaN(ano))) {
    return null;
  }
  return { mes, dia, ano };
}

/**
 * Cria uma data e confere se ela realmente existe.
 *
 * Por quê? new Date(2026, 1, 31) não dá erro: o JavaScript "pula" para 3 de março.
 * Se o dia ou o mês mudou, a data original era inválida e devolvemos null.
 */
function criarDataSegura(ano: number, mes: number, dia: number, hora: number, minuto: number): Date | null {
  const data = new Date(ano, mes, dia, hora, minuto, 0);
  if (data.getDate() !== dia || data.getMonth() !== mes) {
    return null;
  }
  return data;
}

/**
 * Converte o período de submissão do hackathon em datas de início e fim.
 *
 * Recebe: textos como "May 15 - 21, 2026", "May 15 - Jun 30, 2026" ou
 *         "Mar 24, 2026 - Mar 24, 2030".
 * Devolve: { inicio, fim } ou null se não conseguir entender o texto.
 *
 * O início começa às 00:00 e o fim vai até 23:59, porque a API não informa horário.
 */
function converterPeriodoHackathon(periodo: string): { inicio: Date; fim: Date } | null {
  const partes = periodo.split(" - ");
  if (partes.length !== 2) {
    return null;
  }

  const inicio = lerParteDaData(partes[0]);
  const fim = lerParteDaData(partes[1]);

  // O início precisa ter mês e o fim precisa ter ano; o resto conseguimos deduzir.
  if (!inicio || !fim || inicio.mes === null || fim.ano === null) {
    return null;
  }

  const mesFim = fim.mes ?? inicio.mes; // "May 15 - 21": o fim está no mesmo mês do início

  // Se o início não tem ano, usamos o ano do fim. Mas em "Dec 20 - Jan 10, 2027"
  // o início é do ano anterior (o mês de início vem "depois" do mês de fim).
  let anoInicio = inicio.ano ?? fim.ano;
  if (inicio.ano === null && inicio.mes > mesFim) {
    anoInicio = fim.ano - 1;
  }

  const dataInicio = criarDataSegura(anoInicio, inicio.mes, inicio.dia, 0, 0);
  const dataFim = criarDataSegura(fim.ano, mesFim, fim.dia, 23, 59);

  if (!dataInicio || !dataFim) {
    return null;
  }
  return { inicio: dataInicio, fim: dataFim };
}

/**
 * Corrige o endereço da imagem do hackathon.
 *
 * Recebe: a URL da API (pode ser null).
 * Devolve: uma URL que o componente <Image> consegue carregar, ou null.
 *
 * Por quê? Alguns endereços vêm sem "https:" (ex.: "//d112y...jpg"), e o <Image>
 * não sabe abrir. Já a imagem "thumbnail-placeholder" é um GIF genérico, sem
 * informação; nesse caso preferimos mostrar o ícone da categoria.
 */
function corrigirUrlImagem(url: string | null): string | null {
  if (!url || url.includes("thumbnail-placeholder")) {
    return null;
  }
  if (url.startsWith("//")) {
    return "https:" + url;
  }
  return url;
}

/**
 * Junta as informações que só os hackathons têm (prêmio, inscritos, plataforma).
 * Recebe: o hackathon da API → Devolve: lista de { rotulo, valor }.
 */
function montarInformacoesExtrasHackathon(hackathon: HackathonApi): InformacaoExtra[] {
  const extras: InformacaoExtra[] = [];

  if (hackathon.prizeText) {
    const premio = removerTagsHtml(hackathon.prizeText);
    if (premio !== "" && premio !== "$0") {
      extras.push({ rotulo: "Prêmio", valor: premio });
    }
  }
  if (typeof hackathon.registrations_count === "number") {
    extras.push({ rotulo: "Participantes inscritos", valor: String(hackathon.registrations_count) });
  }
  if (hackathon.source) {
    // "devpost" → "Devpost" (primeira letra maiúscula)
    const plataforma = hackathon.source.charAt(0).toUpperCase() + hackathon.source.slice(1);
    extras.push({ rotulo: "Plataforma", valor: plataforma });
  }
  return extras;
}

/**
 * Converte UM hackathon do JSON da API no formato Evento do app.
 *
 * Recebe: um item da lista "hackathons" do JSON.
 * Devolve: o Evento pronto, ou null se faltar informação essencial.
 */
export function converterHackathonParaEvento(hackathon: HackathonApi): Evento | null {
  // Sem título ou sem período não dá para mostrar o evento.
  if (typeof hackathon.title !== "string" || typeof hackathon.submission_period_dates !== "string") {
    return null;
  }

  const periodo = converterPeriodoHackathon(hackathon.submission_period_dates);
  if (!periodo) {
    return null;
  }

  const local = (hackathon.displayed_location ?? "").trim();
  const organizador = (hackathon.organization_name ?? "").trim() || "Não informado";
  const temas = (hackathon.themes ?? []).map((tema) => tema.name).filter((nome) => typeof nome === "string");

  return {
    id: `hackathon-${hackathon.id}`,
    titulo: hackathon.title.trim(),
    categoria: "Hackathon",
    dataInicio: periodo.inicio.toISOString(),
    dataFim: periodo.fim.toISOString(),
    possuiHorario: false,
    local: local === "" || local === "TBD" ? "A definir" : local,
    // "Online" ou "Auditório X + Online": dá para participar pela internet
    modalidade: local.toLowerCase().includes("online") ? "Online" : "Presencial",
    link: hackathon.url || null,
    imagem: corrigirUrlImagem(hackathon.thumbnail_url),
    organizador,
    temas,
    vagas: null, // a API de hackathons não informa limite de vagas
    situacao: hackathon.isOpen === "ended" ? "encerrado" : "disponivel",
    // Usamos as datas já convertidas (em português), e não o texto original da
    // API ("May 15 - Jun 30, 2026"), que apareceria em inglês na tela.
    descricao:
      `Hackathon organizado por ${organizador}. ` +
      `Período de submissão dos projetos: de ${formatarDataCurta(periodo.inicio)} a ${formatarDataCurta(periodo.fim)}. ` +
      "O regulamento completo está na página oficial do evento.",
    informacoesExtras: montarInformacoesExtrasHackathon(hackathon),
    origem: "hackathons",
  };
}

/**
 * Converte a lista inteira de hackathons, descartando os itens inválidos.
 * Recebe: a lista do JSON → Devolve: só os eventos que deram certo.
 */
export function converterListaHackathons(lista: HackathonApi[]): Evento[] {
  const eventos: Evento[] = [];
  for (const hackathon of lista) {
    const evento = converterHackathonParaEvento(hackathon);
    if (evento) {
      eventos.push(evento);
    }
  }
  return eventos;
}

/* =====================================================================
 * PARTE 2 — API ACADÊMICA
 * ===================================================================== */

/**
 * Encontra a categoria do app que corresponde ao "tipo" escrito na API.
 *
 * Recebe: um texto como "Semana Academica" ou "semana acadêmica".
 * Devolve: "Semana Acadêmica" (a categoria oficial), ou null se não existir.
 *
 * Comparamos os textos normalizados (sem acento e em minúsculas) para aceitar
 * pequenas diferenças de digitação de quem cadastrou os dados.
 */
function encontrarCategoria(tipo: string): CategoriaEvento | null {
  for (const categoria of CATEGORIAS) {
    if (normalizarTexto(categoria) === normalizarTexto(tipo)) {
      return categoria;
    }
  }
  return null;
}

/**
 * Converte o texto de situação da API em um valor conhecido.
 * Recebe: ex.: "Esgotado" → Devolve: "esgotado". Valor desconhecido → "disponivel".
 */
function converterSituacao(texto: string | undefined): SituacaoInformada {
  const situacao = normalizarTexto(texto ?? "");
  if (situacao === "esgotado" || situacao === "cancelado" || situacao === "encerrado") {
    return situacao;
  }
  return "disponivel";
}

/**
 * Converte um texto de data ISO em Date, conferindo se é uma data válida.
 * Recebe: "2026-11-25T19:00:00-03:00" → Devolve: Date, ou null se for inválido.
 */
function lerDataIso(texto: string | undefined): Date | null {
  if (!texto) {
    return null;
  }
  const data = new Date(texto);
  // Quando o texto não é uma data, getTime() devolve NaN ("não é um número").
  return isNaN(data.getTime()) ? null : data;
}

/**
 * Converte UM evento da API acadêmica no formato Evento do app.
 *
 * Recebe: um item do JSON da API acadêmica.
 * Devolve: o Evento pronto, ou null se faltar informação essencial.
 */
export function converterEventoAcademico(item: EventoAcademicoApi): Evento | null {
  if (typeof item.titulo !== "string" || typeof item.tipo !== "string") {
    return null;
  }

  const categoria = encontrarCategoria(item.tipo);
  const dataInicio = lerDataIso(item.data);
  if (!categoria || !dataInicio) {
    return null;
  }

  const dataFim = lerDataIso(item.dataFim);
  const organizador = item.organizador || "Não informado";

  return {
    id: `academico-${item.id}`,
    titulo: item.titulo.trim(),
    categoria,
    dataInicio: dataInicio.toISOString(),
    dataFim: dataFim ? dataFim.toISOString() : null,
    possuiHorario: true,
    local: item.local || "A definir",
    modalidade: normalizarTexto(item.modalidade ?? "") === "online" ? "Online" : "Presencial",
    link: item.link || null,
    imagem: item.imagem || null,
    organizador,
    temas: Array.isArray(item.temas) ? item.temas : [],
    vagas: typeof item.vagas === "number" ? item.vagas : null,
    situacao: converterSituacao(item.situacao),
    descricao: item.descricao || `Evento organizado por ${organizador}.`,
    informacoesExtras: [],
    origem: "academica",
  };
}

/**
 * Converte a lista inteira da API acadêmica, descartando os itens inválidos.
 * Recebe: a lista do JSON → Devolve: só os eventos que deram certo.
 */
export function converterListaEventosAcademicos(lista: EventoAcademicoApi[]): Evento[] {
  const eventos: Evento[] = [];
  for (const item of lista) {
    const evento = converterEventoAcademico(item);
    if (evento) {
      eventos.push(evento);
    }
  }
  return eventos;
}
