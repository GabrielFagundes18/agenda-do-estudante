/**
 * ARQUIVO: src/telas/TelaFormularioInscricao.tsx
 *
 * PARA QUE SERVE?
 * Formulário de inscrição (manifestação de interesse) em um evento:
 * nome, e-mail, matrícula, curso e observação.
 *
 * - As regras de validação ficam em utilitarios/validacoes.ts;
 * - o estado do formulário e o envio ficam em ganchos/useFormularioInscricao.ts;
 * - esta tela só desenha os campos e mostra o resultado.
 *
 * O erro de cada campo aparece embaixo dele. Ao enviar com sucesso, a inscrição
 * é salva no AsyncStorage e aparece uma mensagem de sucesso.
 */
import { useHeaderHeight } from "@react-navigation/elements";
import { Alert, KeyboardAvoidingView, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import BotaoPrincipal from "../componentes/BotaoPrincipal";
import CampoFormulario from "../componentes/CampoFormulario";
import MensagemInformativa from "../componentes/MensagemInformativa";
import { LIMITES_FORMULARIO } from "../constantes/configuracoes";
import { estilosGlobais } from "../estilos/estilosGlobais";
import { espacamento } from "../estilos/tema";
import { useFormularioInscricao } from "../ganchos/useFormularioInscricao";
import { useInscricaoDoEvento } from "../ganchos/useInscricaoDoEvento";
import { PropsTelaFormulario } from "../navegacao/tiposNavegacao";
import { formatarPeriodoEvento } from "../utilitarios/formatarData";
import { obterMensagemStatus, podeSeInscrever } from "../utilitarios/statusEvento";

/**
 * Recebe (props): "route" (com o evento em route.params) e "navigation" (para
 * voltar depois do envio). Essas props são enviadas pelo React Navigation.
 * Devolve: o formulário com os cinco campos e o botão de envio.
 */
export default function TelaFormularioInscricao({ route, navigation }: PropsTelaFormulario) {
  const { evento } = route.params;
  const { dados, erros, enviando, alterarCampo, enviarInscricao } = useFormularioInscricao(evento);
  const inscricaoAnterior = useInscricaoDoEvento(evento.id);
  const alturaCabecalho = useHeaderHeight();
  const insets = useSafeAreaInsets();

  // Segurança extra: a tela de detalhes já bloqueia o botão, mas conferimos de
  // novo aqui (o evento pode ter encerrado enquanto a tela estava aberta).
  const inscricaoLiberada = podeSeInscrever(evento);

  /** Chamada pelo botão "Enviar inscrição". */
  async function aoTocarEnviar() {
    const inscricao = await enviarInscricao();
    if (!inscricao) {
      return; // havia erros; eles já aparecem embaixo dos campos
    }
    const primeiroNome = inscricao.nome.split(" ")[0];
    Alert.alert(
      "Inscrição registrada!",
      `Obrigado, ${primeiroNome}! Seu interesse em "${evento.titulo}" foi salvo neste aparelho.`,
      [{ text: "OK", onPress: () => navigation.goBack() }],
    );
  }

  return (
    // TECLADO: o KeyboardAvoidingView empurra o conteúdo para cima quando o
    // teclado abre, para ele não cobrir o campo que está sendo digitado.
    //
    // Diferença entre plataformas: tutoriais antigos usam
    //   behavior={Platform.OS === "ios" ? "padding" : "height"}
    // porque o Android redimensionava a janela sozinho. Hoje os apps Expo no
    // Android usam o modo "edge-to-edge" (o app desenha atrás das barras do
    // sistema) e a janela NÃO redimensiona mais. Por isso a documentação atual do
    // Expo recomenda "padding" nas DUAS plataformas.
    //
    // keyboardVerticalOffset: a altura do cabeçalho, que fica acima do formulário
    // e precisa entrar na conta.
    <KeyboardAvoidingView style={estilosGlobais.container} behavior="padding" keyboardVerticalOffset={alturaCabecalho}>
      <ScrollView
        contentContainerStyle={[estilosGlobais.conteudo, { paddingBottom: insets.bottom + espacamento.grande }]}
        keyboardShouldPersistTaps="handled" // permite tocar no botão sem antes fechar o teclado
      >
        <View style={[estilosGlobais.cartao, estilos.resumoEvento]}>
          <Text style={estilosGlobais.rotuloSecao}>Inscrição em</Text>
          <Text style={estilosGlobais.subtitulo}>{evento.titulo}</Text>
          <Text style={[estilosGlobais.textoSecundario, estilos.periodo]}>{formatarPeriodoEvento(evento)}</Text>
        </View>

        {inscricaoLiberada ? (
          <Text style={[estilosGlobais.textoSecundario, estilos.instrucao]}>
            Preencha seus dados para registrar seu interesse. Campos com * são obrigatórios.
          </Text>
        ) : (
          <MensagemInformativa tipo="erro" texto={obterMensagemStatus(evento)} />
        )}

        {inscricaoAnterior ? (
          <MensagemInformativa
            tipo="info"
            texto={`Você já se inscreveu como ${inscricaoAnterior.nome}. Ao enviar de novo, a inscrição anterior será substituída.`}
          />
        ) : null}

        <CampoFormulario
          rotulo="Nome completo"
          obrigatorio
          valor={dados.nome}
          aoAlterarTexto={(texto) => alterarCampo("nome", texto)}
          erro={erros.nome}
          dica="Ex.: Ana Souza"
          capitalizacao="words"
          autoCompletar="name"
        />
        <CampoFormulario
          rotulo="E-mail"
          obrigatorio
          valor={dados.email}
          aoAlterarTexto={(texto) => alterarCampo("email", texto)}
          erro={erros.email}
          dica="nome@exemplo.com"
          tipoTeclado="email-address"
          capitalizacao="none"
          autoCompletar="email"
        />
        <CampoFormulario
          rotulo="Matrícula"
          obrigatorio
          valor={dados.matricula}
          aoAlterarTexto={(texto) => alterarCampo("matricula", texto)}
          erro={erros.matricula}
          dica="Somente números"
          tipoTeclado="number-pad"
          capitalizacao="none"
          tamanhoMaximo={LIMITES_FORMULARIO.matriculaMaxima}
        />
        <CampoFormulario
          rotulo="Curso"
          obrigatorio
          valor={dados.curso}
          aoAlterarTexto={(texto) => alterarCampo("curso", texto)}
          erro={erros.curso}
          dica="Ex.: Engenharia de Software"
          capitalizacao="words"
        />
        <CampoFormulario
          rotulo="Observação"
          valor={dados.observacao}
          aoAlterarTexto={(texto) => alterarCampo("observacao", texto)}
          erro={erros.observacao}
          dica="Alguma necessidade ou comentário? (opcional)"
          multilinhas
          tamanhoMaximo={LIMITES_FORMULARIO.observacaoMaxima}
        />

        <BotaoPrincipal
          titulo="Enviar inscrição"
          icone="send-outline"
          carregando={enviando}
          desabilitado={!inscricaoLiberada}
          aoPressionar={aoTocarEnviar}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const estilos = StyleSheet.create({
  resumoEvento: {
    marginBottom: espacamento.medio,
  },
  periodo: {
    marginTop: espacamento.minimo,
  },
  instrucao: {
    marginBottom: espacamento.medio,
  },
});
