/**
 * ARQUIVO: src/componentes/Etiqueta.tsx
 *
 * PARA QUE SERVE?
 * Uma "pílula" pequena de texto colorido. É a base de outras etiquetas:
 * categoria do evento ("Palestra"), status ("Encerrado") e temas ("Python").
 *
 * Quem usa escolhe as cores (sempre vindas de tema.ts). Assim o mesmo componente
 * serve para todos os casos, sem repetir código.
 */
import { Text, View } from "react-native";
import { estilosGlobais } from "../estilos/estilosGlobais";

interface PropsEtiqueta {
  texto: string;
  corTexto: string;
  corFundo: string;
}

/**
 * Recebe (props): o texto, a cor do texto e a cor do fundo.
 * Devolve: a pílula colorida com o texto.
 */
export default function Etiqueta({ texto, corTexto, corFundo }: PropsEtiqueta) {
  return (
    <View style={[estilosGlobais.etiqueta, { backgroundColor: corFundo }]}>
      <Text style={[estilosGlobais.textoEtiqueta, { color: corTexto }]}>{texto}</Text>
    </View>
  );
}
