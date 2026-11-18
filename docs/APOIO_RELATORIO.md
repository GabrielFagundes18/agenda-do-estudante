# Apoio ao relatório técnico — Agenda do Estudante

Cada seção traz um trecho **real** do código (com o arquivo de origem) e uma explicação que pode
ser adaptada para o relatório. Os trechos foram encurtados em alguns pontos (`// ...`), mas o
código completo está no arquivo indicado.

---

## 0. Identificação, contexto e objetivo

**Identificação** (preencher):
- Instituição / curso / disciplina: ____________________
- Professor(a): ____________________
- Integrantes (nome e matrícula): ____________________
- Data: ____________________

**Nome do aplicativo:** Agenda do Estudante (versão 1.0.0).

**Contexto e problema** (rascunho para adaptar): as oportunidades para estudantes ficam espalhadas.
Palestras e semanas acadêmicas aparecem em sites e redes sociais da faculdade, oficinas em grupos de
mensagens e hackathons em plataformas como o Devpost. Com isso, o estudante perde prazos de
inscrição ou descobre os eventos tarde demais.

**Objetivo:** um aplicativo móvel que **reúne em uma única lista** palestras, oficinas, hackathons,
semanas acadêmicas e eventos profissionais. Nele o estudante pode filtrar por categoria, data e
modalidade, salvar favoritos, manifestar interesse por um formulário e receber um **lembrete** antes
do evento.

**Funcionalidades implementadas:**
1. Lista de eventos futuros de duas fontes (API de hackathons + API acadêmica), com "puxar para atualizar".
2. Busca por texto (sem diferenciar acentos) e filtros por categoria, data (hoje/semana/mês) e modalidade.
3. Tela de detalhes com status calculado (aberto, encerrado, indisponível).
4. Formulário de inscrição com validação campo a campo, salvo no aparelho.
5. Favoritos salvos no aparelho, disponíveis sem internet.
6. Bloqueio de inscrição em eventos encerrados, esgotados ou cancelados, com mensagem explicativa.
7. Lembrete por notificação local para eventos favoritos, com pedido de permissão explicado.
8. Tela Sobre com versão do app e dados da plataforma.

---

## 1. Arquitetura

O app é dividido em **camadas**. Cada camada tem uma responsabilidade e só conversa com as vizinhas:

```
 TELAS (src/telas)            → só interface: desenham componentes e reagem a toques
   │ usam
 GANCHOS (src/ganchos)        → estado da tela (useState/useEffect) e coordenação
   │ chamam
 SERVIÇOS (src/servicos)      → "mundo externo": API (fetch), AsyncStorage, notificações
   │ usam
 UTILITÁRIOS (src/utilitarios)→ regras puras: converter JSON, filtrar, validar, formatar datas

 Transversais: tipos/ (interfaces), constantes/ (configurações), estilos/ (tema e StyleSheet global)
```

**Por que separar assim?**
- **Manutenção:** se a API mudar, mexemos só em `servicoApi.ts` e nos conversores. As telas não mudam.
- **Reutilização:** `useFavoritos` é usado por 3 telas; `CartaoEvento` por 2.
- **Testabilidade:** os utilitários são funções puras (entrada → saída), fáceis de testar sem abrir
  o app. As regras de filtro, status e validação foram testadas assim durante o desenvolvimento.

**Formato único de dados.** As duas APIs têm JSONs diferentes. Os conversores transformam ambos na
interface `Evento` (`src/tipos/evento.ts`). Dessa forma, telas e componentes só conhecem um formato.

---

## 2. Telas e navegação

São **5 telas**, organizadas com React Navigation combinando **pilha** e **abas**:

```
PILHA ─┬─ Abas ─┬─ ListaEventos   (aba "Eventos")
       │        ├─ Favoritos      (aba "Favoritos")
       │        └─ Sobre          (aba "Sobre")
       ├─ DetalhesEvento          (abre por cima das abas)
       └─ FormularioInscricao     (abre por cima dos detalhes)
```

`src/navegacao/NavegacaoPrincipal.tsx`:
```tsx
const Pilha = createNativeStackNavigator<ParametrosPilha>();
const Abas = createBottomTabNavigator<ParametrosAbas>();

export default function NavegacaoPrincipal() {
  return (
    <NavigationContainer theme={temaNavegacao}>
      <Pilha.Navigator screenOptions={{ /* ... */ }}>
        <Pilha.Screen name="Abas" component={NavegacaoAbas} options={{ headerShown: false }} />
        <Pilha.Screen name="DetalhesEvento" component={TelaDetalhesEvento} options={{ title: "Detalhes do evento" }} />
        <Pilha.Screen name="FormularioInscricao" component={TelaFormularioInscricao} options={{ title: "Inscrição" }} />
      </Pilha.Navigator>
    </NavigationContainer>
  );
}
```

**Tipagem das rotas** (`src/navegacao/tiposNavegacao.ts`): o TypeScript passa a saber quais telas
existem e quais parâmetros cada uma recebe.
```ts
export type ParametrosPilha = {
  Abas: NavigatorScreenParams<ParametrosAbas> | undefined;
  DetalhesEvento: { evento: Evento };
  FormularioInscricao: { evento: Evento };
};
```
Uso: `navigation.navigate("DetalhesEvento", { evento })`. Se o parâmetro for esquecido, o editor acusa erro.

**Por que Detalhes está na pilha e não dentro de uma aba?** Para poder ser aberto tanto da aba
Eventos quanto da aba Favoritos, e aparecer por cima da barra de abas.

### Descrição das telas

| Tela | O que mostra | O que o usuário pode fazer | Como se chega |
|---|---|---|---|
| **Eventos** (`TelaListaEventos`) | lista de eventos futuros em cartões (imagem, categoria, status, data, local) | buscar, filtrar, puxar para atualizar, favoritar pelo coração, abrir detalhes | aba "Eventos" (tela inicial) |
| **Detalhes** (`TelaDetalhesEvento`) | todas as informações, descrição, temas, status e inscrição já feita | inscrever-se, favoritar, ativar/cancelar lembrete, abrir a página do evento | tocar em um cartão (Eventos ou Favoritos) |
| **Inscrição** (`TelaFormularioInscricao`) | resumo do evento e os 5 campos | preencher e enviar; ver os erros embaixo de cada campo | botão "Quero me inscrever" nos Detalhes |
| **Favoritos** (`TelaFavoritos`) | eventos salvos no aparelho | abrir detalhes, desfavoritar, ir para Eventos se estiver vazio | aba "Favoritos" |
| **Sobre** (`TelaSobre`) | descrição, fontes de dados, versão (version + versionCode/build), sistema | apenas leitura | aba "Sobre" |

**Fluxo principal:** Eventos → (filtrar) → Detalhes → Favoritar → Lembrar-me → Quero me inscrever
→ Inscrição → Enviar → volta para Detalhes, que mostra "Você já se inscreveu...".

---

## 3. Props (componentes reutilizáveis tipados)

Props são os "parâmetros" de um componente. A interface define quais props existem e o tipo de cada uma.

`src/componentes/BotaoPrincipal.tsx`:
```tsx
interface PropsBotaoPrincipal {
  titulo: string;
  aoPressionar: () => void;          // função chamada no toque
  variante?: VarianteBotao;          // "?" = opcional
  icone?: NomeIcone;
  desabilitado?: boolean;
  carregando?: boolean;
}

export default function BotaoPrincipal({
  titulo, aoPressionar, variante = "primario", icone, desabilitado = false, carregando = false,
}: PropsBotaoPrincipal) { /* ... */ }
```

Uso em `TelaDetalhesEvento.tsx`:
```tsx
<BotaoPrincipal
  titulo={inscricaoLiberada ? "Quero me inscrever" : "Inscrições bloqueadas"}
  icone={inscricaoLiberada ? "create-outline" : "lock-closed-outline"}
  desabilitado={!inscricaoLiberada}
  aoPressionar={abrirFormulario}
/>
```

Pontos para o relatório:
- O mesmo `BotaoPrincipal` é usado em todas as telas, com três variantes e estados desabilitado/carregando.
- Props com **valor padrão** (`variante = "primario"`) deixam o uso mais simples.
- Props de **função** (`aoPressionar`) fazem o componente "avisar" o pai: o componente não sabe
  o que acontece no toque, quem decide é a tela.
- O tipo `NomeIcone` só aceita nomes de ícones que existem; um nome errado vira erro no editor.

---

## 4. useState

`useState` guarda um dado que, ao mudar, faz o React **redesenhar** a tela.

`src/ganchos/useFormularioInscricao.ts`:
```ts
const [dados, setDados] = useState<DadosFormularioInscricao>(DADOS_VAZIOS);
const [erros, setErros] = useState<ErrosFormularioInscricao>({});
const [enviando, setEnviando] = useState(false);

function alterarCampo(campo: CampoFormulario, valor: string) {
  setDados({ ...dados, [campo]: valor });   // cria um objeto NOVO, trocando só um campo
  // ...
}
```

Pontos para o relatório:
- `const [valor, setValor] = useState(inicial)`: `valor` é o dado atual e `setValor` troca o
  valor e redesenha a tela.
- O estado **não é alterado diretamente** (`dados.nome = "x"` não funcionaria). Sempre criamos uma
  cópia (`{ ...dados }`) e passamos para o `set`.
- Exemplo de estado **local de componente**: `PainelFiltros` guarda `expandido` (abrir/fechar
  "Mais filtros"), pois só ele precisa saber disso.
- Exemplo de **um estado por filtro** em `useFiltrosEventos.ts` (texto, categoria, período,
  modalidade e encerrados), o que deixa claro o que muda e quando.

---

## 5. useEffect e o array de dependências

`useEffect` executa um código **depois** que o componente aparece. O array de dependências define
**quando** ele roda de novo. A regra é que **tudo o que o efeito usa e que pode mudar** (estados,
props, funções do componente) precisa estar no array. Quem confere isso é o ESLint, com a regra
`react-hooks/exhaustive-deps`, que roda com `npm run lint` e hoje termina sem nenhum aviso.

O app usa três situações:

**a) `[tentativa]`: ao abrir a tela e quando o usuário pede "Tentar novamente"** (`src/ganchos/useEventos.ts`):
```ts
const [tentativa, setTentativa] = useState(0);

useEffect(() => {
  async function carregar() {
    try {
      const resultado = await buscarTodosEventos();
      setEventos(resultado.eventos);
      setAviso(montarAvisoDeFalhas(resultado.fontesComFalha));
      setErro(null);
    } catch (erroDaBusca) {
      setErro(obterMensagemDeErro(erroDaBusca));
    } finally {
      setCarregando(false);
    }
  }
  carregar();
}, [tentativa]);

function tentarNovamente() {
  setCarregando(true);
  setErro(null);
  setTentativa(tentativa + 1);   // a dependência muda → o efeito roda de novo
}
```
- A função `carregar` fica **dentro** do efeito. Assim o efeito só usa coisas que não mudam
  (as funções `set...` do useState e funções importadas), e o array fica completo.
- Por que não `useEffect(async () => ...)`? O useEffect não pode receber uma função `async`, porque
  ela devolveria uma Promise e o React espera "nada" ou uma função de limpeza. Por isso criamos a
  função async dentro dele e a chamamos em seguida.
- O **contador de tentativas** é o jeito simples de "pedir" ao efeito que rode de novo, sem
  precisar de `useCallback`.

**b) `[telaEstaVisivel, tentativa]`: sempre que a tela volta a aparecer** (`src/ganchos/useFavoritos.ts`):
```ts
const telaEstaVisivel = useIsFocused();

useEffect(() => {
  if (!telaEstaVisivel) {
    return;
  }
  async function carregar() { /* lê os favoritos do AsyncStorage */ }
  carregar();
}, [telaEstaVisivel, tentativa]);
```
Se o usuário favoritar na tela de Detalhes e voltar, a Lista e a aba Favoritos releem o AsyncStorage
e mostram o coração atualizado.

**c) `[evento.id, ehFavorito]`: quando um dado específico muda** (`src/ganchos/useLembrete.ts`):
```ts
useEffect(() => {
  async function verificarLembrete() {
    try {
      const agendado = await eventoTemLembreteAgendado(evento.id);
      setLembreteAtivo(agendado);
    } catch {
      setLembreteAtivo(false);
    }
  }
  verificarLembrete();
}, [evento.id, ehFavorito]);
```
Ao remover dos favoritos, o lembrete é cancelado. Como `ehFavorito` muda, o efeito roda de novo e
o botão volta para "Lembrar-me".

> Sem o array, o efeito rodaria após **toda** renderização. Como a busca altera o estado, isso
> causaria um laço infinito de buscas.

> **Problema encontrado e corrigido:** na primeira versão, as funções de busca ficavam **fora** do
> efeito e não estavam no array. O app funcionava, mas o ESLint apontou 2 avisos de "dependência
> faltando" e 1 erro de "função usada antes de ser declarada". A solução foi colocar a função dentro
> do efeito e usar o contador de tentativas.

---

## 6. Formulário e validações

As **regras** ficam em `src/utilitarios/validacoes.ts`. Cada função valida um campo e devolve
`null` (sem erro) ou a mensagem de erro:

```ts
export function validarMatricula(matricula: string): string | null {
  const texto = matricula.trim();
  const { matriculaMinima, matriculaMaxima } = LIMITES_FORMULARIO;

  if (texto === "") return "Informe sua matrícula.";
  if (!REGEX_SO_NUMEROS.test(texto)) return "A matrícula deve ter apenas números.";
  if (texto.length < matriculaMinima) return `A matrícula precisa ter pelo menos ${matriculaMinima} dígitos.`;
  if (texto.length > matriculaMaxima) return `A matrícula pode ter no máximo ${matriculaMaxima} dígitos.`;
  return null;
}
```
(No código original cada `if` tem chaves e fica em várias linhas; aqui foi resumido.)

| Campo | Regras |
|---|---|
| Nome | obrigatório, mín. 3 letras, só letras, nome **e** sobrenome |
| E-mail | obrigatório, formato `algo@algo.dominio` |
| Matrícula | obrigatória, **só números**, entre 5 e 15 dígitos |
| Curso | obrigatório, mín. 3 letras |
| Observação | opcional, máx. 300 caracteres (com contador) |

O **erro aparece embaixo do campo** (`src/componentes/CampoFormulario.tsx`):
```tsx
<TextInput
  style={[estilosGlobais.campoTexto, erro ? estilosGlobais.campoTextoComErro : null]}
  value={valor}
  onChangeText={aoAlterarTexto}
  keyboardType={tipoTeclado}
  /* ... */
/>
{erro ? <Text style={estilosGlobais.mensagemErro}>{erro}</Text> : null}
```

Fluxo do envio (`useFormularioInscricao.ts` → `enviarInscricao`):
1. Valida **todos** os campos e mostra os erros.
2. Se houver erro, para aqui.
3. Se estiver tudo certo, limpa os dados (`trim`, e-mail em minúsculas) e salva no AsyncStorage.
4. A tela mostra o `Alert` "Inscrição registrada!" e volta para os detalhes.

Detalhe de usabilidade: depois do primeiro erro, o campo é **revalidado a cada letra**, e a mensagem
some assim que o usuário corrige. Também usamos o teclado certo para cada campo
(`email-address`, `number-pad`).

---

## 7. FlatList

`src/telas/TelaListaEventos.tsx`:
```tsx
<FlatList
  data={eventosFiltrados}
  keyExtractor={(evento) => evento.id}
  renderItem={renderizarEvento}
  ItemSeparatorComponent={SeparadorLista}
  ListEmptyComponent={<EstadoVazio titulo="Nenhum evento encontrado" /* ... */ />}
  refreshControl={
    <RefreshControl
      refreshing={atualizando}
      onRefresh={atualizarEventos}
      colors={[cores.primaria]}     // Android
      tintColor={cores.primaria}    // iOS
    />
  }
/>
```

- **Por que FlatList e não ScrollView + map?** A FlatList só desenha os itens visíveis (e alguns
  próximos). Com muitos eventos, ela usa menos memória e rola de forma mais fluida.
- **keyExtractor:** devolve um id único. Usamos ids com prefixo (`hackathon-30078`,
  `academico-3`) para que eventos de APIs diferentes nunca tenham o mesmo id.
- **ItemSeparatorComponent:** desenha o espaço **entre** os itens (não antes do primeiro).
- **RefreshControl:** o "puxar para atualizar". Se a atualização falhar, a lista anterior é mantida
  e aparece só um aviso.
- **ListEmptyComponent:** mostra o estado VAZIO sem esconder a busca e os filtros.

---

## 8. API REST e processamento de JSON

### Fonte 1 — Open Hackathons API (JSON real recebido)
```json
{
  "id": 29624,
  "url": "https://uipath-agenthack.devpost.com/",
  "title": "UiPath AgentHack",
  "thumbnail_url": "//d112y698adiu2z.cloudfront.net/photos/.../medium_square.jpg",
  "organization_name": "UiPath",
  "isOpen": "open",
  "submission_period_dates": "May 15 - Jun 30, 2026",
  "displayed_location": "Online",
  "registrations_count": 403,
  "prizeText": "$<span data-currency-value>50,000</span>",
  "themes": [{ "id": 21, "name": "Enterprise" }, { "id": 6, "name": "Machine Learning/AI" }],
  "source": "devpost"
}
```

### O mesmo item depois de `converterHackathonParaEvento`
```json
{
  "id": "hackathon-29624",
  "titulo": "UiPath AgentHack",
  "categoria": "Hackathon",
  "dataInicio": "2026-05-15T03:00:00.000Z",
  "dataFim": "2026-07-01T02:59:00.000Z",
  "possuiHorario": false,
  "local": "Online",
  "modalidade": "Online",
  "imagem": "https://d112y698adiu2z.cloudfront.net/photos/.../medium_square.jpg",
  "organizador": "UiPath",
  "temas": ["Enterprise", "Machine Learning/AI"],
  "vagas": null,
  "situacao": "disponivel",
  "informacoesExtras": [
    { "rotulo": "Prêmio", "valor": "$50,000" },
    { "rotulo": "Participantes inscritos", "valor": "403" },
    { "rotulo": "Plataforma", "valor": "Devpost" }
  ],
  "origem": "hackathons"
}
```
O que o conversor resolveu:
- a data em texto (`"May 15 - Jun 30, 2026"`) virou datas ISO (00:00 do início até 23:59 do fim,
  no horário de Brasília);
- a imagem sem protocolo (`//...`) recebeu `https:`;
- o HTML do prêmio foi removido;
- `"Online"` no local virou a modalidade `Online`.

### Fonte 2 — API acadêmica (`dados/eventosAcademicos.json`, um item)
```json
{
  "id": "7",
  "titulo": "Prototipação de Interfaces com Figma",
  "tipo": "Oficina",
  "data": "2026-12-05T14:00:00-03:00",
  "dataFim": "2026-12-05T17:00:00-03:00",
  "local": "Online (Microsoft Teams)",
  "modalidade": "Online",
  "link": "https://www.exemplo.edu.br/eventos/oficina-figma",
  "imagem": "https://picsum.photos/seed/agenda-figma/640/320",
  "organizador": "Laboratório de UX",
  "temas": ["UX", "UI", "Figma"],
  "vagas": 0,
  "situacao": "esgotado"
}
```

### Requisição com tempo limite e tratamento de erros (`src/servicos/servicoApi.ts`)
```ts
async function fazerRequisicao(url: string): Promise<Response> {
  const controlador = new AbortController();
  const temporizador = setTimeout(() => controlador.abort(), TEMPO_LIMITE_REQUISICAO_MS);
  try {
    return await fetch(url, { signal: controlador.signal, headers: { Accept: "application/json" } });
  } catch {
    if (controlador.signal.aborted) {
      throw new Error("O servidor demorou demais para responder. Tente novamente em instantes.");
    }
    throw new Error("Sem conexão com a internet. Verifique sua rede e tente novamente.");
  } finally {
    clearTimeout(temporizador);
  }
}
```
São tratados **4 tipos de erro**, cada um com uma mensagem própria:

| Situação | Onde é tratado | Mensagem |
|---|---|---|
| Sem internet | `fazerRequisicao` (catch) | "Sem conexão com a internet..." |
| Tempo esgotado (10 s) | `fazerRequisicao` (`signal.aborted`) | "O servidor demorou demais..." |
| Erro HTTP (404, 500...) | `buscarJson` (`!resposta.ok`) | "O servidor respondeu com erro 500..." |
| JSON inválido | `buscarJson` (catch do `.json()`) | "...formato válido (JSON inválido)." |
| JSON com formato errado | `buscarHackathons` / `buscarEventosAcademicos` | "...formato inesperado." |

### Promise.allSettled: uma API falhar não derruba a outra
```ts
const [resultadoHackathons, resultadoAcademicos] = await Promise.allSettled([
  buscarHackathons(),
  buscarEventosAcademicos(),
]);

if (resultadoHackathons.status === "rejected" && resultadoAcademicos.status === "rejected") {
  throw new Error(obterMensagemDeErro(resultadoHackathons.reason));   // as duas falharam → tela de ERRO
}
// se só uma falhou: mostramos os eventos da outra + um aviso amarelo
```
Com `Promise.all`, uma única falha descartaria tudo. Com `allSettled`, cada resultado vem com
`status` `"fulfilled"` ou `"rejected"` e o app aproveita o que deu certo.

---

## 9. Estados de tela

Cada estado tem um componente próprio em `src/componentes/estados/`. Na tela de Favoritos eles
aparecem em sequência, um `if` para cada (`src/telas/TelaFavoritos.tsx`):

```tsx
// ESTADO 1: CARREGANDO
if (carregando) {
  return <EstadoCarregando mensagem="Carregando seus favoritos..." />;
}
// ESTADO 2: ERRO
if (erro) {
  return <EstadoErro mensagem={erro} aoTentarNovamente={tentarNovamente} />;
}
// ESTADO 3: VAZIO
if (favoritos.length === 0) {
  return <EstadoVazio icone="heart-outline" titulo="Nenhum favorito ainda" /* ... */ />;
}
// ESTADO 4: SUCESSO
return <FlatList data={favoritosOrdenados} /* ... */ />;
```

| Estado | Quando acontece | O que o usuário vê |
|---|---|---|
| CARREGANDO | primeira busca em andamento | rodinha + "Buscando eventos..." |
| ERRO | as duas APIs falharam | ícone, mensagem específica e **"Tentar novamente"** |
| VAZIO | nenhum evento com os filtros / nenhum evento nas APIs / nenhum favorito | orientação + "Limpar filtros" / "Recarregar" / "Explorar eventos" |
| SUCESSO | há dados | a lista de cartões |

Há ainda um **quinto caso**, o de sucesso **parcial**: uma API falhou e a outra funcionou. A lista
aparece com uma `MensagemInformativa` amarela avisando o que não carregou, com o botão
**"Tentar novamente"**.

O ERRO e o VAZIO usam o mesmo "esqueleto" visual (`EstruturaEstado.tsx`). Cada um só escolhe
ícone, cores e textos, e assim o layout não fica repetido nos dois arquivos.

---

## 10. Persistência local (AsyncStorage)

`src/servicos/servicoArmazenamento.ts`:
```ts
export async function buscarFavoritos(): Promise<Evento[]> {
  const textoSalvo = await AsyncStorage.getItem(CHAVES_ARMAZENAMENTO.favoritos);
  return textoSalvo ? JSON.parse(textoSalvo) : [];
}

export async function salvarFavorito(evento: Evento): Promise<Evento[]> {
  const favoritos = await buscarFavoritos();
  const jaExiste = favoritos.some((favorito) => favorito.id === evento.id);
  if (jaExiste) {
    return favoritos;
  }
  const novaLista = [...favoritos, evento];
  await gravarFavoritos(novaLista);   // AsyncStorage.setItem(chave, JSON.stringify(lista))
  return novaLista;
}
```

| Chave | Conteúdo |
|---|---|
| `@agendaEstudante:favoritos` | lista de eventos favoritos (objetos completos) |
| `@agendaEstudante:inscricoes` | lista de inscrições (uma por evento) |
| `@agendaEstudante:lembretes` | `{ idDoEvento: idDaNotificacao }` |

Pontos para o relatório:
- O AsyncStorage só guarda **texto**: `JSON.stringify` ao salvar e `JSON.parse` ao ler.
- Os favoritos guardam o **evento inteiro**, e não só o id. Assim a aba Favoritos funciona **sem internet**.
- Os dados continuam salvos depois de fechar o app (teste: favoritar → fechar → abrir).
- O **status** do evento não é salvo: ele é recalculado sempre que o evento aparece (um favorito de
  semana passada pode estar encerrado hoje).

---

## 11. Notificações e permissões

Fluxo do botão **"Lembrar-me"** (`src/ganchos/useLembrete.ts` + `src/servicos/servicoNotificacoes.ts`):

```
Toque em "Lembrar-me"
  └─ Ainda dá tempo de lembrar? ── não ──► Alert "Não dá mais tempo"
        │ sim
  └─ Permissão atual?
        ├─ concedida ─────────────────────────────────► agenda a notificação
        ├─ negada (sistema não deixa perguntar) ──────► Alert amigável + "Abrir configurações"
        └─ pode perguntar ─► Alert EXPLICANDO o motivo
                               ├─ "Agora não" → nada acontece
                               └─ "Continuar" → janela do sistema
                                      ├─ permitiu → agenda a notificação
                                      └─ negou   → Alert amigável + "Abrir configurações"
```

Trecho da explicação **antes** do pedido:
```ts
Alert.alert(
  "Permitir notificações?",
  "Para lembrar você deste evento, o app precisa enviar uma notificação no seu celular. " +
    "Usamos as notificações apenas para os lembretes que você ativar.",
  [
    { text: "Agora não", style: "cancel" },
    { text: "Continuar", onPress: () => pedirPermissaoEAgendar(dataLembrete) },
  ],
);
```

Agendamento com gatilho de data e canal Android:
```ts
const idNotificacao = await Notifications.scheduleNotificationAsync({
  content: { title: `Lembrete: ${evento.titulo}`, body: montarTextoLembrete(evento, dataLembrete), data: { eventoId: evento.id } },
  trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: dataLembrete, channelId: CANAL_LEMBRETES.id },
});
await salvarIdLembrete(evento.id, idNotificacao);   // guardamos o id para poder CANCELAR depois
```

Pontos para o relatório:
- A permissão é pedida **só quando o usuário toca em "Lembrar-me"**, e não ao abrir o app. Com
  contexto, a chance de o usuário aceitar é maior.
- **Canal Android** (`setNotificationChannelAsync`): obrigatório desde o Android 8. No Android 13+,
  a janela de permissão só aparece se já existir um canal, por isso o canal é criado **antes** de pedir.
- **Quando toca:** 60 min antes do início. Se o evento já começou (hackathon de várias semanas),
  60 min antes do fim.
- **Cancelar:** botão "Cancelar lembrete". Remover dos favoritos também cancela, porque o lembrete é
  um recurso dos favoritos.
- Se a notificação já tocou, ela sai da lista do sistema. `eventoTemLembreteAgendado` confere isso
  e limpa o registro antigo.
- `setNotificationHandler` (em `App.tsx`) faz a notificação aparecer **mesmo com o app aberto**.

---

## 12. Tratamento multiplataforma (Android × iOS)

O código é **compartilhado**. As diferenças ficam isoladas nestes pontos:

| Onde | Técnica | Android | iOS |
|---|---|---|---|
| `estilos/tema.ts` (sombra) | `Platform.select` | `elevation: 3` | `shadowColor/Offset/Opacity/Radius` |
| `estilos/estilosGlobais.ts` (campo de texto) | `Platform.select` | `paddingVertical: 8` (TextInput já tem espaço interno) | `paddingVertical: 12` |
| `servicos/servicoNotificacoes.ts` | `Platform.OS` | cria o **canal de notificação** | não existe canal |
| `servicos/servicoNotificacoes.ts` | `ios?.status` | — | aceita a permissão **provisória** |
| `componentes/PainelFiltros.tsx` (Switch) | `Platform.OS` | `thumbColor` branco | bolinha já é branca |
| `telas/TelaListaEventos.tsx` (RefreshControl) | props por plataforma | `colors` | `tintColor` |
| `componentes/CartaoEvento.tsx` | duas Views | — | `overflow: hidden` cortaria a sombra |
| `componentes/CampoFormulario.tsx` | `textAlignVertical: "top"` | texto multilinha começaria no meio | já começa no topo |
| `componentes/BarraPesquisa.tsx` | botão "x" próprio | não tem `clearButtonMode` | tem, mas usamos o nosso nas duas |
| `telas/TelaSobre.tsx` | `Platform.select` | "versionCode", fonte `monospace` | "build", fonte `Menlo` |
| `telas/TelaFormularioInscricao.tsx` | `KeyboardAvoidingView` | `behavior="padding"` | `behavior="padding"` |
| `TelaDetalhes`, `TelaFormulario`, `App.tsx` | `SafeAreaProvider` + `useSafeAreaInsets` | barra de navegação/gestos | entalhe e home indicator |

**Observação sobre o KeyboardAvoidingView:** muitos tutoriais usam
`behavior={Platform.OS === "ios" ? "padding" : "height"}`, porque o Android redimensionava a janela
sozinho quando o teclado abria. A partir do Expo SDK 54, os apps Android são **edge-to-edge** (o app
desenha atrás das barras do sistema) e a janela **não redimensiona mais**. Por isso a documentação
atual do Expo recomenda `"padding"` nas **duas** plataformas, com `keyboardVerticalOffset` igual à
altura do cabeçalho. Esse é um bom exemplo de que práticas "multiplataforma" mudam com o tempo e
precisam ser conferidas na documentação da versão usada.

---

## 13. Decisões de projeto e limitações (bom para a conclusão)

- **Status calculado pelo app:** a Open Hackathons API marca como `"open"` hackathons com data já
  passada (em nov/2026, 45 de 46). O app confia na **data**, não no campo da API, e os mostra como
  Encerrados.
- **Lista de "eventos futuros":** encerrados ficam escondidos por padrão e podem ser exibidos em
  "Mais filtros", sempre no fim da lista e com aparência desativada.
- **Funciona sem configurar nada:** sem URL do MockAPI, o app usa o JSON local (com um pequeno
  atraso simulado, para o estado de carregando aparecer).
- **Sem bibliotecas de estado global** (Redux, Zustand): só `useState`, `useEffect` e ganchos
  próprios. As telas se sincronizam relendo o AsyncStorage quando ganham foco (`useIsFocused`).
- **Lembretes no Android:** alguns fabricantes atrasam alarmes para economizar bateria, então o
  lembrete pode chegar alguns minutos depois do horário.
- **Melhorias futuras:** abrir os detalhes do evento ao tocar na notificação, tela "Minhas
  inscrições", modo escuro (o `tema.ts` já centraliza as cores, o que facilita) e testes automatizados.

---

## 14. O arquivo eas.json, linha por linha

```json
{
  "cli": {
    "version": ">= 16.0.0",
    "appVersionSource": "local"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "autoIncrement": true,
      "android": {
        "buildType": "app-bundle"
      }
    }
  },
  "submit": {
    "production": {}
  }
}
```

| Linha | Significado |
|---|---|
| `"cli"` | configurações da ferramenta de linha de comando do EAS. |
| `"version": ">= 16.0.0"` | exige o EAS CLI na versão 16 ou mais nova, para todos do grupo usarem uma versão compatível. |
| `"appVersionSource": "local"` | os números de versão (`version`, `versionCode`, `buildNumber`) são lidos do **app.json** do projeto, e não guardados nos servidores da Expo. |
| `"build"` | lista os **perfis de build**. Cada perfil é uma "receita" escolhida com `--profile`. |
| `"development"` | perfil do **Development Build**: um app de desenvolvimento com as bibliotecas nativas do projeto. |
| `"developmentClient": true` | inclui o `expo-dev-client`, que permite carregar o código do computador (`npx expo start`) e mostra o menu de desenvolvimento. |
| `"distribution": "internal"` | distribuição **interna**: o EAS gera um link/QR Code para instalar direto no celular, sem passar pela loja. |
| `"preview"` | perfil para **testes** com professor e colegas (versão parecida com a final, sem ferramentas de desenvolvimento). |
| `"android": { "buildType": "apk" }` | gera um arquivo **.apk**, que pode ser instalado direto no Android. |
| `"production"` | perfil da versão **final**, para a loja. |
| `"autoIncrement": true` | a cada build de produção, o EAS **soma 1 no `versionCode`** (Android) e no `buildNumber` (iOS) do app.json. Assim a Play Store nunca recebe um número repetido. |
| `"android": { "buildType": "app-bundle" }` | gera um **.aab** (Android App Bundle), o formato exigido pela Google Play. |
| `"submit": { "production": {} }` | perfil usado pelo `eas submit` para enviar o build de produção à loja (vazio = usa as configurações padrão e pergunta o que faltar). |

Comandos de cada perfil:
```bash
eas build --profile development --platform android   # Development Build
eas build -p android --profile preview                # APK
eas build -p android --profile production             # AAB
```

---

## 15. Problemas encontrados durante o desenvolvimento e soluções adotadas

| # | Problema | Como foi percebido | Solução |
|---|---|---|---|
| 1 | A API de hackathons marca como `"open"` eventos cuja data já passou (em nov/2026, 45 de 46) | conferindo as datas do JSON real | o status é **calculado pela data** em `statusEvento.ts`, e não pelo campo `isOpen` |
| 2 | A data dos hackathons vem em texto e em inglês, às vezes sem o mês ou o ano no fim (`"May 15 - 21, 2026"`) | ao converter o JSON | parser próprio (`lerParteDaData`, `converterPeriodoHackathon`), que também trata a virada de ano e confere se a data existe (`criarDataSegura`) |
| 3 | Imagens com endereço sem `https:` (`//d112y...jpg`) e um GIF genérico de "sem imagem" | imagens não apareciam | `corrigirUrlImagem` + `ImagemEvento`, que mostra o ícone da categoria quando a imagem falta ou falha |
| 4 | O prêmio vinha com HTML (`$<span ...>500</span>`) | o texto aparecia com as tags | `removerTagsHtml` |
| 5 | Texto em inglês na descrição do hackathon (`"May 15 - Jun 30"`) | revisão do padrão "tudo em português" | a descrição é montada com as datas já convertidas (`formatarDataCurta`) |
| 6 | Teclado cobrindo o formulário no Android | documentação do Expo: desde o SDK 54, o Android é edge-to-edge e a janela não redimensiona | `KeyboardAvoidingView` com `behavior="padding"` nas duas plataformas + `keyboardVerticalOffset` |
| 7 | No iOS, `overflow: "hidden"` (para arredondar a imagem do cartão) corta a sombra | comportamento conhecido do iOS | duas Views: a de fora com sombra e a de dentro com o corte |
| 8 | Dependência obrigatória faltando (`expo-font`, exigida pelos ícones) | `npx expo-doctor` | `npx expo install expo-font` |
| 9 | Dependências faltando no `useEffect` e função usada antes de ser declarada | `npm run lint` (ESLint) | função de busca dentro do efeito + contador de tentativas |
| 10 | ESLint dizia que `AndroidImportance` não existia em `Notifications` (falso positivo: o app funcionava) | `npm run lint` | import nomeado dos dois enums, com um comentário explicando |
| 11 | O comando `npx expo lint` recusava o ESLint 9 por engano | ao rodar o lint | os scripts `lint` e `verificar` chamam o `eslint` diretamente |
| 12 | A inscrição era salva, mas nenhuma tela mostrava isso depois de reabrir o app | simulação do fluxo do usuário | gancho `useInscricaoDoEvento`, e os Detalhes mostram "Você já se inscreveu..." |
| 13 | Sem internet, o aviso de falha parcial não tinha botão para tentar de novo | simulação de falhas | `MensagemInformativa` com botão de ação "Tentar novamente" |
| 14 | TypeScript recusou `null` em `ListHeaderComponent` da FlatList | `npx tsc --noEmit` | usar `undefined` no lugar de `null` |

---

## 16. Conclusão (rascunho para adaptar)

O projeto atingiu o objetivo de centralizar eventos acadêmicos e profissionais em um aplicativo
móvel único para Android e iOS, escrito em TypeScript com React Native e Expo. A separação em
camadas (telas, ganchos, serviços e utilitários) deixou cada parte pequena e fácil de explicar. Por
exemplo, a troca da API acadêmica do arquivo local para o MockAPI exige mudar só uma constante.

Os maiores aprendizados vieram de **dados reais imperfeitos**: a API pública tinha status
desatualizado, datas em texto e imagens com endereço incompleto. Isso mostrou por que é preciso
converter e validar o JSON em vez de confiar nele. O uso do `Promise.allSettled`, do tempo limite nas
requisições e dos quatro estados de tela deixou o app utilizável mesmo sem internet. O fluxo de
permissão com explicação prévia mostrou como pedir acesso a um recurso do aparelho de forma respeitosa.

Ferramentas de verificação (`tsc`, ESLint e `expo-doctor`) encontraram problemas que não apareciam
ao usar o app, como dependências faltando no `useEffect`. Com o EAS Build, o mesmo código gerou o
Development Build, o APK de teste e o AAB de produção, com assinatura e versionamento gerenciados.

**Trabalhos futuros:** abrir os detalhes do evento ao tocar na notificação, tela "Minhas
inscrições", modo escuro (o `tema.ts` já centraliza as cores) e testes automatizados com Jest.
