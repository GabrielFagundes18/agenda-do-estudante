/**
 * ARQUIVO: src/componentes/PainelFiltros.tsx
 *
 * PARA QUE SERVE?
 * Junta todos os filtros da lista de eventos:
 * - categorias (sempre visíveis);
 * - "Mais filtros", que abre e fecha: data, modalidade e "mostrar encerrados".
 *
 * Por que esconder parte dos filtros? Em um celular, quatro fileiras de filtros
 * ocupariam metade da tela. O contador "Mais filtros (2)" avisa quando há
 * filtros escondidos ligados.
 *
 * Este componente tem um estado PRÓPRIO (expandido), porque abrir/fechar o painel
 * só interessa a ele. Os valores dos filtros vêm de fora, por props.
 */
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Platform, Pressable, StyleSheet, Switch, Text, View } from "react-native";
import { OPCOES_MODALIDADE, OPCOES_PERIODO } from "../constantes/configuracoes";
import { estilosGlobais } from "../estilos/estilosGlobais";
import { cores, espacamento, fontes, pesos } from "../estilos/tema";
import { CategoriaEvento, FiltrosEventos, Modalidade, PeriodoFiltro } from "../tipos/evento";
import Chip from "./Chip";
import FiltroCategorias from "./FiltroCategorias";

interface PropsPainelFiltros {
  filtros: FiltrosEventos;
  quantidadeFiltrosExtras: number;
  aoAlterarCategoria: (categoria: CategoriaEvento | "todas") => void;
  aoAlterarPeriodo: (periodo: PeriodoFiltro) => void;
  aoAlterarModalidade: (modalidade: Modalidade | "todas") => void;
  aoAlterarMostrarEncerrados: (mostrar: boolean) => void;
  aoLimparFiltros: () => void;
}

/**
 * Recebe (props): os filtros atuais, quantos filtros extras estão ligados e uma
 * função para mudar cada filtro (mais a de limpar todos).
 * Devolve: as categorias e, se o painel estiver aberto, os filtros extras.
 */
export default function PainelFiltros({
  filtros,
  quantidadeFiltrosExtras,
  aoAlterarCategoria,
  aoAlterarPeriodo,
  aoAlterarModalidade,
  aoAlterarMostrarEncerrados,
  aoLimparFiltros,
}: PropsPainelFiltros) {
  const [expandido, setExpandido] = useState(false);

  const textoBotao = expandido ? "Menos filtros" : "Mais filtros";
  const contador = quantidadeFiltrosExtras > 0 ? ` (${quantidadeFiltrosExtras})` : "";

  return (
    <View>
      <FiltroCategorias categoriaSelecionada={filtros.categoria} aoSelecionar={aoAlterarCategoria} />

      <Pressable
        style={estilos.botaoMaisFiltros}
        onPress={() => setExpandido(!expandido)}
        accessibilityRole="button"
        accessibilityState={{ expanded: expandido }}
      >
        <Ionicons name="options-outline" size={18} color={cores.primaria} />
        <Text style={estilos.textoMaisFiltros}>
          {textoBotao}
          {contador}
        </Text>
        <Ionicons name={expandido ? "chevron-up" : "chevron-down"} size={18} color={cores.primaria} />
      </Pressable>

      {expandido ? (
        <View style={estilos.areaExtra}>
          <Text style={estilosGlobais.rotuloSecao}>Data</Text>
          <View style={estilos.linhaChips}>
            {OPCOES_PERIODO.map((opcao) => (
              <Chip
                key={opcao.valor}
                rotulo={opcao.rotulo}
                selecionado={filtros.periodo === opcao.valor}
                aoPressionar={() => aoAlterarPeriodo(opcao.valor)}
              />
            ))}
          </View>

          <Text style={estilosGlobais.rotuloSecao}>Modalidade</Text>
          <View style={estilos.linhaChips}>
            {OPCOES_MODALIDADE.map((opcao) => (
              <Chip
                key={opcao.valor}
                rotulo={opcao.rotulo}
                selecionado={filtros.modalidade === opcao.valor}
                aoPressionar={() => aoAlterarModalidade(opcao.valor)}
              />
            ))}
          </View>

          <View style={estilos.linhaInterruptor}>
            <Text style={estilosGlobais.texto}>Mostrar eventos encerrados</Text>
            {/* Diferença entre plataformas: no iOS a "bolinha" do Switch é sempre
                branca; no Android ela muda de cor conforme o sistema. Definimos
                branco no Android para o visual ficar igual nas duas plataformas. */}
            <Switch
              value={filtros.mostrarEncerrados}
              onValueChange={aoAlterarMostrarEncerrados}
              trackColor={{ false: cores.borda, true: cores.primaria }}
              thumbColor={Platform.OS === "android" ? cores.superficie : undefined}
              ios_backgroundColor={cores.borda}
              accessibilityLabel="Mostrar eventos encerrados"
            />
          </View>

          <Pressable onPress={aoLimparFiltros} accessibilityRole="button" hitSlop={8}>
            <Text style={estilos.textoLimpar}>Limpar filtros</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

const estilos = StyleSheet.create({
  botaoMaisFiltros: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: espacamento.minimo,
    paddingVertical: espacamento.pequeno,
  },
  textoMaisFiltros: {
    fontSize: fontes.normal,
    fontWeight: pesos.medio,
    color: cores.primaria,
  },
  areaExtra: {
    paddingBottom: espacamento.pequeno,
  },
  linhaChips: {
    flexDirection: "row",
    flexWrap: "wrap", // se não couber na linha, o chip desce para a próxima
    gap: espacamento.pequeno,
    marginBottom: espacamento.medio,
  },
  linhaInterruptor: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between", // texto na esquerda, Switch na direita
    marginBottom: espacamento.pequeno,
  },
  textoLimpar: {
    fontSize: fontes.normal,
    fontWeight: pesos.medio,
    color: cores.erro,
  },
});
