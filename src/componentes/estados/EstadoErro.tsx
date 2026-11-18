/**
 * ARQUIVO: src/componentes/estados/EstadoErro.tsx
 *
 * PARA QUE SERVE?
 * Estado de tela "ERRO": explica o que aconteceu e oferece o botão
 * "Tentar novamente". Nunca deixamos o usuário "preso" em uma tela de erro
 * sem saída.
 *
 * O layout vem do EstruturaEstado; aqui só escolhemos o ícone, as cores
 * (vermelhas) e os textos.
 */
import { cores } from "../../estilos/tema";
import EstruturaEstado from "./EstruturaEstado";

interface PropsEstadoErro {
  mensagem: string;
  aoTentarNovamente: () => void;
}

/**
 * Recebe (props): a mensagem do erro e a função do botão "Tentar novamente".
 * Devolve: a tela de erro.
 */
export default function EstadoErro({ mensagem, aoTentarNovamente }: PropsEstadoErro) {
  return (
    <EstruturaEstado
      icone="cloud-offline-outline"
      corIcone={cores.erro}
      corFundoIcone={cores.erroClaro}
      titulo="Algo deu errado"
      mensagem={mensagem}
      textoBotao="Tentar novamente"
      iconeBotao="refresh"
      aoPressionarBotao={aoTentarNovamente}
    />
  );
}
