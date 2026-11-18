/**
 * ARQUIVO: src/componentes/CampoFormulario.tsx
 *
 * PARA QUE SERVE?
 * Campo de texto (TextInput) reutilizável do formulário, com:
 * - rótulo em cima (com "*" se for obrigatório);
 * - borda vermelha e mensagem de erro EMBAIXO quando há erro;
 * - contador de caracteres nos campos de várias linhas.
 *
 * Assim os cinco campos do formulário ficam iguais, sem repetir código.
 *
 * As props têm nomes em português (tipoTeclado, capitalizacao...) e são
 * repassadas para as props originais do TextInput (keyboardType, autoCapitalize...).
 */
import { KeyboardTypeOptions, StyleSheet, Text, TextInput, TextInputProps, View } from "react-native";
import { estilosGlobais } from "../estilos/estilosGlobais";
import { cores, espacamento, fontes } from "../estilos/tema";

interface PropsCampoFormulario {
  rotulo: string;
  valor: string;
  aoAlterarTexto: (texto: string) => void;
  erro?: string;
  obrigatorio?: boolean;
  dica?: string; // placeholder
  tipoTeclado?: KeyboardTypeOptions; // ex.: "email-address", "number-pad"
  capitalizacao?: "none" | "sentences" | "words" | "characters";
  autoCompletar?: TextInputProps["autoComplete"]; // ajuda o teclado a sugerir nome/e-mail
  multilinhas?: boolean;
  tamanhoMaximo?: number;
}

/**
 * Recebe (props): rótulo, valor atual, função chamada a cada letra digitada,
 * mensagem de erro (opcional) e opções do teclado.
 * Devolve: o rótulo, a caixa de texto e, se houver, o erro e o contador.
 */
export default function CampoFormulario({
  rotulo,
  valor,
  aoAlterarTexto,
  erro,
  obrigatorio = false,
  dica,
  tipoTeclado = "default",
  capitalizacao = "sentences",
  autoCompletar,
  multilinhas = false,
  tamanhoMaximo,
}: PropsCampoFormulario) {
  return (
    <View style={estilos.container}>
      <Text style={estilosGlobais.rotuloCampo}>
        {rotulo}
        {obrigatorio ? <Text style={estilos.asterisco}> *</Text> : null}
      </Text>

      <TextInput
        style={[
          estilosGlobais.campoTexto,
          multilinhas && estilos.campoMultilinhas,
          erro ? estilosGlobais.campoTextoComErro : null,
        ]}
        value={valor}
        onChangeText={aoAlterarTexto}
        placeholder={dica}
        placeholderTextColor={cores.textoSuave}
        keyboardType={tipoTeclado}
        autoCapitalize={capitalizacao}
        autoComplete={autoCompletar}
        multiline={multilinhas}
        maxLength={tamanhoMaximo}
        accessibilityLabel={rotulo}
        accessibilityHint={erro}
      />

      {erro ? <Text style={estilosGlobais.mensagemErro}>{erro}</Text> : null}

      {multilinhas && tamanhoMaximo ? (
        <Text style={estilos.contador}>
          {valor.length}/{tamanhoMaximo}
        </Text>
      ) : null}
    </View>
  );
}

const estilos = StyleSheet.create({
  container: {
    marginBottom: espacamento.medio,
  },
  asterisco: {
    color: cores.erro,
  },
  campoMultilinhas: {
    minHeight: 100,
    // No Android, um campo de várias linhas começa com o texto no MEIO da caixa.
    // "top" coloca o texto no topo, igual ao comportamento do iOS.
    textAlignVertical: "top",
  },
  contador: {
    alignSelf: "flex-end",
    marginTop: espacamento.minimo,
    fontSize: fontes.pequena,
    color: cores.textoSuave,
  },
});
