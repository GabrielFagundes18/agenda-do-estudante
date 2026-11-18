/**
 * ARQUIVO: src/telas/TelaListaEventos.tsx
 *
 * PARA QUE SERVE?
 * Tela inicial: lista de eventos com busca, filtros e "puxar para atualizar".
 *
 * A tela só cuida da INTERFACE. Os dados e a lógica vêm dos ganchos:
 * - useEventos: busca nas APIs e controla carregando/erro/aviso;
 * - useFiltrosEventos: guarda os filtros e devolve a lista filtrada;
 * - useFavoritos: diz quais eventos são favoritos e permite favoritar.
 *
 * OS 4 ESTADOS DA TELA:
 * 1. CARREGANDO → <EstadoCarregando />
 * 2. ERRO       → <EstadoErro /> (as duas APIs falharam)
 * 3. VAZIO      → <EstadoVazio /> dentro da FlatList (nenhum evento para mostrar)
 * 4. SUCESSO    → a FlatList com os cartões
 * Caso extra: SUCESSO PARCIAL (só uma API falhou) → lista + aviso com "Tentar novamente".
 */
import { useNavigation } from "@react-navigation/native";
import { FlatList, ListRenderItemInfo, RefreshControl, StyleSheet, Text, View } from "react-native";
import BarraPesquisa from "../componentes/BarraPesquisa";
import CartaoEvento from "../componentes/CartaoEvento";
import EstadoCarregando from "../componentes/estados/EstadoCarregando";
import EstadoErro from "../componentes/estados/EstadoErro";
import EstadoVazio from "../componentes/estados/EstadoVazio";
import MensagemInformativa from "../componentes/MensagemInformativa";
import PainelFiltros from "../componentes/PainelFiltros";
import SeparadorLista from "../componentes/SeparadorLista";
import { estilosGlobais } from "../estilos/estilosGlobais";
import { bordas, cores, espacamento } from "../estilos/tema";
import { useEventos } from "../ganchos/useEventos";
import { useFavoritos } from "../ganchos/useFavoritos";
import { useFiltrosEventos } from "../ganchos/useFiltrosEventos";
import { NavegacaoPilha } from "../navegacao/tiposNavegacao";
import { Evento } from "../tipos/evento";

/**
 * Recebe: nada (é uma tela; os dados vêm dos ganchos).
 * Devolve: a tela no estado certo (carregando, erro, vazio ou sucesso).
 */
export default function TelaListaEventos() {
  const navigation = useNavigation<NavegacaoPilha>();
  const { eventos, carregando, atualizando, erro, aviso, tentarNovamente, atualizarEventos } = useEventos();
  const {
    filtros,
    eventosFiltrados,
    quantidadeFiltrosExtras,
    alterarTextoBusca,
    alterarCategoria,
    alterarPeriodo,
    alterarModalidade,
    alterarMostrarEncerrados,
    limparFiltros,
  } = useFiltrosEventos(eventos);
  const { ehFavorito, alternarFavorito } = useFavoritos();

  /** Abre a tela de detalhes, enviando o evento como parâmetro. */
  function abrirDetalhes(evento: Evento) {
    navigation.navigate("DetalhesEvento", { evento });
  }

  /**
   * Desenha UM item da lista. A FlatList chama esta função para cada evento,
   * passando { item } (o evento da vez). Devolve o cartão desse evento.
   */
  function renderizarEvento({ item }: ListRenderItemInfo<Evento>) {
    return (
      <CartaoEvento
        evento={item}
        ehFavorito={ehFavorito(item.id)}
        aoPressionar={() => abrirDetalhes(item)}
        aoAlternarFavorito={() => alternarFavorito(item)}
      />
    );
  }

  /** Devolve o texto acima da lista, ex.: "12 eventos encontrados". */
  function montarTextoQuantidade(): string {
    const quantidade = eventosFiltrados.length;
    return quantidade === 1 ? "1 evento encontrado" : `${quantidade} eventos encontrados`;
  }

  /**
   * Devolve o EstadoVazio certo para cada situação:
   * - as APIs não trouxeram NENHUM evento → oferece "Recarregar";
   * - há eventos, mas nenhum passa nos filtros → oferece "Limpar filtros".
   */
  function renderizarVazio() {
    if (eventos.length === 0) {
      return (
        <EstadoVazio
          titulo="Nenhum evento disponível"
          mensagem="As fontes de eventos não enviaram nenhum evento no momento. Tente recarregar mais tarde."
          textoBotao="Recarregar"
          aoPressionarBotao={tentarNovamente}
        />
      );
    }
    return (
      <EstadoVazio
        titulo="Nenhum evento encontrado"
        mensagem="Tente outra busca ou limpe os filtros. Eventos que já terminaram ficam escondidos: ative “Mostrar eventos encerrados” em Mais filtros para vê-los."
        textoBotao="Limpar filtros"
        aoPressionarBotao={limparFiltros}
      />
    );
  }

  // ESTADO 1: CARREGANDO
  if (carregando) {
    return <EstadoCarregando mensagem="Buscando eventos..." />;
  }

  // ESTADO 2: ERRO
  if (erro) {
    return <EstadoErro mensagem={erro} aoTentarNovamente={tentarNovamente} />;
  }

  // ESTADOS 3 e 4: VAZIO ou SUCESSO
  // Mesmo quando a lista está vazia, desenhamos a FlatList, porque assim a busca,
  // os filtros e o "puxar para atualizar" continuam disponíveis. A FlatList mostra
  // o ListEmptyComponent (EstadoVazio) sozinha quando "data" está vazia.
  return (
    <View style={estilosGlobais.container}>
      <View style={estilos.cabecalho}>
        <BarraPesquisa
          valor={filtros.textoBusca}
          aoAlterarTexto={alterarTextoBusca}
          dica="Buscar por nome, tema ou local"
        />
        <PainelFiltros
          filtros={filtros}
          quantidadeFiltrosExtras={quantidadeFiltrosExtras}
          aoAlterarCategoria={alterarCategoria}
          aoAlterarPeriodo={alterarPeriodo}
          aoAlterarModalidade={alterarModalidade}
          aoAlterarMostrarEncerrados={alterarMostrarEncerrados}
          aoLimparFiltros={limparFiltros}
        />
        {aviso ? (
          <MensagemInformativa
            tipo="aviso"
            texto={aviso}
            textoAcao={atualizando ? "Atualizando..." : "Tentar novamente"}
            aoPressionarAcao={atualizarEventos}
          />
        ) : null}
      </View>

      {/*
        CONCEITO: FlatList
        Lista otimizada para muitos itens: ela só desenha os itens que estão
        aparecendo na tela (e alguns próximos), em vez de desenhar todos de uma vez
        como um ScrollView faria. Isso economiza memória e deixa a rolagem fluida.
        - data: a lista de dados;
        - keyExtractor: devolve um id ÚNICO de cada item (o React usa para saber
          qual item é qual quando a lista muda);
        - renderItem: função que desenha cada item;
        - ItemSeparatorComponent: componente desenhado ENTRE os itens;
        - refreshControl: o "puxar para atualizar".
      */}
      <FlatList
        data={eventosFiltrados}
        keyExtractor={(evento) => evento.id}
        renderItem={renderizarEvento}
        ItemSeparatorComponent={SeparadorLista}
        ListHeaderComponent={
          eventosFiltrados.length > 0 ? (
            <Text style={estilosGlobais.textoQuantidade}>{montarTextoQuantidade()}</Text>
          ) : undefined
        }
        ListEmptyComponent={renderizarVazio()}
        contentContainerStyle={eventosFiltrados.length === 0 ? estilos.listaVazia : estilos.lista}
        // O RefreshControl tem props diferentes em cada plataforma:
        // "colors" é usado no ANDROID e "tintColor" no iOS. Passamos as duas;
        // cada sistema ignora a que não é dele.
        refreshControl={
          <RefreshControl
            refreshing={atualizando}
            onRefresh={atualizarEventos}
            colors={[cores.primaria]}
            tintColor={cores.primaria}
          />
        }
        keyboardShouldPersistTaps="handled" // permite tocar num cartão com o teclado aberto
        keyboardDismissMode="on-drag" // fecha o teclado ao rolar a lista
      />
    </View>
  );
}

const estilos = StyleSheet.create({
  cabecalho: {
    paddingHorizontal: espacamento.medio,
    paddingTop: espacamento.medio,
    backgroundColor: cores.superficie,
    borderBottomWidth: bordas.espessura,
    borderBottomColor: cores.borda,
  },
  lista: {
    padding: espacamento.medio,
  },
  listaVazia: {
    flexGrow: 1, // faz o EstadoVazio ocupar a altura toda e ficar centralizado
  },
});
