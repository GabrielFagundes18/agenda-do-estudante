/**
 * ARQUIVO: src/componentes/estados/EstadoCarregando.tsx
 *
 * PARA QUE SERVE?
 * Estado de tela "CARREGANDO": uma rodinha girando (ActivityIndicator) e uma
 * mensagem, enquanto os dados ainda não chegaram.
 *
 * Os quatro estados de tela do app são:
 *   CARREGANDO → EstadoCarregando
 *   ERRO       → EstadoErro (com botão "Tentar novamente")
 *   VAZIO      → EstadoVazio
 *   SUCESSO    → a própria lista de eventos
 */
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { estilosGlobais } from "../../estilos/estilosGlobais";
import { cores, espacamento } from "../../estilos/tema";

interface PropsEstadoCarregando {
  mensagem?: string;
}

/**
 * Recebe (props): a mensagem (opcional; o padrão é "Carregando...").
 * Devolve: a tela com a rodinha girando e a mensagem embaixo.
 */
export default function EstadoCarregando({ mensagem = "Carregando..." }: PropsEstadoCarregando) {
  return (
    <View style={estilosGlobais.centralizado} accessibilityLabel={mensagem}>
      <ActivityIndicator size="large" color={cores.primaria} />
      <Text style={[estilosGlobais.textoSecundario, estilos.mensagem]}>{mensagem}</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  mensagem: {
    marginTop: espacamento.medio,
  },
});
