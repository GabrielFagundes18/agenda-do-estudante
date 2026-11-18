/**
 * ARQUIVO: src/componentes/ImagemEvento.tsx
 *
 * PARA QUE SERVE?
 * Mostra a imagem do evento. Se o evento não tiver imagem, ou se ela não
 * carregar (link quebrado, sem internet), mostra no lugar um bloco com a cor e o
 * ícone da categoria. Assim o cartão nunca fica com um "buraco" em branco.
 */
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Image, StyleSheet, View } from "react-native";
import { ICONES_CATEGORIAS } from "../constantes/configuracoes";
import { coresCategorias } from "../estilos/tema";
import { Evento } from "../tipos/evento";

interface PropsImagemEvento {
  evento: Evento;
  altura: number;
}

/**
 * Recebe (props): o evento e a altura da imagem (em pontos).
 * Devolve: a imagem do evento ou, se não houver/não carregar, o bloco com o
 * ícone e a cor da categoria.
 */
export default function ImagemEvento({ evento, altura }: PropsImagemEvento) {
  // Começa false; vira true se o <Image> avisar que não conseguiu carregar.
  const [falhouAoCarregar, setFalhouAoCarregar] = useState(false);
  const corCategoria = coresCategorias[evento.categoria];

  if (!evento.imagem || falhouAoCarregar) {
    return (
      <View style={[estilos.substituta, { height: altura, backgroundColor: corCategoria.clara }]}>
        <Ionicons name={ICONES_CATEGORIAS[evento.categoria]} size={altura / 3} color={corCategoria.forte} />
      </View>
    );
  }

  return (
    <Image
      source={{ uri: evento.imagem }}
      style={[estilos.imagem, { height: altura, backgroundColor: corCategoria.clara }]}
      resizeMode="cover" // preenche o espaço todo, cortando as sobras (sem distorcer)
      onError={() => setFalhouAoCarregar(true)}
      accessibilityIgnoresInvertColors
    />
  );
}

const estilos = StyleSheet.create({
  imagem: {
    width: "100%",
  },
  substituta: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
});
