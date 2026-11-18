/**
 * ARQUIVO: src/telas/TelaDetalhesEvento.tsx
 *
 * PARA QUE SERVE?
 * Mostra todas as informações de um evento e as ações possíveis:
 * - inscrever-se (bloqueado se o evento estiver encerrado ou indisponível);
 * - favoritar / desfavoritar;
 * - ativar ou cancelar um lembrete (só para favoritos);
 * - abrir a página oficial do evento no navegador.
 * Se o usuário já se inscreveu, mostra quando e com qual nome.
 *
 * O evento chega como PARÂMETRO da navegação: route.params.evento.
 */
import { Alert, Linking, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import BotaoPrincipal from "../componentes/BotaoPrincipal";
import Etiqueta from "../componentes/Etiqueta";
import EtiquetaStatus from "../componentes/EtiquetaStatus";
import ImagemEvento from "../componentes/ImagemEvento";
import InformacoesEvento from "../componentes/InformacoesEvento";
import MensagemInformativa from "../componentes/MensagemInformativa";
import { estilosGlobais } from "../estilos/estilosGlobais";
import { cores, coresCategorias, espacamento } from "../estilos/tema";
import { useFavoritos } from "../ganchos/useFavoritos";
import { useInscricaoDoEvento } from "../ganchos/useInscricaoDoEvento";
import { useLembrete } from "../ganchos/useLembrete";
import { PropsTelaDetalhes } from "../navegacao/tiposNavegacao";
import { formatarDataHora } from "../utilitarios/formatarData";
import { calcularStatusEvento, obterMensagemStatus } from "../utilitarios/statusEvento";

/**
 * Recebe (props): "route" (com o evento em route.params) e "navigation" (para
 * abrir o formulário). Essas props são enviadas pelo React Navigation.
 * Devolve: a tela de detalhes com as informações e os botões de ação.
 */
export default function TelaDetalhesEvento({ route, navigation }: PropsTelaDetalhes) {
  const { evento } = route.params;
  const { ehFavorito, alternarFavorito } = useFavoritos();
  const favorito = ehFavorito(evento.id);
  const lembrete = useLembrete(evento, favorito);
  const inscricao = useInscricaoDoEvento(evento.id);

  // ÁREA SEGURA: "insets" são as medidas das partes da tela ocupadas pelo
  // sistema (entalhe, barra de gestos do iPhone, barra de navegação do Android).
  // Usamos a medida de baixo para o último botão não ficar escondido atrás delas.
  const insets = useSafeAreaInsets();

  const status = calcularStatusEvento(evento);
  const inscricaoLiberada = status === "aberto";
  const corCategoria = coresCategorias[evento.categoria];

  /** Abre o formulário de inscrição deste evento. */
  function abrirFormulario() {
    navigation.navigate("FormularioInscricao", { evento });
  }

  /** Abre o site do evento no navegador do celular. */
  async function abrirPaginaDoEvento() {
    if (!evento.link) {
      return;
    }
    try {
      await Linking.openURL(evento.link);
    } catch {
      Alert.alert("Ops!", "Não foi possível abrir a página do evento.");
    }
  }

  /** Devolve o texto do botão de inscrição, conforme a situação. */
  function obterTextoBotaoInscricao(): string {
    if (!inscricaoLiberada) {
      return "Inscrições bloqueadas";
    }
    return inscricao ? "Atualizar minha inscrição" : "Quero me inscrever";
  }

  /**
   * Devolve a parte do lembrete. São quatro situações possíveis, e cada uma
   * mostra uma coisa diferente.
   */
  function renderizarAreaLembrete() {
    if (!lembrete.lembretePermitido) {
      return <Text style={estilos.dica}>Lembretes não estão disponíveis para eventos encerrados ou cancelados.</Text>;
    }
    if (!favorito) {
      return <Text style={estilos.dica}>Adicione este evento aos favoritos para poder ativar um lembrete.</Text>;
    }
    if (lembrete.lembreteAtivo) {
      return (
        <BotaoPrincipal
          titulo="Cancelar lembrete"
          variante="perigo"
          icone="notifications-off-outline"
          carregando={lembrete.processando}
          aoPressionar={lembrete.cancelarLembrete}
        />
      );
    }
    return (
      <BotaoPrincipal
        titulo="Lembrar-me"
        variante="secundario"
        icone="notifications-outline"
        carregando={lembrete.processando}
        aoPressionar={lembrete.ativarLembrete}
      />
    );
  }

  return (
    <ScrollView
      style={estilosGlobais.container}
      contentContainerStyle={{ paddingBottom: insets.bottom + espacamento.grande }}
    >
      <ImagemEvento evento={evento} altura={200} />

      <View style={estilosGlobais.conteudo}>
        <View style={estilos.linhaEtiquetas}>
          <Etiqueta texto={evento.categoria} corTexto={corCategoria.forte} corFundo={corCategoria.clara} />
          <EtiquetaStatus status={status} />
        </View>

        <Text style={[estilosGlobais.titulo, estilos.titulo]}>{evento.titulo}</Text>

        {/* Mensagem explicativa quando NÃO dá para se inscrever */}
        {!inscricaoLiberada ? (
          <MensagemInformativa tipo={status === "encerrado" ? "info" : "erro"} texto={obterMensagemStatus(evento)} />
        ) : null}

        {/* Inscrição salva no aparelho (continua aparecendo depois de reabrir o app) */}
        {inscricao ? (
          <MensagemInformativa
            tipo="sucesso"
            texto={`Você já se inscreveu como ${inscricao.nome} em ${formatarDataHora(new Date(inscricao.criadaEm))}.`}
          />
        ) : null}

        <View style={estilos.secao}>
          <InformacoesEvento evento={evento} />
        </View>

        <View style={estilos.secao}>
          <Text style={estilosGlobais.rotuloSecao}>Sobre o evento</Text>
          <Text style={estilosGlobais.texto}>{evento.descricao}</Text>
        </View>

        {evento.temas.length > 0 ? (
          <View style={estilos.secao}>
            <Text style={estilosGlobais.rotuloSecao}>Temas</Text>
            <View style={estilos.temas}>
              {evento.temas.map((tema) => (
                <Etiqueta key={tema} texto={tema} corTexto={cores.primariaEscura} corFundo={cores.primariaClara} />
              ))}
            </View>
          </View>
        ) : null}

        <View style={estilos.acoes}>
          <BotaoPrincipal
            titulo={obterTextoBotaoInscricao()}
            icone={inscricaoLiberada ? "create-outline" : "lock-closed-outline"}
            desabilitado={!inscricaoLiberada}
            aoPressionar={abrirFormulario}
          />
          <BotaoPrincipal
            titulo={favorito ? "Remover dos favoritos" : "Adicionar aos favoritos"}
            variante="secundario"
            icone={favorito ? "heart-dislike-outline" : "heart-outline"}
            aoPressionar={() => alternarFavorito(evento)}
          />
          {renderizarAreaLembrete()}
          {evento.link ? (
            <BotaoPrincipal
              titulo="Abrir página do evento"
              variante="secundario"
              icone="open-outline"
              aoPressionar={abrirPaginaDoEvento}
            />
          ) : null}
        </View>
      </View>
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  linhaEtiquetas: {
    flexDirection: "row",
    gap: espacamento.pequeno,
  },
  titulo: {
    marginTop: espacamento.pequeno,
    marginBottom: espacamento.pequeno,
  },
  secao: {
    marginTop: espacamento.medio,
  },
  temas: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: espacamento.pequeno,
  },
  acoes: {
    marginTop: espacamento.grande,
    gap: espacamento.medio, // espaço entre os botões
  },
  dica: {
    ...estilosGlobais.textoSecundario,
    textAlign: "center",
  },
});
