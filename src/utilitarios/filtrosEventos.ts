/**
 * ARQUIVO: src/utilitarios/filtrosEventos.ts
 *
 * PARA QUE SERVE?
 * Aplica a busca por texto e os filtros (categoria, data, modalidade e
 * "mostrar encerrados") sobre a lista de eventos, e ordena o resultado.
 *
 * São funções "puras": recebem dados e devolvem dados, sem mexer em tela nem em
 * estado. Isso facilita entender e testar cada regra separadamente.
 */
import { Evento, FiltrosEventos, PeriodoFiltro } from "../tipos/evento";
import { eventoJaTerminou, obterDataTermino } from "./statusEvento";
import { normalizarTexto } from "./texto";

/** Filtros com que a tela começa (e para onde volta ao tocar em "Limpar filtros"). */
export const FILTROS_INICIAIS: FiltrosEventos = {
  textoBusca: "",
  categoria: "todas",
  periodo: "todos",
  modalidade: "todas",
  mostrarEncerrados: false,
};

/* ---------- Ajudantes de data ---------- */

/** Recebe uma data → Devolve o mesmo dia às 00:00:00. */
function inicioDoDia(data: Date): Date {
  return new Date(data.getFullYear(), data.getMonth(), data.getDate(), 0, 0, 0);
}

/** Recebe uma data → Devolve o mesmo dia às 23:59:59. */
function fimDoDia(data: Date): Date {
  return new Date(data.getFullYear(), data.getMonth(), data.getDate(), 23, 59, 59);
}

/**
 * Recebe uma data → Devolve o domingo daquela semana, às 23:59:59.
 * Consideramos a semana de segunda a domingo. getDay(): domingo = 0 ... sábado = 6.
 * Ex.: numa quarta (3), faltam (7 - 3) % 7 = 4 dias até domingo.
 */
function fimDaSemana(data: Date): Date {
  const diasAteDomingo = (7 - data.getDay()) % 7;
  const domingo = new Date(data.getFullYear(), data.getMonth(), data.getDate() + diasAteDomingo);
  return fimDoDia(domingo);
}

/**
 * Recebe uma data → Devolve o último dia daquele mês, às 23:59:59.
 * Truque comum: o "dia 0" do mês seguinte é o último dia do mês atual.
 */
function fimDoMes(data: Date): Date {
  return new Date(data.getFullYear(), data.getMonth() + 1, 0, 23, 59, 59);
}

/**
 * Calcula até quando vai o período escolhido no filtro.
 * Recebe: o período e a data atual → Devolve: a data final do período.
 */
function calcularFimDoPeriodo(periodo: PeriodoFiltro, agora: Date): Date {
  if (periodo === "hoje") {
    return fimDoDia(agora);
  }
  if (periodo === "semana") {
    return fimDaSemana(agora);
  }
  return fimDoMes(agora); // "mes"
}

/* ---------- Regras de cada filtro ---------- */

/**
 * Confere se o evento combina com o texto digitado na busca.
 * Procura no título, organizador, local, categoria e temas, sem ligar para acentos.
 * Recebe: o evento e o texto → Devolve: true se encontrou (ou se a busca está vazia).
 */
function correspondeABusca(evento: Evento, textoBusca: string): boolean {
  const busca = normalizarTexto(textoBusca);
  if (busca === "") {
    return true;
  }
  const textoDoEvento = [evento.titulo, evento.organizador, evento.local, evento.categoria, ...evento.temas].join(" ");
  return normalizarTexto(textoDoEvento).includes(busca);
}

/**
 * Confere se o evento acontece dentro do período escolhido (hoje, semana, mês).
 *
 * Um evento de vários dias (ex.: hackathon de 15 a 30) aparece em "Esta semana"
 * se QUALQUER dia dele cair na semana. A regra é: o evento começa antes de o
 * período acabar E termina depois de o período começar.
 */
function correspondeAoPeriodo(evento: Evento, periodo: PeriodoFiltro, agora: Date): boolean {
  if (periodo === "todos") {
    return true;
  }
  const inicioPeriodo = inicioDoDia(agora);
  const fimPeriodo = calcularFimDoPeriodo(periodo, agora);
  const inicioEvento = new Date(evento.dataInicio);
  const fimEvento = obterDataTermino(evento);

  return inicioEvento <= fimPeriodo && fimEvento >= inicioPeriodo;
}

/* ---------- Funções usadas pelas telas ---------- */

/**
 * Ordena os eventos: primeiro os que ainda vão acontecer (do mais próximo para
 * o mais distante); os que já terminaram vão para o final.
 *
 * Recebe: a lista de eventos → Devolve: uma NOVA lista ordenada.
 * Usamos [...eventos] para copiar a lista, porque o sort() altera a lista original.
 */
export function ordenarEventos(eventos: Evento[], agora: Date = new Date()): Evento[] {
  return [...eventos].sort((eventoA, eventoB) => {
    const aTerminou = eventoJaTerminou(eventoA, agora);
    const bTerminou = eventoJaTerminou(eventoB, agora);

    if (aTerminou !== bTerminou) {
      return aTerminou ? 1 : -1; // número positivo = A vai depois de B
    }
    return new Date(eventoA.dataInicio).getTime() - new Date(eventoB.dataInicio).getTime();
  });
}

/**
 * Aplica TODOS os filtros e devolve a lista pronta para a FlatList.
 *
 * Recebe: a lista completa, os filtros escolhidos e a data atual.
 * Devolve: só os eventos que passaram em todos os filtros, já ordenados.
 */
export function filtrarEventos(eventos: Evento[], filtros: FiltrosEventos, agora: Date = new Date()): Evento[] {
  const filtrados = eventos.filter((evento) => {
    const passaNaCategoria = filtros.categoria === "todas" || evento.categoria === filtros.categoria;
    const passaNaModalidade = filtros.modalidade === "todas" || evento.modalidade === filtros.modalidade;
    const passaNoStatus = filtros.mostrarEncerrados || !eventoJaTerminou(evento, agora);

    return (
      passaNaCategoria &&
      passaNaModalidade &&
      passaNoStatus &&
      correspondeABusca(evento, filtros.textoBusca) &&
      correspondeAoPeriodo(evento, filtros.periodo, agora)
    );
  });

  return ordenarEventos(filtrados, agora);
}

/**
 * Conta quantos filtros "extras" estão ligados (data, modalidade e encerrados).
 * Serve para o botão "Mais filtros (2)" avisar que há filtros escondidos ativos.
 */
export function contarFiltrosExtrasAtivos(filtros: FiltrosEventos): number {
  let quantidade = 0;
  if (filtros.periodo !== "todos") {
    quantidade++;
  }
  if (filtros.modalidade !== "todas") {
    quantidade++;
  }
  if (filtros.mostrarEncerrados) {
    quantidade++;
  }
  return quantidade;
}
