/**
 * ARQUIVO: src/estilos/estilosGlobais.ts
 *
 * PARA QUE SERVE?
 * É o nosso "arquivo CSS": um único StyleSheet.create com os estilos usados em
 * várias telas e componentes (container, título, texto, botão, cartão, campo de
 * texto, mensagem de erro...).
 *
 * CONCEITO: StyleSheet.create
 * Cria um objeto de estilos. Parece CSS, mas com diferenças:
 * - os nomes são em camelCase (backgroundColor em vez de background-color);
 * - os números são em "pontos" (sem "px");
 * - o layout usa Flexbox, e por padrão os itens ficam em COLUNA (flexDirection: "column").
 *
 * Estilos que só uma tela usa ficam no fim do arquivo dessa tela, sempre usando
 * os valores de tema.ts.
 */
import { Platform, StyleSheet } from "react-native";
import { bordas, cores, espacamento, fontes, pesos, sombra } from "./tema";

export const estilosGlobais = StyleSheet.create({
  /* ---------- Estrutura das telas ---------- */

  // flex: 1 faz a tela ocupar todo o espaço disponível
  container: {
    flex: 1,
    backgroundColor: cores.fundo,
  },
  conteudo: {
    padding: espacamento.medio,
  },
  // usado nos estados de carregando, erro e vazio (tudo no centro da tela)
  centralizado: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: espacamento.grande,
    backgroundColor: cores.fundo,
  },
  // coloca os filhos lado a lado (em linha), alinhados no centro
  linha: {
    flexDirection: "row",
    alignItems: "center",
  },
  // espaço entre os itens de uma lista
  separador: {
    height: espacamento.medio,
  },
  // círculo com um ícone grande no meio (estados de erro/vazio e tela Sobre)
  circuloIcone: {
    width: 80,
    height: 80,
    borderRadius: 40, // metade da largura = círculo perfeito
    alignItems: "center",
    justifyContent: "center",
    marginBottom: espacamento.medio,
  },

  /* ---------- Textos ---------- */

  titulo: {
    fontSize: fontes.titulo,
    fontWeight: pesos.negrito,
    color: cores.texto,
  },
  subtitulo: {
    fontSize: fontes.grande,
    fontWeight: pesos.negrito,
    color: cores.texto,
  },
  texto: {
    fontSize: fontes.normal,
    color: cores.texto,
    lineHeight: 20,
  },
  textoSecundario: {
    fontSize: fontes.normal,
    color: cores.textoSecundario,
    lineHeight: 20,
  },
  textoCentralizado: {
    textAlign: "center",
  },
  // texto pequeno acima das listas (ex.: "12 eventos encontrados")
  textoQuantidade: {
    fontSize: fontes.pequena,
    color: cores.textoSuave,
    marginBottom: espacamento.pequeno,
  },
  // título pequeno de uma seção (ex.: "SOBRE O EVENTO")
  rotuloSecao: {
    fontSize: fontes.pequena,
    fontWeight: pesos.negrito,
    color: cores.textoSuave,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: espacamento.pequeno,
  },

  /* ---------- Cartões ---------- */

  // "...sombra" copia aqui dentro as propriedades de sombra do tema (iOS ou Android)
  cartao: {
    backgroundColor: cores.superficie,
    borderRadius: bordas.raioGrande,
    padding: espacamento.medio,
    ...sombra,
  },

  /* ---------- Botões ---------- */

  botao: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48, // altura mínima confortável para o dedo
    paddingHorizontal: espacamento.grande,
    borderRadius: bordas.raioMedio,
    backgroundColor: cores.primaria,
  },
  textoBotao: {
    fontSize: fontes.media,
    fontWeight: pesos.negrito,
    color: cores.textoSobreCor,
  },

  /* ---------- Formulário ---------- */

  rotuloCampo: {
    fontSize: fontes.normal,
    fontWeight: pesos.medio,
    color: cores.texto,
    marginBottom: espacamento.minimo,
  },
  campoTexto: {
    minHeight: 48,
    borderWidth: bordas.espessura,
    borderColor: cores.borda,
    borderRadius: bordas.raioMedio,
    backgroundColor: cores.superficie,
    paddingHorizontal: espacamento.medio,
    // O TextInput do Android já tem um espaço interno próprio; o do iOS não.
    // Por isso o espaço vertical é diferente em cada plataforma.
    paddingVertical: Platform.select({ ios: 12, android: 8, default: 10 }),
    fontSize: fontes.media,
    color: cores.texto,
  },
  campoTextoComErro: {
    borderColor: cores.erro,
    backgroundColor: cores.erroClaro,
  },
  mensagemErro: {
    fontSize: fontes.pequena,
    color: cores.erro,
    marginTop: espacamento.minimo,
  },

  /* ---------- Etiquetas (pequenas "pílulas" de texto) ---------- */

  etiqueta: {
    alignSelf: "flex-start", // a etiqueta fica do tamanho do texto, sem esticar
    paddingHorizontal: espacamento.pequeno,
    paddingVertical: 2,
    borderRadius: bordas.raioPilula,
  },
  textoEtiqueta: {
    fontSize: fontes.pequena,
    fontWeight: pesos.negrito,
  },
});
