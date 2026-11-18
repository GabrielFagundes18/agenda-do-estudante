/**
 * ARQUIVO: src/servicos/servicoApi.ts
 *
 * PARA QUE SERVE?
 * Toda a comunicação com as APIs fica aqui: fazer a requisição, tratar os erros
 * e entregar os eventos já convertidos para o formato do app.
 *
 * As telas NUNCA chamam fetch diretamente. Elas usam o gancho useEventos, que
 * chama este serviço. Assim, se a API mudar, mexemos só aqui.
 *
 * CONCEITO: async / await
 * Buscar dados na internet demora. Uma função "async" pode usar "await" para
 * esperar o resultado de uma operação demorada (uma Promise) sem travar o app.
 * Enquanto espera, a tela continua respondendo ao usuário.
 *
 * CONCEITO: try / catch / finally
 * - try: tentamos executar um código que pode dar erro;
 * - catch: se der erro, o código pula para cá e tratamos o problema;
 * - finally: roda SEMPRE no final, com erro ou sem erro (bom para "limpezas").
 */
import eventosAcademicosLocais from "../../dados/eventosAcademicos.json";
import { TEMPO_LIMITE_REQUISICAO_MS, URL_API_ACADEMICA, URL_API_HACKATHONS } from "../constantes/configuracoes";
import { Evento } from "../tipos/evento";
import { EventoAcademicoApi, RespostaHackathonsApi } from "../tipos/respostasApi";
import { converterListaEventosAcademicos, converterListaHackathons } from "../utilitarios/conversoresEventos";

/** O que buscarTodosEventos devolve: os eventos e quais fontes falharam (se alguma). */
export interface ResultadoBuscaEventos {
  eventos: Evento[];
  fontesComFalha: string[];
}

/* ---------- Funções internas (usadas só neste arquivo) ---------- */

/**
 * Faz a requisição HTTP com TEMPO LIMITE.
 *
 * Recebe: a URL.
 * Devolve: a resposta do servidor (ainda sem ler o JSON).
 *
 * Por que um tempo limite? O fetch, sozinho, pode esperar MUITO tempo quando a
 * internet está ruim, e o usuário ficaria preso na tela de "carregando".
 * O AbortController permite cancelar o fetch: o setTimeout chama abort() depois
 * de 10 segundos, e o fetch é interrompido com erro.
 */
async function fazerRequisicao(url: string): Promise<Response> {
  const controlador = new AbortController();
  const temporizador = setTimeout(() => controlador.abort(), TEMPO_LIMITE_REQUISICAO_MS);

  try {
    return await fetch(url, {
      signal: controlador.signal,
      headers: { Accept: "application/json" },
    });
  } catch {
    // O fetch só cai aqui quando NÃO houve resposta: ou cancelamos por tempo,
    // ou não havia conexão. Erros HTTP (404, 500...) NÃO caem aqui.
    if (controlador.signal.aborted) {
      throw new Error("O servidor demorou demais para responder. Tente novamente em instantes.");
    }
    throw new Error("Sem conexão com a internet. Verifique sua rede e tente novamente.");
  } finally {
    clearTimeout(temporizador); // desliga o "cronômetro" para ele não disparar depois
  }
}

/**
 * Busca uma URL e devolve o JSON já lido, tratando os três tipos de erro:
 * 1. erro de rede ou tempo esgotado (tratado em fazerRequisicao);
 * 2. erro HTTP: o servidor respondeu, mas com status de erro (ex.: 404, 500);
 * 3. JSON inválido: o servidor respondeu algo que não é JSON.
 *
 * Recebe: a URL.
 * Devolve: o conteúdo do JSON. O tipo é "unknown" (desconhecido) porque ainda
 * não conferimos o formato; quem chama esta função faz essa conferência.
 */
async function buscarJson(url: string): Promise<unknown> {
  const resposta = await fazerRequisicao(url);

  // resposta.ok é true para status entre 200 e 299 (sucesso)
  if (!resposta.ok) {
    throw new Error(`O servidor respondeu com erro ${resposta.status}. Tente novamente mais tarde.`);
  }

  try {
    return await resposta.json();
  } catch {
    throw new Error("Os dados recebidos não estão em um formato válido (JSON inválido).");
  }
}

/**
 * Espera alguns milissegundos. Usada para simular o tempo de uma API de verdade
 * quando lemos o arquivo local (assim o estado "carregando" também aparece).
 */
function esperar(milissegundos: number): Promise<void> {
  return new Promise((resolver) => setTimeout(resolver, milissegundos));
}

/**
 * Lê os eventos acadêmicos do arquivo local dados/eventosAcademicos.json.
 * É usado enquanto a URL do MockAPI não for configurada em configuracoes.ts.
 */
async function carregarEventosAcademicosLocais(): Promise<Evento[]> {
  await esperar(800);
  return converterListaEventosAcademicos(eventosAcademicosLocais);
}

/* ---------- Funções públicas (usadas pelo resto do app) ---------- */

/**
 * Busca os hackathons na Open Hackathons API.
 *
 * Devolve: a lista de eventos convertidos.
 * Pode lançar erro: de rede, HTTP, JSON inválido ou formato inesperado.
 */
export async function buscarHackathons(): Promise<Evento[]> {
  const json = await buscarJson(URL_API_HACKATHONS);

  // "as" diz ao TypeScript qual formato ESPERAMOS. Como a internet pode mandar
  // qualquer coisa, logo abaixo conferimos se a lista "hackathons" existe mesmo.
  const resposta = json as RespostaHackathonsApi;
  if (!resposta || !Array.isArray(resposta.hackathons)) {
    throw new Error("A API de hackathons respondeu em um formato inesperado.");
  }
  return converterListaHackathons(resposta.hackathons);
}

/**
 * Busca palestras, oficinas, semanas acadêmicas e eventos profissionais.
 *
 * Se a URL do MockAPI estiver vazia em configuracoes.ts, usa o arquivo local.
 * Devolve: a lista de eventos convertidos.
 */
export async function buscarEventosAcademicos(): Promise<Evento[]> {
  if (URL_API_ACADEMICA === "") {
    return carregarEventosAcademicosLocais();
  }

  const json = await buscarJson(URL_API_ACADEMICA);

  // O MockAPI devolve diretamente uma lista: [ {...}, {...} ]
  if (!Array.isArray(json)) {
    throw new Error("A API acadêmica respondeu em um formato inesperado.");
  }
  return converterListaEventosAcademicos(json as EventoAcademicoApi[]);
}

/**
 * Pega a mensagem de um erro qualquer.
 * Recebe: o erro (pode ser qualquer coisa) → Devolve: um texto para mostrar.
 */
function obterMensagemDeErro(erro: unknown): string {
  return erro instanceof Error ? erro.message : "Ocorreu um erro inesperado.";
}

/**
 * Busca as DUAS fontes ao mesmo tempo e junta os resultados.
 *
 * CONCEITO: Promise.allSettled
 * Dispara as duas buscas em paralelo e espera AS DUAS terminarem, dando certo
 * ou não. Cada resultado vem com status "fulfilled" (deu certo) ou "rejected"
 * (deu erro).
 * Diferente do Promise.all, que falha inteiro se UMA das buscas falhar. Com o
 * allSettled, se a API de hackathons cair, os eventos acadêmicos continuam aparecendo.
 *
 * Devolve: { eventos, fontesComFalha }.
 * Lança erro: só se AS DUAS fontes falharem (aí a tela mostra o estado de erro).
 */
export async function buscarTodosEventos(): Promise<ResultadoBuscaEventos> {
  const [resultadoHackathons, resultadoAcademicos] = await Promise.allSettled([
    buscarHackathons(),
    buscarEventosAcademicos(),
  ]);

  if (resultadoHackathons.status === "rejected" && resultadoAcademicos.status === "rejected") {
    throw new Error(obterMensagemDeErro(resultadoHackathons.reason));
  }

  const eventos: Evento[] = [];
  const fontesComFalha: string[] = [];

  if (resultadoHackathons.status === "fulfilled") {
    eventos.push(...resultadoHackathons.value); // "..." coloca cada item da lista dentro de "eventos"
  } else {
    fontesComFalha.push("hackathons");
    console.warn("Falha na API de hackathons:", obterMensagemDeErro(resultadoHackathons.reason));
  }

  if (resultadoAcademicos.status === "fulfilled") {
    eventos.push(...resultadoAcademicos.value);
  } else {
    fontesComFalha.push("eventos acadêmicos");
    console.warn("Falha na API acadêmica:", obterMensagemDeErro(resultadoAcademicos.reason));
  }

  return { eventos, fontesComFalha };
}
