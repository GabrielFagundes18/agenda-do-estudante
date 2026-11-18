/**
 * ARQUIVO: src/componentes/SeparadorLista.tsx
 *
 * PARA QUE SERVE?
 * Espaço vazio entre um cartão e outro nas listas (FlatList). A FlatList recebe
 * este componente na prop "ItemSeparatorComponent" e o desenha ENTRE os itens
 * (não antes do primeiro nem depois do último).
 */
import { View } from "react-native";
import { estilosGlobais } from "../estilos/estilosGlobais";

/**
 * Recebe: nada.
 * Devolve: uma View vazia com a altura do espaçamento entre itens.
 */
export default function SeparadorLista() {
  return <View style={estilosGlobais.separador} />;
}
