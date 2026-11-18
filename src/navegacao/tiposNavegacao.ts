/**
 * ARQUIVO: src/navegacao/tiposNavegacao.ts
 *
 * PARA QUE SERVE?
 * Diz ao TypeScript quais telas (rotas) existem e quais PARÂMETROS cada uma recebe.
 * Com isso, o editor avisa se tentarmos abrir uma tela que não existe ou
 * esquecermos de enviar um parâmetro obrigatório.
 *
 * Exemplo: navigation.navigate("DetalhesEvento", { evento })
 *          → se esquecermos o { evento }, o editor acusa o erro.
 *
 * "undefined" significa que a tela não recebe parâmetros.
 * (A documentação do React Navigation recomenda "type" em vez de "interface" aqui.)
 */
import { NavigatorScreenParams } from "@react-navigation/native";
import { NativeStackNavigationProp, NativeStackScreenProps } from "@react-navigation/native-stack";
import { Evento } from "../tipos/evento";

/** Telas das ABAS inferiores. */
export type ParametrosAbas = {
  ListaEventos: undefined;
  Favoritos: undefined;
  Sobre: undefined;
};

/**
 * Telas da PILHA principal. "Abas" é o conjunto de abas inteiro, tratado como
 * uma única tela da pilha. Detalhes e Formulário abrem POR CIMA das abas.
 */
export type ParametrosPilha = {
  Abas: NavigatorScreenParams<ParametrosAbas> | undefined;
  DetalhesEvento: { evento: Evento };
  FormularioInscricao: { evento: Evento };
};

/** Tipo do objeto "navigation" usado pelas telas para abrir outras telas. */
export type NavegacaoPilha = NativeStackNavigationProp<ParametrosPilha>;

/** Props recebidas pela tela de Detalhes (navigation + route com os parâmetros). */
export type PropsTelaDetalhes = NativeStackScreenProps<ParametrosPilha, "DetalhesEvento">;

/** Props recebidas pela tela do Formulário de inscrição. */
export type PropsTelaFormulario = NativeStackScreenProps<ParametrosPilha, "FormularioInscricao">;
