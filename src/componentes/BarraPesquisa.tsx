/**
 * ARQUIVO: src/componentes/BarraPesquisa.tsx
 *
 * PARA QUE SERVE?
 * Campo de busca com ícone de lupa e um botão "x" para apagar o texto.
 *
 * Detalhe de plataforma: o TextInput do iOS tem a opção "clearButtonMode", que
 * mostra um "x" sozinho, mas o Android não tem. Por isso fizemos o nosso próprio
 * botão, que funciona igual nas duas plataformas.
 *
 * Este é um componente "controlado": ele não guarda o texto. Quem usa passa o
 * valor atual (valor) e recebe cada mudança (aoAlterarTexto).
 */
import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, TextInput, View } from "react-native";
import { bordas, cores, espacamento, fontes } from "../estilos/tema";

interface PropsBarraPesquisa {
  valor: string;
  aoAlterarTexto: (texto: string) => void;
  dica?: string; // texto cinza que aparece com o campo vazio (placeholder)
}

/**
 * Recebe (props): o texto atual, a função chamada a cada letra e a dica (placeholder).
 * Devolve: a barra com lupa, campo de texto e o botão "x" (só quando há texto).
 */
export default function BarraPesquisa({ valor, aoAlterarTexto, dica = "Buscar..." }: PropsBarraPesquisa) {
  return (
    <View style={estilos.container}>
      <Ionicons name="search" size={20} color={cores.textoSuave} />
      <TextInput
        style={estilos.campo}
        value={valor}
        onChangeText={aoAlterarTexto}
        placeholder={dica}
        placeholderTextColor={cores.textoSuave}
        returnKeyType="search"
        autoCorrect={false}
        accessibilityLabel="Buscar eventos"
      />
      {valor !== "" ? (
        <Pressable onPress={() => aoAlterarTexto("")} hitSlop={12} accessibilityLabel="Limpar busca">
          <Ionicons name="close-circle" size={20} color={cores.textoSuave} />
        </Pressable>
      ) : null}
    </View>
  );
}

const estilos = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 48,
    paddingHorizontal: espacamento.medio,
    borderRadius: bordas.raioMedio,
    borderWidth: bordas.espessura,
    borderColor: cores.borda,
    backgroundColor: cores.superficie,
  },
  campo: {
    flex: 1, // ocupa todo o espaço que sobra entre a lupa e o "x"
    marginHorizontal: espacamento.pequeno,
    fontSize: fontes.media,
    color: cores.texto,
    paddingVertical: espacamento.pequeno,
  },
});
