/**
 * ARQUIVO: src/componentes/BotaoPrincipal.tsx
 *
 * PARA QUE SERVE?
 * Botão padrão do app, usado em todas as telas. Tem três aparências (variantes):
 * - "primario": fundo colorido (ação principal da tela);
 * - "secundario": fundo branco com borda (ações de apoio);
 * - "perigo": texto vermelho (ações como "Cancelar lembrete").
 * Também tem estado desabilitado e estado "carregando" (mostra uma rodinha).
 *
 * CONCEITO: props
 * Props (propriedades) são os dados que um componente recebe de quem o usa,
 * como os parâmetros de uma função. Exemplo de uso:
 *   <BotaoPrincipal titulo="Enviar" aoPressionar={enviar} />
 * A interface PropsBotaoPrincipal lista as props e o tipo de cada uma.
 * O "?" indica prop OPCIONAL; nesse caso usamos um valor padrão
 * (ex.: variante = "primario").
 */
import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, Pressable, StyleSheet, Text } from "react-native";
import { estilosGlobais } from "../estilos/estilosGlobais";
import { bordas, cores, espacamento } from "../estilos/tema";
import { NomeIcone } from "../tipos/icones";

type VarianteBotao = "primario" | "secundario" | "perigo";

interface PropsBotaoPrincipal {
  titulo: string;
  aoPressionar: () => void;
  variante?: VarianteBotao;
  icone?: NomeIcone;
  desabilitado?: boolean;
  carregando?: boolean;
}

/** Cor do texto e do ícone de cada variante. */
const CORES_TEXTO: Record<VarianteBotao, string> = {
  primario: cores.textoSobreCor,
  secundario: cores.primaria,
  perigo: cores.erro,
};

/**
 * Recebe (props): título, função do toque e, opcionalmente, variante, ícone,
 * "desabilitado" e "carregando".
 * Devolve: o botão pronto. Enquanto carrega, mostra uma rodinha no lugar do
 * texto e não aceita toques.
 */
export default function BotaoPrincipal({
  titulo,
  aoPressionar,
  variante = "primario",
  icone,
  desabilitado = false,
  carregando = false,
}: PropsBotaoPrincipal) {
  // Enquanto carrega, o botão também fica bloqueado (evita enviar duas vezes).
  const bloqueado = desabilitado || carregando;
  const corTexto = desabilitado ? cores.desativado : CORES_TEXTO[variante];

  return (
    // Pressable detecta o toque. O "style" pode ser uma função que recebe
    // { pressed } e devolve estilos diferentes enquanto o dedo está no botão.
    // Uma lista de estilos [a, b, c] é aplicada em ordem: o último vence.
    // "condição && estilo" só aplica o estilo quando a condição é verdadeira.
    <Pressable
      onPress={aoPressionar}
      disabled={bloqueado}
      accessibilityRole="button"
      accessibilityState={{ disabled: bloqueado }}
      style={({ pressed }) => [
        estilosGlobais.botao,
        estilos[variante],
        desabilitado && estilos.desabilitado,
        pressed && estilos.pressionado,
      ]}
    >
      {carregando ? (
        <ActivityIndicator color={corTexto} />
      ) : (
        // <> e </> (Fragment) agrupam elementos sem criar uma View extra na tela.
        <>
          {icone ? <Ionicons name={icone} size={20} color={corTexto} style={estilos.icone} /> : null}
          <Text style={[estilosGlobais.textoBotao, { color: corTexto }]}>{titulo}</Text>
        </>
      )}
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  primario: {
    backgroundColor: cores.primaria,
  },
  secundario: {
    backgroundColor: cores.superficie,
    borderWidth: bordas.espessura,
    borderColor: cores.primaria,
  },
  perigo: {
    backgroundColor: cores.superficie,
    borderWidth: bordas.espessura,
    borderColor: cores.erro,
  },
  desabilitado: {
    backgroundColor: cores.desativadoClaro,
    borderColor: cores.borda,
  },
  pressionado: {
    opacity: 0.8,
  },
  icone: {
    marginRight: espacamento.pequeno,
  },
});
