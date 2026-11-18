/**
 * ARQUIVO: src/ganchos/useEventos.ts
 *
 * PARA QUE SERVE?
 * É um "custom hook" (gancho personalizado): uma função que começa com "use" e
 * guarda estado e lógica que uma tela precisa. Este carrega os eventos das APIs
 * e controla os estados da tela de lista: carregando, erro, aviso e atualizando.
 *
 * Por que um gancho? Para a tela ficar só com a parte visual. Ela chama
 * useEventos() e recebe tudo pronto: a lista, se está carregando, se deu erro, etc.
 *
 * CONCEITO: useState
 * const [valor, setValor] = useState(valorInicial);
 * - "valor" é o dado atual;
 * - "setValor" troca o valor E avisa o React para redesenhar a tela.
 * Se mudássemos uma variável comum, a tela NÃO seria atualizada.
 *
 * CONCEITO: useEffect
 * useEffect(() => { ... }, [dependencias]);
 * Roda um código DEPOIS que o componente aparece na tela. O segundo parâmetro
 * (array de dependências) diz QUANDO rodar de novo:
 * - []          → roda só uma vez, quando a tela abre;
 * - [x, y]      → roda quando abre e sempre que x ou y mudarem;
 * - sem o array → roda depois de TODA renderização (quase nunca é o que queremos).
 * Regra importante: tudo o que o efeito USA e que pode mudar (estados, props,
 * funções declaradas no componente) deve estar no array. Por isso a função de
 * busca fica DENTRO do efeito.
 */
import { useEffect, useState } from "react";
import { buscarTodosEventos } from "../servicos/servicoApi";
import { Evento } from "../tipos/evento";

/**
 * Monta a mensagem de aviso quando UMA das fontes falhou.
 * Recebe: ex.: ["hackathons"] → Devolve: o texto do aviso, ou null se nada falhou.
 */
function montarAvisoDeFalhas(fontesComFalha: string[]): string | null {
  if (fontesComFalha.length === 0) {
    return null;
  }
  return `Não conseguimos carregar: ${fontesComFalha.join(", ")}. Mostrando os demais eventos.`;
}

/**
 * Pega a mensagem de um erro qualquer.
 * Recebe: o erro capturado no catch → Devolve: um texto para mostrar na tela.
 */
function obterMensagemDeErro(erro: unknown): string {
  return erro instanceof Error ? erro.message : "Ocorreu um erro inesperado.";
}

/**
 * Gancho que carrega e guarda a lista de eventos.
 *
 * Recebe: nada.
 * Devolve um objeto com:
 * - eventos: a lista completa (sem filtros);
 * - carregando: true durante a carga principal (mostra a tela de "carregando");
 * - atualizando: true durante o "puxar para atualizar";
 * - erro: mensagem quando nenhuma fonte funcionou (tela de erro);
 * - aviso: mensagem quando só uma fonte falhou (a lista continua aparecendo);
 * - tentarNovamente: refaz a carga principal (botão "Tentar novamente");
 * - atualizarEventos: busca de novo sem esconder a lista (puxar para atualizar).
 */
export function useEventos() {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  // Número da tentativa de carga. Ele não aparece na tela: serve só para
  // "avisar" o useEffect que é hora de buscar de novo (veja tentarNovamente).
  const [tentativa, setTentativa] = useState(0);

  // Dependência [tentativa]: o efeito roda quando a tela abre (tentativa = 0) e
  // de novo toda vez que "tentativa" mudar. A função de busca fica DENTRO do
  // efeito, então o array de dependências fica completo e correto.
  useEffect(() => {
    async function carregar() {
      try {
        const resultado = await buscarTodosEventos();
        setEventos(resultado.eventos);
        setAviso(montarAvisoDeFalhas(resultado.fontesComFalha));
        setErro(null);
      } catch (erroDaBusca) {
        setErro(obterMensagemDeErro(erroDaBusca));
      } finally {
        setCarregando(false);
      }
    }
    carregar();
  }, [tentativa]);

  /**
   * Botão "Tentar novamente" (tela de erro, aviso e lista vazia).
   * Mostra o "carregando" e soma 1 na tentativa; o useEffect percebe a
   * mudança e faz a busca de novo.
   */
  function tentarNovamente() {
    setCarregando(true);
    setErro(null);
    setTentativa(tentativa + 1);
  }

  /**
   * "Puxar para atualizar".
   * Diferença: se falhar, NÃO apagamos a lista que já estava na tela; só
   * mostramos um aviso. Perder tudo por causa de uma atualização seria ruim.
   */
  async function atualizarEventos() {
    setAtualizando(true);
    try {
      const resultado = await buscarTodosEventos();
      setEventos(resultado.eventos);
      setAviso(montarAvisoDeFalhas(resultado.fontesComFalha));
    } catch {
      setAviso("Não foi possível atualizar agora. Mostrando os últimos eventos carregados.");
    } finally {
      setAtualizando(false);
    }
  }

  return { eventos, carregando, atualizando, erro, aviso, tentarNovamente, atualizarEventos };
}
