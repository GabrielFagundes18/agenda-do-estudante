/**
 * ARQUIVO: src/componentes/FiltroCategorias.tsx
 *
 * PARA QUE SERVE?
 * Fileira de chips com as categorias ("Todas", "Palestra", "Oficina"...).
 * Cada categoria aparece com a sua cor quando selecionada.
 *
 * Usamos um ScrollView HORIZONTAL porque os chips não cabem todos na largura
 * do celular; o usuário arrasta para o lado para ver o resto.
 */
import { ScrollView, StyleSheet } from "react-native";
import { CATEGORIAS } from "../constantes/configuracoes";
import { cores, coresCategorias, espacamento } from "../estilos/tema";
import { CategoriaEvento } from "../tipos/evento";
import Chip from "./Chip";

interface PropsFiltroCategorias {
  categoriaSelecionada: CategoriaEvento | "todas";
  aoSelecionar: (categoria: CategoriaEvento | "todas") => void;
}

/**
 * Recebe (props): a categoria selecionada e a função chamada ao tocar em outra.
 * Devolve: a fileira rolável com o chip "Todas" e um chip por categoria.
 */
export default function FiltroCategorias({ categoriaSelecionada, aoSelecionar }: PropsFiltroCategorias) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={estilos.lista}>
      <Chip
        rotulo="Todas"
        cor={cores.primaria}
        selecionado={categoriaSelecionada === "todas"}
        aoPressionar={() => aoSelecionar("todas")}
      />
      {/* map() cria um Chip para cada categoria. A prop "key" é obrigatória em
          listas: ela ajuda o React a saber qual item é qual quando a lista muda. */}
      {CATEGORIAS.map((categoria) => (
        <Chip
          key={categoria}
          rotulo={categoria}
          cor={coresCategorias[categoria].forte}
          selecionado={categoriaSelecionada === categoria}
          aoPressionar={() => aoSelecionar(categoria)}
        />
      ))}
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  lista: {
    gap: espacamento.pequeno, // espaço entre os chips
    paddingVertical: espacamento.minimo,
  },
});
