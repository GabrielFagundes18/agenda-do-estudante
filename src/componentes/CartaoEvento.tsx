/**
 * ARQUIVO: src/componentes/CartaoEvento.tsx
 *
 * PARA QUE SERVE?
 * O cartão de um evento nas listas (tela de Eventos e tela de Favoritos).
 * Mostra imagem, categoria, status, título, data, local e o botão de favoritar.
 *
 * Eventos ENCERRADOS ou INDISPONÍVEIS aparecem com aparência "desativada"
 * (mais transparentes), para o usuário perceber de longe que não estão abertos.
 */
import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { estilosGlobais } from "../estilos/estilosGlobais";
import { bordas, cores, coresCategorias, espacamento, opacidadeDesativado } from "../estilos/tema";
import { Evento } from "../tipos/evento";
import { formatarPeriodoEvento } from "../utilitarios/formatarData";
import { calcularStatusEvento, ROTULOS_STATUS } from "../utilitarios/statusEvento";
import Etiqueta from "./Etiqueta";
import EtiquetaStatus from "./EtiquetaStatus";
import ImagemEvento from "./ImagemEvento";
import LinhaInformacao from "./LinhaInformacao";

interface PropsCartaoEvento {
  evento: Evento;
  ehFavorito: boolean;
  aoPressionar: () => void;
  aoAlternarFavorito: () => void;
}

/**
 * Recebe (props): o evento, se ele é favorito, a função do toque no cartão
 * (abrir detalhes) e a função do toque no coração (favoritar).
 * Devolve: o cartão pronto. O status é calculado aqui para decidir a etiqueta
 * e a aparência desativada.
 */
export default function CartaoEvento({ evento, ehFavorito, aoPressionar, aoAlternarFavorito }: PropsCartaoEvento) {
  const status = calcularStatusEvento(evento);
  const estaInativo = status !== "aberto";
  const corCategoria = coresCategorias[evento.categoria];

  return (
    // Por que duas Views (a de fora com sombra e a de dentro com "overflow: hidden")?
    // Para a imagem acompanhar os cantos arredondados, precisamos de overflow: hidden.
    // Mas no iOS o overflow: hidden também CORTA A SOMBRA. Então a sombra fica na
    // View de fora e o corte na de dentro, e as duas coisas funcionam.
    <Pressable
      onPress={aoPressionar}
      accessibilityRole="button"
      accessibilityLabel={`${evento.titulo}. ${ROTULOS_STATUS[status]}.`}
      style={({ pressed }) => [
        estilosGlobais.cartao,
        estilos.cartao,
        estaInativo && estilos.cartaoInativo,
        pressed && estilos.cartaoPressionado,
      ]}
    >
      <View style={estilos.recorte}>
        <ImagemEvento evento={evento} altura={130} />

        <View style={estilos.conteudo}>
          <View style={estilos.linhaEtiquetas}>
            <Etiqueta texto={evento.categoria} corTexto={corCategoria.forte} corFundo={corCategoria.clara} />
            <EtiquetaStatus status={status} />

            {/* Um Pressable dentro de outro: tocar no coração NÃO abre os detalhes.
                hitSlop aumenta a área de toque sem aumentar o ícone. */}
            <Pressable
              onPress={aoAlternarFavorito}
              hitSlop={12}
              style={estilos.botaoFavorito}
              accessibilityRole="button"
              accessibilityLabel={ehFavorito ? "Remover dos favoritos" : "Adicionar aos favoritos"}
            >
              <Ionicons
                name={ehFavorito ? "heart" : "heart-outline"}
                size={24}
                color={ehFavorito ? cores.favorito : cores.textoSuave}
              />
            </Pressable>
          </View>

          <Text style={[estilosGlobais.subtitulo, estilos.titulo]} numberOfLines={2}>
            {evento.titulo}
          </Text>

          <LinhaInformacao icone="calendar-outline" texto={formatarPeriodoEvento(evento)} />
          <LinhaInformacao
            icone={evento.modalidade === "Online" ? "globe-outline" : "location-outline"}
            texto={`${evento.local} • ${evento.modalidade}`}
          />
        </View>
      </View>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  cartao: {
    padding: 0, // o espaçamento interno fica no "conteudo", para a imagem encostar nas bordas
  },
  cartaoInativo: {
    opacity: opacidadeDesativado,
  },
  cartaoPressionado: {
    opacity: 0.85,
  },
  recorte: {
    borderRadius: bordas.raioGrande,
    overflow: "hidden",
  },
  conteudo: {
    padding: espacamento.medio,
  },
  linhaEtiquetas: {
    flexDirection: "row",
    alignItems: "center",
    gap: espacamento.pequeno,
  },
  botaoFavorito: {
    marginLeft: "auto", // empurra o coração para o canto direito
  },
  titulo: {
    marginTop: espacamento.pequeno,
  },
});
