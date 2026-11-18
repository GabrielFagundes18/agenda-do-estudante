/**
 * ARQUIVO: src/telas/TelaSobre.tsx
 *
 * PARA QUE SERVE?
 * Informações sobre o app: o que ele faz, de onde vêm os dados, versão e
 * informações técnicas da plataforma em que está rodando.
 *
 * A versão é lida do app.json pelo pacote expo-constants. Assim, quando a versão
 * mudar no app.json, esta tela muda sozinha, sem precisar editar o código.
 */
import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";
import { Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import LinhaInformacao from "../componentes/LinhaInformacao";
import { URL_API_ACADEMICA, URL_API_HACKATHONS } from "../constantes/configuracoes";
import { estilosGlobais } from "../estilos/estilosGlobais";
import { cores, espacamento, fontes } from "../estilos/tema";

const FUNCIONALIDADES = [
  "Eventos de duas APIs reunidos em uma só lista",
  "Busca por texto e filtros por categoria, data e modalidade",
  "Favoritos salvos no aparelho, mesmo sem internet",
  "Inscrição com validação dos dados",
  "Lembretes por notificação para eventos favoritos",
];

/**
 * Recebe: nada (é uma tela).
 * Devolve: a tela com descrição, fontes de dados, versão e dados técnicos.
 */
export default function TelaSobre() {
  const configuracao = Constants.expoConfig;
  const versao = configuracao?.version ?? "desconhecida";

  // Platform.select escolhe o texto certo para cada sistema:
  // no Android o número interno da versão se chama "versionCode",
  // no iOS se chama "buildNumber".
  const numeroInterno = Platform.select({
    android: `versionCode ${configuracao?.android?.versionCode ?? "-"}`,
    ios: `build ${configuracao?.ios?.buildNumber ?? "-"}`,
    default: "",
  });
  const nomeSistema = Platform.select({ android: "Android", ios: "iOS", default: "Web" });
  const fonteAcademica = URL_API_ACADEMICA === "" ? "Arquivo local de exemplo (dados/eventosAcademicos.json)" : URL_API_ACADEMICA;

  return (
    <ScrollView style={estilosGlobais.container} contentContainerStyle={estilosGlobais.conteudo}>
      <View style={estilos.topo}>
        <View style={[estilosGlobais.circuloIcone, { backgroundColor: cores.primariaClara }]}>
          <Ionicons name="school-outline" size={40} color={cores.primaria} />
        </View>
        <Text style={estilosGlobais.titulo}>Agenda do Estudante</Text>
        <Text style={estilosGlobais.textoSecundario}>
          Versão {versao} ({numeroInterno})
        </Text>
      </View>

      <View style={[estilosGlobais.cartao, estilos.secao]}>
        <Text style={estilosGlobais.rotuloSecao}>O que o app faz</Text>
        <Text style={estilosGlobais.texto}>
          Reúne em um só lugar palestras, oficinas, hackathons, semanas acadêmicas e eventos profissionais
          para estudantes.
        </Text>
        {FUNCIONALIDADES.map((funcionalidade) => (
          <LinhaInformacao key={funcionalidade} icone="checkmark-circle-outline" texto={funcionalidade} />
        ))}
      </View>

      <View style={[estilosGlobais.cartao, estilos.secao]}>
        <Text style={estilosGlobais.rotuloSecao}>Fontes de dados</Text>
        <LinhaInformacao icone="code-slash-outline" rotulo="Hackathons (Open Hackathons API)" texto={URL_API_HACKATHONS} />
        <LinhaInformacao icone="school-outline" rotulo="Eventos acadêmicos" texto={fonteAcademica} />
      </View>

      <View style={[estilosGlobais.cartao, estilos.secao]}>
        <Text style={estilosGlobais.rotuloSecao}>Informações técnicas</Text>
        <Text style={estilos.textoTecnico}>Sistema: {nomeSistema} {String(Platform.Version)}</Text>
        <Text style={estilos.textoTecnico}>Expo SDK: {configuracao?.sdkVersion ?? "-"}</Text>
        <Text style={estilos.textoTecnico}>Identificador: {configuracao?.slug ?? "-"}</Text>
      </View>

      <Text style={[estilosGlobais.textoSecundario, estilosGlobais.textoCentralizado, estilos.rodape]}>
        Projeto acadêmico desenvolvido com React Native, Expo e TypeScript.
      </Text>
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  topo: {
    alignItems: "center",
    marginBottom: espacamento.medio,
  },
  secao: {
    marginTop: espacamento.medio,
  },
  // Fonte "monoespaçada" (todas as letras com a mesma largura), comum para
  // informações técnicas. Cada sistema tem a sua: Menlo no iOS, monospace no Android.
  textoTecnico: {
    fontFamily: Platform.select({ ios: "Menlo", android: "monospace", default: "monospace" }),
    fontSize: fontes.pequena,
    color: cores.textoSecundario,
    marginTop: espacamento.minimo,
  },
  rodape: {
    marginTop: espacamento.grande,
  },
});
