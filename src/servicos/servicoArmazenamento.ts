/**
 * ARQUIVO: src/servicos/servicoArmazenamento.ts
 *
 * PARA QUE SERVE?
 * Salva e lê dados no próprio aparelho: favoritos, inscrições e os
 * identificadores dos lembretes agendados.
 *
 * CONCEITO: AsyncStorage
 * É um "armazém" simples de chave → texto que fica salvo no celular, mesmo depois
 * de fechar o app. Funciona parecido com o localStorage do navegador, mas é
 * ASSÍNCRONO (por isso usamos await em getItem e setItem).
 *
 * Como ele só guarda TEXTO, usamos:
 * - JSON.stringify(objeto) → transforma o objeto/lista em texto para salvar;
 * - JSON.parse(texto)      → transforma o texto salvo de volta em objeto/lista.
 *
 * Observação: estas funções não tratam erros com try/catch. Quem chama
 * (os ganchos) trata o erro e decide o que mostrar na tela.
 */
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CHAVES_ARMAZENAMENTO } from "../constantes/configuracoes";
import { DadosFormularioInscricao, Evento, Inscricao } from "../tipos/evento";

/**
 * Formato dos lembretes salvos: para cada id de evento, o id da notificação.
 * Ex.: { "academico-1": "a1b2c3", "hackathon-30078": "d4e5f6" }
 */
interface LembretesSalvos {
  [eventoId: string]: string;
}

/* =====================================================================
 * FAVORITOS
 * ===================================================================== */

/**
 * Lê a lista de eventos favoritos.
 * Devolve: a lista salva, ou uma lista vazia se ainda não houver favoritos.
 *
 * Salvamos o evento INTEIRO (e não só o id) para a tela de Favoritos funcionar
 * mesmo sem internet.
 */
export async function buscarFavoritos(): Promise<Evento[]> {
  const textoSalvo = await AsyncStorage.getItem(CHAVES_ARMAZENAMENTO.favoritos);
  return textoSalvo ? JSON.parse(textoSalvo) : [];
}

/** Grava a lista de favoritos inteira (substitui a anterior). */
async function gravarFavoritos(favoritos: Evento[]): Promise<void> {
  await AsyncStorage.setItem(CHAVES_ARMAZENAMENTO.favoritos, JSON.stringify(favoritos));
}

/**
 * Adiciona um evento aos favoritos (se ele ainda não estiver lá).
 * Recebe: o evento → Devolve: a lista de favoritos atualizada.
 */
export async function salvarFavorito(evento: Evento): Promise<Evento[]> {
  const favoritos = await buscarFavoritos();
  const jaExiste = favoritos.some((favorito) => favorito.id === evento.id);

  if (jaExiste) {
    return favoritos;
  }
  const novaLista = [...favoritos, evento];
  await gravarFavoritos(novaLista);
  return novaLista;
}

/**
 * Remove um evento dos favoritos.
 * Recebe: o id do evento → Devolve: a lista de favoritos atualizada.
 */
export async function removerFavorito(eventoId: string): Promise<Evento[]> {
  const favoritos = await buscarFavoritos();
  const novaLista = favoritos.filter((favorito) => favorito.id !== eventoId);
  await gravarFavoritos(novaLista);
  return novaLista;
}

/* =====================================================================
 * INSCRIÇÕES
 * ===================================================================== */

/** Lê todas as inscrições feitas neste aparelho. */
export async function buscarInscricoes(): Promise<Inscricao[]> {
  const textoSalvo = await AsyncStorage.getItem(CHAVES_ARMAZENAMENTO.inscricoes);
  return textoSalvo ? JSON.parse(textoSalvo) : [];
}

/**
 * Procura a inscrição feita em um evento específico.
 * Recebe: o id do evento → Devolve: a inscrição, ou null se não houver.
 */
export async function buscarInscricaoDoEvento(eventoId: string): Promise<Inscricao | null> {
  const inscricoes = await buscarInscricoes();
  const encontrada = inscricoes.find((inscricao) => inscricao.eventoId === eventoId);
  return encontrada ?? null; // find devolve undefined quando não acha; trocamos por null
}

/**
 * Salva a inscrição em um evento.
 *
 * Recebe: o evento e os dados do formulário (já validados).
 * Devolve: a inscrição criada.
 *
 * Regra: só existe UMA inscrição por evento. Se a pessoa se inscrever de novo,
 * a inscrição antiga é substituída pela nova (assim ela consegue corrigir dados).
 */
export async function salvarInscricao(evento: Evento, dados: DadosFormularioInscricao): Promise<Inscricao> {
  const novaInscricao: Inscricao = {
    ...dados, // copia nome, email, matricula, curso e observacao
    id: `${evento.id}-${Date.now()}`, // Date.now() = milissegundos desde 1970, nunca se repete
    eventoId: evento.id,
    tituloEvento: evento.titulo,
    dataInicioEvento: evento.dataInicio,
    criadaEm: new Date().toISOString(),
  };

  const inscricoes = await buscarInscricoes();
  const outrasInscricoes = inscricoes.filter((inscricao) => inscricao.eventoId !== evento.id);
  const novaLista = [...outrasInscricoes, novaInscricao];

  await AsyncStorage.setItem(CHAVES_ARMAZENAMENTO.inscricoes, JSON.stringify(novaLista));
  return novaInscricao;
}

/* =====================================================================
 * LEMBRETES (ids das notificações agendadas)
 * ===================================================================== */

/** Lê todos os lembretes salvos. */
async function buscarLembretes(): Promise<LembretesSalvos> {
  const textoSalvo = await AsyncStorage.getItem(CHAVES_ARMAZENAMENTO.lembretes);
  return textoSalvo ? JSON.parse(textoSalvo) : {};
}

/** Grava o objeto de lembretes inteiro. */
async function gravarLembretes(lembretes: LembretesSalvos): Promise<void> {
  await AsyncStorage.setItem(CHAVES_ARMAZENAMENTO.lembretes, JSON.stringify(lembretes));
}

/**
 * Descobre o id da notificação agendada para um evento.
 * Recebe: o id do evento → Devolve: o id da notificação, ou null se não houver.
 */
export async function buscarIdLembrete(eventoId: string): Promise<string | null> {
  const lembretes = await buscarLembretes();
  return lembretes[eventoId] ?? null;
}

/**
 * Guarda o id da notificação agendada para um evento.
 * Precisamos dele depois para CANCELAR a notificação certa.
 */
export async function salvarIdLembrete(eventoId: string, idNotificacao: string): Promise<void> {
  const lembretes = await buscarLembretes();
  lembretes[eventoId] = idNotificacao;
  await gravarLembretes(lembretes);
}

/** Apaga o registro do lembrete de um evento. */
export async function removerIdLembrete(eventoId: string): Promise<void> {
  const lembretes = await buscarLembretes();
  delete lembretes[eventoId];
  await gravarLembretes(lembretes);
}
