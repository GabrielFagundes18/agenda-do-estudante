/**
 * ARQUIVO: App.tsx
 *
 * PARA QUE SERVE?
 * É o ponto de entrada do app: o primeiro componente desenhado. Ele só prepara
 * o ambiente e carrega a navegação; todo o resto fica dentro de src/.
 *
 * - SafeAreaProvider: mede as "áreas seguras" do aparelho (entalhe, barra de
 *   status, barra de gestos) e repassa essas medidas para as telas, que usam o
 *   gancho useSafeAreaInsets para não desenhar conteúdo embaixo delas.
 * - StatusBar: define a cor dos ícones da barra de status ("dark" = ícones escuros,
 *   porque o fundo do nosso cabeçalho é claro).
 */
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import NavegacaoPrincipal from "./src/navegacao/NavegacaoPrincipal";
import { configurarExibicaoNotificacoes } from "./src/servicos/servicoNotificacoes";

// Configuração feita UMA vez, quando o app inicia (fora do componente, para não
// repetir a cada vez que o App for desenhado de novo).
configurarExibicaoNotificacoes();

/**
 * Recebe: nada.
 * Devolve: o app inteiro: o provedor de área segura, a navegação e a barra de status.
 */
export default function App() {
  return (
    <SafeAreaProvider>
      <NavegacaoPrincipal />
      <StatusBar style="dark" />
    </SafeAreaProvider>
  );
}
