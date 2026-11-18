/**
 * ARQUIVO: src/utilitarios/statusEvento.ts
 *
 * PARA QUE SERVE?
 * Decide se um evento está "aberto", "encerrado" ou "indisponivel", e monta a
 * mensagem que explica isso ao usuário.
 *
 * POR QUE CALCULAR AQUI, E NÃO CONFIAR SÓ NA API?
 * 1. O tempo passa: um evento salvo nos favoritos semana passada pode já ter
 *    terminado hoje. Por isso o status é calculado na hora de mostrar.
 * 2. A API pode estar desatualizada. Exemplo real: a API de hackathons manda
 *    isOpen = "open" em eventos cuja data de término já passou.
 */
import { Evento, StatusEvento } from "../tipos/evento";
import { formatarDataCurta } from "./formatarData";

/** Texto que aparece na etiqueta de cada status. */
export const ROTULOS_STATUS: Record<StatusEvento, string> = {
  aberto: "Aberto",
  encerrado: "Encerrado",
  indisponivel: "Indisponível",
};

/**
 * Descobre quando o evento termina.
 *
 * Recebe: um Evento.
 * Devolve: a data de término. Se a API não informou o fim, usamos a data de
 * início (consideramos que o evento termina quando começa).
 */
export function obterDataTermino(evento: Evento): Date {
  return new Date(evento.dataFim ?? evento.dataInicio);
}

/**
 * Diz se o evento já terminou.
 *
 * Recebe: o evento e o momento atual. "agora = new Date()" é um parâmetro com
 * valor padrão: se ninguém passar nada, usa a data e hora atuais.
 * Devolve: true se a data de término já passou.
 */
export function eventoJaTerminou(evento: Evento, agora: Date = new Date()): boolean {
  return obterDataTermino(evento) < agora;
}

/**
 * Calcula o status do evento. A ORDEM das verificações importa:
 * 1. Cancelado → indisponível (mesmo que a data ainda não tenha chegado).
 * 2. Já terminou (ou a API diz que encerrou) → encerrado.
 * 3. Sem vagas → indisponível.
 * 4. Nenhum dos casos acima → aberto.
 *
 * Recebe: o evento e o momento atual.
 * Devolve: "aberto", "encerrado" ou "indisponivel".
 */
export function calcularStatusEvento(evento: Evento, agora: Date = new Date()): StatusEvento {
  if (evento.situacao === "cancelado") {
    return "indisponivel";
  }
  if (evento.situacao === "encerrado" || eventoJaTerminou(evento, agora)) {
    return "encerrado";
  }
  if (evento.situacao === "esgotado" || evento.vagas === 0) {
    return "indisponivel";
  }
  return "aberto";
}

/**
 * Monta uma frase explicando o status, para mostrar ao usuário quando o botão
 * de inscrição está bloqueado.
 *
 * Recebe: o evento e o momento atual.
 * Devolve: a mensagem em português.
 */
export function obterMensagemStatus(evento: Evento, agora: Date = new Date()): string {
  const status = calcularStatusEvento(evento, agora);

  if (status === "aberto") {
    return "As inscrições estão abertas.";
  }
  if (status === "encerrado") {
    if (eventoJaTerminou(evento, agora)) {
      const termino = formatarDataCurta(obterDataTermino(evento));
      return `Este evento terminou em ${termino}. Não é mais possível se inscrever.`;
    }
    return "O organizador encerrou as inscrições deste evento.";
  }
  if (evento.situacao === "cancelado") {
    return "Este evento foi cancelado pelo organizador. As inscrições foram bloqueadas.";
  }
  return "As vagas deste evento acabaram. As inscrições foram bloqueadas.";
}

/**
 * Atalho para saber se o botão de inscrição deve ficar liberado.
 * Recebe: o evento → Devolve: true se o status for "aberto".
 */
export function podeSeInscrever(evento: Evento, agora: Date = new Date()): boolean {
  return calcularStatusEvento(evento, agora) === "aberto";
}
