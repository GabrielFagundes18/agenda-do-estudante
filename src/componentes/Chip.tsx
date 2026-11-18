/**
 * ARQUIVO: src/componentes/Chip.tsx
 *
 * PARA QUE SERVE?
 * Um botão em formato de pílula que pode estar selecionado ou não. É usado em
 * todos os filtros (categoria, data e modalidade), então o visual fica igual
 * em todos eles.
 */
import { Pressable, StyleSheet, Text } from "react-native";
import { bordas, cores, espacamento, fontes, pesos } from "../estilos/tema";

interface PropsChip {
  rotulo: string;
  selecionado: boolean;
  aoPressionar: () => void;
  cor?: string; // cor de destaque quando selecionado (padrão: cor primária)
}

/**
 * Recebe (props): o rótulo, se está selecionado, a função do toque e a cor de destaque.
 * Devolve: o chip, com fundo colorido quando selecionado e branco quando não.
 */
export default function Chip({ rotulo, selecionado, aoPressionar, cor = cores.primaria }: PropsChip) {
  return (
    <Pressable
      onPress={aoPressionar}
      accessibilityRole="button"
      accessibilityState={{ selected: selecionado }}
      style={[estilos.chip, selecionado && { backgroundColor: cor, borderColor: cor }]}
    >
      <Text style={[estilos.texto, selecionado && estilos.textoSelecionado]}>{rotulo}</Text>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  chip: {
    paddingHorizontal: espacamento.medio,
    paddingVertical: espacamento.pequeno,
    borderRadius: bordas.raioPilula,
    borderWidth: bordas.espessura,
    borderColor: cores.borda,
    backgroundColor: cores.superficie,
  },
  texto: {
    fontSize: fontes.normal,
    fontWeight: pesos.medio,
    color: cores.textoSecundario,
  },
  textoSelecionado: {
    color: cores.textoSobreCor,
  },
});
