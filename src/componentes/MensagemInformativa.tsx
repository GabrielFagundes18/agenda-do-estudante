/**
 * ARQUIVO: src/componentes/MensagemInformativa.tsx
 *
 * PARA QUE SERVE?
 * Uma caixa colorida com ícone e texto, para avisos dentro das telas:
 * - "aviso": uma das APIs falhou, mas a lista continua aparecendo;
 * - "erro": inscrições bloqueadas (evento cancelado ou sem vagas);
 * - "info": evento encerrado;
 * - "sucesso": mensagens positivas (ex.: "Você já se inscreveu").
 *
 * Pode ter um botão de ação opcional embaixo do texto (ex.: "Tentar novamente").
 */
import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { bordas, cores, espacamento, fontes, pesos } from "../estilos/tema";
import { NomeIcone } from "../tipos/icones";

type TipoMensagem = "aviso" | "erro" | "info" | "sucesso";

interface PropsMensagemInformativa {
  texto: string;
  tipo?: TipoMensagem;
  textoAcao?: string; // texto do botão opcional
  aoPressionarAcao?: () => void; // função do botão opcional
}

/** Ícone e cores de cada tipo de mensagem. */
const APARENCIAS: Record<TipoMensagem, { icone: NomeIcone; corTexto: string; corFundo: string }> = {
  aviso: { icone: "warning-outline", corTexto: cores.aviso, corFundo: cores.avisoClaro },
  erro: { icone: "alert-circle-outline", corTexto: cores.erro, corFundo: cores.erroClaro },
  info: { icone: "information-circle-outline", corTexto: cores.primariaEscura, corFundo: cores.primariaClara },
  sucesso: { icone: "checkmark-circle-outline", corTexto: cores.sucesso, corFundo: cores.sucessoClaro },
};

/**
 * Recebe (props): o texto, o tipo (padrão "info") e, opcionalmente, o texto e a
 * função de um botão de ação.
 * Devolve: a caixa colorida. O botão só aparece se o texto E a função forem informados.
 */
export default function MensagemInformativa({ texto, tipo = "info", textoAcao, aoPressionarAcao }: PropsMensagemInformativa) {
  const aparencia = APARENCIAS[tipo];

  return (
    <View style={[estilos.caixa, { backgroundColor: aparencia.corFundo }]} accessibilityRole="alert">
      <Ionicons name={aparencia.icone} size={20} color={aparencia.corTexto} style={estilos.icone} />
      <View style={estilos.conteudo}>
        <Text style={[estilos.texto, { color: aparencia.corTexto }]}>{texto}</Text>
        {textoAcao && aoPressionarAcao ? (
          <Pressable onPress={aoPressionarAcao} accessibilityRole="button" hitSlop={8} style={estilos.botaoAcao}>
            <Text style={[estilos.textoAcao, { color: aparencia.corTexto }]}>{textoAcao}</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  caixa: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: espacamento.medio,
    borderRadius: bordas.raioMedio,
    marginVertical: espacamento.pequeno,
  },
  icone: {
    marginRight: espacamento.pequeno,
  },
  conteudo: {
    flex: 1,
  },
  texto: {
    fontSize: fontes.normal,
    lineHeight: 20,
  },
  botaoAcao: {
    alignSelf: "flex-start",
    marginTop: espacamento.pequeno,
  },
  textoAcao: {
    fontSize: fontes.normal,
    fontWeight: pesos.negrito,
    textDecorationLine: "underline",
  },
});
