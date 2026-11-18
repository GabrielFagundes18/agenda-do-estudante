/**
 * ARQUIVO: src/componentes/LinhaInformacao.tsx
 *
 * PARA QUE SERVE?
 * Uma linha com ícone + texto, opcionalmente com um rótulo em cima.
 * Ex.: [📅] Quando
 *           ter, 18 de nov. de 2026 • 19:00 às 21:00
 * Usada no cartão do evento, na tela de detalhes e na tela Sobre.
 */
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { estilosGlobais } from "../estilos/estilosGlobais";
import { cores, espacamento, fontes, pesos } from "../estilos/tema";
import { NomeIcone } from "../tipos/icones";

interface PropsLinhaInformacao {
  icone: NomeIcone;
  texto: string;
  rotulo?: string;
}

/**
 * Recebe (props): o ícone, o texto e um rótulo opcional.
 * Devolve: a linha com o ícone à esquerda e os textos à direita.
 */
export default function LinhaInformacao({ icone, texto, rotulo }: PropsLinhaInformacao) {
  return (
    <View style={estilos.linha}>
      <Ionicons name={icone} size={18} color={cores.textoSecundario} style={estilos.icone} />
      <View style={estilos.textos}>
        {/* Usamos "condição ? <Elemento/> : null" em vez de "&&" com textos:
            se "rotulo" fosse "" (texto vazio), o && tentaria desenhar "" fora de
            um <Text>, e isso dá erro no React Native. */}
        {rotulo ? <Text style={estilos.rotulo}>{rotulo}</Text> : null}
        <Text style={estilosGlobais.textoSecundario}>{texto}</Text>
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  linha: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: espacamento.pequeno,
  },
  icone: {
    marginTop: 1,
    marginRight: espacamento.pequeno,
  },
  textos: {
    flex: 1, // ocupa o resto da linha e deixa o texto quebrar em várias linhas
  },
  rotulo: {
    fontSize: fontes.pequena,
    fontWeight: pesos.negrito,
    color: cores.texto,
  },
});
