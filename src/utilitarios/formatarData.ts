/**
 * ARQUIVO: src/utilitarios/formatarData.ts
 *
 * PARA QUE SERVE?
 * Transforma datas (objetos Date) em textos amigáveis em português,
 * como "ter, 18 de nov. de 2026 • 19:00".
 *
 * Por que não usar uma biblioteca de datas? Para este app, poucas funções
 * resolvem, e assim conseguimos entender exatamente o que cada uma faz.
 *
 * LEMBRETE: em JavaScript, os meses começam em ZERO (janeiro = 0, dezembro = 11)
 * e getDay() devolve o dia da semana (domingo = 0, sábado = 6).
 */
import { Evento } from "../tipos/evento";

const DIAS_DA_SEMANA = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];
const MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

/**
 * Coloca um zero à esquerda quando o número tem só um dígito.
 * Recebe: 5 → Devolve: "05". Recebe: 12 → Devolve: "12".
 */
function doisDigitos(numero: number): string {
  return String(numero).padStart(2, "0");
}

/**
 * Formata a data no padrão brasileiro curto.
 * Recebe: uma Date → Devolve: "18/11/2026".
 */
export function formatarDataCurta(data: Date): string {
  const dia = doisDigitos(data.getDate());
  const mes = doisDigitos(data.getMonth() + 1); // +1 porque os meses começam em zero
  return `${dia}/${mes}/${data.getFullYear()}`;
}

/**
 * Formata só o horário.
 * Recebe: uma Date → Devolve: "19:00".
 */
export function formatarHora(data: Date): string {
  return `${doisDigitos(data.getHours())}:${doisDigitos(data.getMinutes())}`;
}

/**
 * Formata data e hora juntas.
 * Recebe: uma Date → Devolve: "18/11/2026 às 19:00".
 */
export function formatarDataHora(data: Date): string {
  return `${formatarDataCurta(data)} às ${formatarHora(data)}`;
}

/**
 * Formata a data por extenso (abreviada), com o dia da semana.
 * Recebe: uma Date → Devolve: "ter, 18 de nov. de 2026".
 */
export function formatarDataPorExtenso(data: Date): string {
  const diaDaSemana = DIAS_DA_SEMANA[data.getDay()];
  const mes = MESES[data.getMonth()];
  return `${diaDaSemana}, ${data.getDate()} de ${mes}. de ${data.getFullYear()}`;
}

/**
 * Diz se duas datas caem no mesmo dia do calendário (ignora o horário).
 * Recebe: duas Date → Devolve: true ou false.
 */
export function saoMesmoDia(dataA: Date, dataB: Date): boolean {
  return (
    dataA.getFullYear() === dataB.getFullYear() &&
    dataA.getMonth() === dataB.getMonth() &&
    dataA.getDate() === dataB.getDate()
  );
}

/**
 * Monta o texto de "quando" o evento acontece, escolhendo o formato certo.
 *
 * Recebe: um Evento.
 * Devolve, conforme o caso:
 *  - evento de vários dias:        "15/05/2026 a 21/05/2026"
 *  - evento sem horário (1 dia):   "sex, 15 de mai. de 2026"
 *  - com início e fim no mesmo dia: "ter, 18 de nov. de 2026 • 19:00 às 21:00"
 *  - só com horário de início:     "ter, 18 de nov. de 2026 • 19:00"
 */
export function formatarPeriodoEvento(evento: Evento): string {
  const inicio = new Date(evento.dataInicio);
  const fim = evento.dataFim ? new Date(evento.dataFim) : null;

  if (fim && !saoMesmoDia(inicio, fim)) {
    return `${formatarDataCurta(inicio)} a ${formatarDataCurta(fim)}`;
  }

  const dia = formatarDataPorExtenso(inicio);

  if (!evento.possuiHorario) {
    return dia;
  }
  if (fim) {
    return `${dia} • ${formatarHora(inicio)} às ${formatarHora(fim)}`;
  }
  return `${dia} • ${formatarHora(inicio)}`;
}
