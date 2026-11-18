/**
 * ARQUIVO: src/navegacao/NavegacaoPrincipal.tsx
 *
 * PARA QUE SERVE?
 * Monta a navegação do app com o React Navigation, combinando dois tipos:
 *
 *   PILHA (Stack) ─┬─ Abas ─┬─ ListaEventos  (aba "Eventos")
 *                  │        ├─ Favoritos     (aba "Favoritos")
 *                  │        └─ Sobre         (aba "Sobre")
 *                  ├─ DetalhesEvento         (abre por cima das abas)
 *                  └─ FormularioInscricao    (abre por cima dos detalhes)
 *
 * - ABAS (Bottom Tabs): a barra inferior para trocar entre as seções principais.
 * - PILHA (Native Stack): telas "empilhadas". Abrir uma tela coloca ela no topo;
 *   o botão voltar tira ela do topo. Usa a navegação nativa de cada sistema
 *   (animações e gestos de voltar do iOS e do Android).
 *
 * Por que Detalhes fica na pilha e não dentro de uma aba? Porque assim ele pode
 * ser aberto tanto da aba Eventos quanto da aba Favoritos.
 */
import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { DefaultTheme, NavigationContainer, Theme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { cores, pesos } from "../estilos/tema";
import TelaDetalhesEvento from "../telas/TelaDetalhesEvento";
import TelaFavoritos from "../telas/TelaFavoritos";
import TelaFormularioInscricao from "../telas/TelaFormularioInscricao";
import TelaListaEventos from "../telas/TelaListaEventos";
import TelaSobre from "../telas/TelaSobre";
import { NomeIcone } from "../tipos/icones";
import { ParametrosAbas, ParametrosPilha } from "./tiposNavegacao";

const Pilha = createNativeStackNavigator<ParametrosPilha>();
const Abas = createBottomTabNavigator<ParametrosAbas>();

/**
 * Tema da navegação: aplica as cores do nosso tema.ts aos cabeçalhos, à barra
 * de abas e ao fundo das telas. Copiamos o tema padrão (...DefaultTheme) e
 * trocamos só as cores.
 */
const temaNavegacao: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: cores.primaria,
    background: cores.fundo,
    card: cores.superficie,
    text: cores.texto,
    border: cores.borda,
  },
};

/** Ícones de cada aba: preenchido quando a aba está ativa, contorno quando não. */
const ICONES_ABAS: Record<keyof ParametrosAbas, { ativo: NomeIcone; inativo: NomeIcone }> = {
  ListaEventos: { ativo: "calendar", inativo: "calendar-outline" },
  Favoritos: { ativo: "heart", inativo: "heart-outline" },
  Sobre: { ativo: "information-circle", inativo: "information-circle-outline" },
};

/** As três abas inferiores. */
function NavegacaoAbas() {
  return (
    <Abas.Navigator
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: cores.primaria,
        tabBarInactiveTintColor: cores.textoSuave,
        headerTitleStyle: { fontWeight: pesos.negrito, color: cores.texto },
        tabBarIcon: ({ focused, color, size }) => {
          const icones = ICONES_ABAS[route.name];
          return <Ionicons name={focused ? icones.ativo : icones.inativo} size={size} color={color} />;
        },
      })}
    >
      <Abas.Screen
        name="ListaEventos"
        component={TelaListaEventos}
        options={{ title: "Agenda do Estudante", tabBarLabel: "Eventos" }}
      />
      <Abas.Screen name="Favoritos" component={TelaFavoritos} options={{ title: "Meus favoritos", tabBarLabel: "Favoritos" }} />
      <Abas.Screen name="Sobre" component={TelaSobre} options={{ title: "Sobre o app", tabBarLabel: "Sobre" }} />
    </Abas.Navigator>
  );
}

/** Navegação completa do app (é o que o App.tsx desenha). */
export default function NavegacaoPrincipal() {
  return (
    <NavigationContainer theme={temaNavegacao}>
      <Pilha.Navigator
        screenOptions={{
          headerTintColor: cores.primaria, // cor da seta de voltar
          headerTitleStyle: { fontWeight: pesos.negrito, color: cores.texto },
          headerBackTitle: "Voltar", // texto ao lado da seta (aparece só no iOS)
        }}
      >
        {/* headerShown: false porque as abas já têm o próprio cabeçalho */}
        <Pilha.Screen name="Abas" component={NavegacaoAbas} options={{ headerShown: false }} />
        <Pilha.Screen name="DetalhesEvento" component={TelaDetalhesEvento} options={{ title: "Detalhes do evento" }} />
        <Pilha.Screen name="FormularioInscricao" component={TelaFormularioInscricao} options={{ title: "Inscrição" }} />
      </Pilha.Navigator>
    </NavigationContainer>
  );
}
