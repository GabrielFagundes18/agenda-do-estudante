/**
 * ARQUIVO: src/componentes/estados/EstruturaEstado.tsx
 *
 * PARA QUE SERVE?
 * O "esqueleto" visual comum aos estados de ERRO e VAZIO: tudo centralizado,
 * um círculo com ícone, um título, uma mensagem e (opcionalmente) um botão.
 *
 * Por que existe? O EstadoErro e o EstadoVazio tinham o mesmo layout repetido.
 * Agora o layout fica só aqui, e cada estado só escolhe ícone, cores e textos.
 * Se quisermos mudar o visual dos estados, mudamos em um único lugar.
 */
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { estilosGlobais } from "../../estilos/estilosGlobais";
import { espacamento } from "../../estilos/tema";
import { NomeIcone } from "../../tipos/icones";
import BotaoPrincipal from "../BotaoPrincipal";

interface PropsEstruturaEstado {
  icone: NomeIcone;
  corIcone: string;
  corFundoIcone: string;
  titulo: string;
  mensagem: string;
  textoBotao?: string;
  iconeBotao?: NomeIcone;
  varianteBotao?: "primario" | "secundario";
  aoPressionarBotao?: () => void;
}

/**
 * Recebe (props): ícone e cores do círculo, título, mensagem e, se quiser,
 * o texto, o ícone, a variante e a função do botão.
 * Devolve: a tela de estado montada. O botão só aparece se o texto E a função
 * forem informados.
 */
export default function EstruturaEstado({
  icone,
  corIcone,
  corFundoIcone,
  titulo,
  mensagem,
  textoBotao,
  iconeBotao,
  varianteBotao = "primario",
  aoPressionarBotao,
}: PropsEstruturaEstado) {
  return (
    <View style={estilosGlobais.centralizado}>
      <View style={[estilosGlobais.circuloIcone, { backgroundColor: corFundoIcone }]}>
        <Ionicons name={icone} size={40} color={corIcone} />
      </View>
      <Text style={[estilosGlobais.subtitulo, estilosGlobais.textoCentralizado]}>{titulo}</Text>
      <Text style={[estilosGlobais.textoSecundario, estilosGlobais.textoCentralizado, estilos.mensagem]}>
        {mensagem}
      </Text>
      {textoBotao && aoPressionarBotao ? (
        <BotaoPrincipal
          titulo={textoBotao}
          icone={iconeBotao}
          variante={varianteBotao}
          aoPressionar={aoPressionarBotao}
        />
      ) : null}
    </View>
  );
}

const estilos = StyleSheet.create({
  mensagem: {
    marginTop: espacamento.pequeno,
    marginBottom: espacamento.grande,
  },
});
