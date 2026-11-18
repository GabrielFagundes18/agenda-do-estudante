/**
 * ARQUIVO: src/ganchos/useFiltrosEventos.ts
 *
 * PARA QUE SERVE?
 * Guarda o que o usuário escolheu nos filtros (texto da busca, categoria, data,
 * modalidade e "mostrar encerrados") e devolve a lista já filtrada.
 *
 * As REGRAS de filtragem ficam em utilitarios/filtrosEventos.ts. Este gancho só
 * guarda as escolhas (useState) e chama essas regras.
 */
import { useState } from "react";
import { CategoriaEvento, Evento, FiltrosEventos, Modalidade, PeriodoFiltro } from "../tipos/evento";
import { contarFiltrosExtrasAtivos, filtrarEventos, FILTROS_INICIAIS } from "../utilitarios/filtrosEventos";

/**
 * Recebe: a lista completa de eventos.
 * Devolve: os filtros atuais, a lista filtrada e as funções para mudar cada filtro.
 */
export function useFiltrosEventos(eventos: Evento[]) {
  // Um useState para cada filtro: fica fácil ver o que muda e quando.
  // O tipo entre < > diz quais valores o estado aceita.
  const [textoBusca, setTextoBusca] = useState(FILTROS_INICIAIS.textoBusca);
  const [categoria, setCategoria] = useState<CategoriaEvento | "todas">(FILTROS_INICIAIS.categoria);
  const [periodo, setPeriodo] = useState<PeriodoFiltro>(FILTROS_INICIAIS.periodo);
  const [modalidade, setModalidade] = useState<Modalidade | "todas">(FILTROS_INICIAIS.modalidade);
  const [mostrarEncerrados, setMostrarEncerrados] = useState(FILTROS_INICIAIS.mostrarEncerrados);

  const filtros: FiltrosEventos = { textoBusca, categoria, periodo, modalidade, mostrarEncerrados };

  // Recalculado a cada renderização. Com algumas dezenas de eventos isso é
  // instantâneo, e assim a lista nunca fica "desatualizada" em relação aos filtros.
  const eventosFiltrados = filtrarEventos(eventos, filtros);
  const quantidadeFiltrosExtras = contarFiltrosExtrasAtivos(filtros);

  /** Volta todos os filtros para o valor inicial. */
  function limparFiltros() {
    setTextoBusca(FILTROS_INICIAIS.textoBusca);
    setCategoria(FILTROS_INICIAIS.categoria);
    setPeriodo(FILTROS_INICIAIS.periodo);
    setModalidade(FILTROS_INICIAIS.modalidade);
    setMostrarEncerrados(FILTROS_INICIAIS.mostrarEncerrados);
  }

  return {
    filtros,
    eventosFiltrados,
    quantidadeFiltrosExtras,
    alterarTextoBusca: setTextoBusca,
    alterarCategoria: setCategoria,
    alterarPeriodo: setPeriodo,
    alterarModalidade: setModalidade,
    alterarMostrarEncerrados: setMostrarEncerrados,
    limparFiltros,
  };
}
