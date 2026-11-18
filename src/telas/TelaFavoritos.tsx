/**
 * ARQUIVO: src/telas/TelaFavoritos.tsx
 *
 * PARA QUE SERVE?
 * Lista os eventos favoritos salvos no aparelho (AsyncStorage). Eles continuam
 * aqui mesmo depois de fechar o app e funcionam sem internet.
 *
 * Os quatro estados aparecem aqui de forma bem direta, um "if" para cada:
 * CARREGANDO → ERRO → VAZIO → SUCESSO.
 */
import { useNavigation } from "@react-navigation/native";
import { FlatList, ListRenderItemInfo, Text } from "react-native";
import CartaoEvento from "../componentes/CartaoEvento";
import EstadoCarregando from "../componentes/estados/EstadoCarregando";
import EstadoErro from "../componentes/estados/EstadoErro";
import EstadoVazio from "../componentes/estados/EstadoVazio";
import SeparadorLista from "../componentes/SeparadorLista";
import { estilosGlobais } from "../estilos/estilosGlobais";
import { useFavoritos } from "../ganchos/useFavoritos";
import { NavegacaoPilha } from "../navegacao/tiposNavegacao";
import { Evento } from "../tipos/evento";
import { ordenarEventos } from "../utilitarios/filtrosEventos";

/**
 * Recebe: nada (é uma tela; os dados vêm do gancho useFavoritos).
 * Devolve: a tela no estado certo (carregando, erro, vazio ou a lista).
 */
export default function TelaFavoritos() {
  const navigation = useNavigation<NavegacaoPilha>();
  const { favoritos, carregando, erro, ehFavorito, alternarFavorito, tentarNovamente } = useFavoritos();

  // Próximos eventos primeiro; os que já terminaram vão para o fim.
  const favoritosOrdenados = ordenarEventos(favoritos);

  /** Leva o usuário para a aba de Eventos. */
  function irParaListaDeEventos() {
    navigation.navigate("Abas", { screen: "ListaEventos" });
  }

  /** Recebe { item } da FlatList e devolve o cartão desse evento favorito. */
  function renderizarFavorito({ item }: ListRenderItemInfo<Evento>) {
    return (
      <CartaoEvento
        evento={item}
        ehFavorito={ehFavorito(item.id)}
        aoPressionar={() => navigation.navigate("DetalhesEvento", { evento: item })}
        aoAlternarFavorito={() => alternarFavorito(item)}
      />
    );
  }

  // ESTADO 1: CARREGANDO
  if (carregando) {
    return <EstadoCarregando mensagem="Carregando seus favoritos..." />;
  }

  // ESTADO 2: ERRO
  if (erro) {
    return <EstadoErro mensagem={erro} aoTentarNovamente={tentarNovamente} />;
  }

  // ESTADO 3: VAZIO
  if (favoritos.length === 0) {
    return (
      <EstadoVazio
        icone="heart-outline"
        titulo="Nenhum favorito ainda"
        mensagem="Toque no coração de um evento para salvá-lo aqui. Seus favoritos continuam salvos mesmo se você fechar o app."
        textoBotao="Explorar eventos"
        aoPressionarBotao={irParaListaDeEventos}
      />
    );
  }

  // ESTADO 4: SUCESSO
  return (
    <FlatList
      style={estilosGlobais.container}
      contentContainerStyle={estilosGlobais.conteudo}
      data={favoritosOrdenados}
      keyExtractor={(evento) => evento.id}
      renderItem={renderizarFavorito}
      ItemSeparatorComponent={SeparadorLista}
      ListHeaderComponent={
        <Text style={estilosGlobais.textoQuantidade}>
          {favoritos.length === 1 ? "1 evento salvo" : `${favoritos.length} eventos salvos`}
        </Text>
      }
    />
  );
}
