/**
 * ARQUIVO: src/componentes/estados/EstadoVazio.tsx
 *
 * PARA QUE SERVE?
 * Estado de tela "VAZIO": a busca deu certo, mas não há nada para mostrar
 * (nenhum favorito, ou nenhum evento com os filtros escolhidos).
 *
 * É diferente do erro: aqui nada falhou. Por isso a mensagem orienta o usuário
 * sobre o que fazer (ex.: "Limpar filtros", "Explorar eventos").
 *
 * O layout vem do EstruturaEstado; aqui só escolhemos o ícone e as cores (roxas).
 */
import { cores } from "../../estilos/tema";
import { NomeIcone } from "../../tipos/icones";
import EstruturaEstado from "./EstruturaEstado";

interface PropsEstadoVazio {
  titulo: string;
  mensagem: string;
  icone?: NomeIcone;
  textoBotao?: string;
  aoPressionarBotao?: () => void;
}

/**
 * Recebe (props): título, mensagem, ícone (opcional) e, se quiser, o texto e a
 * função de um botão de ação.
 * Devolve: a tela de "nada para mostrar".
 */
export default function EstadoVazio({
  titulo,
  mensagem,
  icone = "calendar-clear-outline",
  textoBotao,
  aoPressionarBotao,
}: PropsEstadoVazio) {
  return (
    <EstruturaEstado
      icone={icone}
      corIcone={cores.primaria}
      corFundoIcone={cores.primariaClara}
      titulo={titulo}
      mensagem={mensagem}
      textoBotao={textoBotao}
      varianteBotao="secundario"
      aoPressionarBotao={aoPressionarBotao}
    />
  );
}
