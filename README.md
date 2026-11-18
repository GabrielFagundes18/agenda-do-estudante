# Agenda do Estudante

Aplicativo em React Native + Expo + TypeScript que reúne eventos para estudantes:
palestras, oficinas, hackathons, semanas acadêmicas e eventos profissionais.

- **Expo SDK 58** · React Native 0.88 · React 19 · TypeScript 6
- Navegação com **React Navigation 7** (abas inferiores + pilha)
- Duas fontes de dados: **Open Hackathons API** (pública) e **API acadêmica** (MockAPI ou arquivo local)
- Favoritos e inscrições salvos com **AsyncStorage**
- Lembretes com **expo-notifications** (notificação local)

---

## 1. Árvore de pastas

```
agenda-do-estudante/
├── App.tsx                          → ponto de entrada; só prepara o ambiente e carrega a navegação
├── index.ts                         → registra o App como componente raiz (não precisa mexer)
├── app.json                         → configuração Expo (nome, versão, versionCode, pacote, permissões, plugins)
├── eas.json                         → perfis de build: development, preview (APK) e production (AAB)
├── package.json                     → dependências e scripts (npm start, npm run lint, npm run verificar)
├── tsconfig.json                    → configuração do TypeScript (modo strict)
├── eslint.config.js                 → regras do ESLint (padrão do Expo, inclui as regras dos hooks do React)
├── dados/
│   └── eventosAcademicos.json       → JSON de exemplo da API acadêmica (para importar no MockAPI)
├── docs/
│   ├── APOIO_RELATORIO.md           → trechos de código explicados para o relatório técnico
│   └── CHECKLIST_TESTES.md          → tabela de testes para preencher no celular
├── assets/                          → ícones e splash do app
└── src/
    ├── telas/
    │   ├── TelaListaEventos.tsx      → lista com FlatList, busca, filtros e "puxar para atualizar"
    │   ├── TelaDetalhesEvento.tsx    → detalhes, favoritar, lembrete e botão de inscrição
    │   ├── TelaFormularioInscricao.tsx → formulário com validação campo a campo
    │   ├── TelaFavoritos.tsx         → eventos favoritos salvos no aparelho
    │   └── TelaSobre.tsx             → informações do app, versão e plataforma
    ├── componentes/
    │   ├── CartaoEvento.tsx          → cartão de um evento nas listas
    │   ├── BarraPesquisa.tsx         → campo de busca com botão "x"
    │   ├── FiltroCategorias.tsx      → chips coloridos das categorias
    │   ├── PainelFiltros.tsx         → categorias + "Mais filtros" (data, modalidade, encerrados)
    │   ├── Chip.tsx                  → botão-pílula selecionável (base dos filtros)
    │   ├── CampoFormulario.tsx       → TextInput reutilizável com mensagem de erro embaixo
    │   ├── BotaoPrincipal.tsx        → botão padrão (primário, secundário, perigo, carregando)
    │   ├── Etiqueta.tsx              → pílula de texto colorida (categoria, temas)
    │   ├── EtiquetaStatus.tsx        → "Aberto", "Encerrado", "Indisponível"
    │   ├── ImagemEvento.tsx          → imagem do evento, com ícone da categoria se não houver imagem
    │   ├── InformacoesEvento.tsx     → cartão "quando/onde/modalidade/organização" dos detalhes
    │   ├── LinhaInformacao.tsx       → linha com ícone + rótulo + texto
    │   ├── MensagemInformativa.tsx   → caixa de aviso/erro/informação
    │   ├── SeparadorLista.tsx        → espaço entre os itens da FlatList
    │   └── estados/
    │       ├── EstadoCarregando.tsx
    │       ├── EstadoErro.tsx        → com botão "Tentar novamente"
    │       ├── EstadoVazio.tsx
    │       └── EstruturaEstado.tsx   → layout comum de EstadoErro e EstadoVazio
    ├── navegacao/
    │   ├── NavegacaoPrincipal.tsx    → pilha (Stack) + abas (Bottom Tabs)
    │   └── tiposNavegacao.ts         → tipagem das rotas e dos parâmetros
    ├── servicos/
    │   ├── servicoApi.ts             → fetch com tempo limite, tratamento de erros, Promise.allSettled
    │   ├── servicoArmazenamento.ts   → AsyncStorage: favoritos, inscrições e ids dos lembretes
    │   └── servicoNotificacoes.ts    → canal Android, permissão, agendar e cancelar lembretes
    ├── ganchos/
    │   ├── useEventos.ts             → carrega os eventos e controla carregando/erro/aviso
    │   ├── useFiltrosEventos.ts      → guarda os filtros e devolve a lista filtrada
    │   ├── useFavoritos.ts           → favoritos, recarregados quando a tela volta a aparecer
    │   ├── useLembrete.ts            → fluxo de permissão + agendar/cancelar lembrete
    │   ├── useInscricaoDoEvento.ts   → inscrição já salva para um evento (mostrada nos detalhes)
    │   └── useFormularioInscricao.ts → dados, erros e envio do formulário
    ├── tipos/
    │   ├── evento.ts                 → Evento, Inscricao, StatusEvento, FiltrosEventos...
    │   ├── respostasApi.ts           → formato "cru" do JSON de cada API
    │   └── icones.ts                 → tipo com os nomes válidos de ícones
    ├── utilitarios/
    │   ├── conversoresEventos.ts     → converterHackathonParaEvento e converterEventoAcademico
    │   ├── filtrosEventos.ts         → regras de busca, filtros e ordenação
    │   ├── formatarData.ts           → datas em português ("ter, 18 de nov. de 2026 • 19:00")
    │   ├── statusEvento.ts           → decide se o evento está aberto/encerrado/indisponível
    │   ├── validacoes.ts             → validar nome, e-mail, matrícula, curso e observação
    │   └── texto.ts                  → normalizar texto (sem acento) e remover HTML
    ├── constantes/
    │   └── configuracoes.ts          → URLs das APIs, categorias, chaves do AsyncStorage, limites
    └── estilos/
        ├── tema.ts                   → TODAS as cores, fontes, espaçamentos, bordas e sombras
        └── estilosGlobais.ts         → StyleSheet único com os estilos compartilhados
```

---

## 2. Criar o projeto e instalar as dependências

**Se você recebeu este projeto pronto**, basta instalar as dependências:

```bash
cd agenda-do-estudante
npm install
```

**Para recriar do zero** (foram estes os comandos usados):

```bash
npx create-expo-app@latest agenda-do-estudante --template blank-typescript
cd agenda-do-estudante

npx expo install @react-navigation/native @react-navigation/native-stack \
  @react-navigation/bottom-tabs @react-navigation/elements \
  react-native-screens react-native-safe-area-context \
  @react-native-async-storage/async-storage \
  expo-notifications expo-constants expo-dev-client expo-font @expo/vector-icons

npx expo lint   # na primeira vez, instala e configura o ESLint (eslint + eslint-config-expo)
```

> O `npx expo lint` deste SDK recusa o ESLint 9 por engano ("requires 8.57.0 or greater"). Por isso
> o script `npm run lint` chama o `eslint .` diretamente.

> Use sempre `npx expo install` (e não `npm install <pacote>`). Ele escolhe a versão de cada
> biblioteca que é compatível com o SDK do Expo do projeto.

---

## 3. (Opcional) Configurar a API acadêmica no MockAPI

O app já funciona sem isso: enquanto `URL_API_ACADEMICA` estiver vazia em
`src/constantes/configuracoes.ts`, os eventos acadêmicos são lidos do arquivo
`dados/eventosAcademicos.json`.

Para usar uma API de verdade:

1. Crie uma conta em <https://mockapi.io> e um novo projeto.
2. Crie um recurso chamado **`eventos`**.
3. Abra os dados do recurso (botão **Data**), apague o conteúdo e cole todo o conteúdo de
   `dados/eventosAcademicos.json`. Salve.
4. Copie a URL do recurso (algo como `https://6745abc123.mockapi.io/api/v1/eventos`), abra no
   navegador para conferir se aparece o JSON e cole em `configuracoes.ts`:
   ```ts
   export const URL_API_ACADEMICA = "https://6745abc123.mockapi.io/api/v1/eventos";
   ```

> **Alternativa com json-server:** crie `dados/db.json` com `{ "eventos": [ ...conteúdo do arquivo... ] }`
> e rode `npx json-server --host 0.0.0.0 dados/db.json`. No celular, use o **IP do computador na
> rede** (ex.: `http://192.168.0.10:3000/eventos`), porque `localhost` no celular é o próprio celular.

---

## 4. Rodar o app

```bash
npx expo start
```

Como o projeto tem o `expo-dev-client`, o terminal abre no modo **development build**.
Se você ainda não gerou o development build (seção 5), aperte **`s`** no terminal para trocar
para o **Expo Go**, instale o app **Expo Go** no celular e escaneie o QR Code.

- Celular e computador precisam estar na **mesma rede Wi-Fi**. Se não funcionar, rode
  `npx expo start --tunnel`.
- Para conferir o código antes de rodar: `npm run verificar` (TypeScript + ESLint + expo-doctor).
  Só o ESLint: `npm run lint`.

> **Notificações:** as notificações locais funcionam no Expo Go, mas o jeito recomendado de
> testá-las (com o nome, o ícone e o canal do seu app) é o **development build**.

---

## 5. Development Build (`eas build --profile development`)

O development build é um "Expo Go personalizado": um app instalável com as bibliotecas nativas do
**seu** projeto. Você gera uma vez e depois continua programando normalmente com `npx expo start`.

```bash
npm install -g eas-cli          # instala o EAS CLI (uma vez só)
eas login                       # entre com sua conta Expo (crie em expo.dev)
eas build --profile development --platform android
```

1. Na primeira vez, o EAS pergunta se pode criar o projeto na sua conta: responda **Yes**. Ele
   adiciona um `projectId` no `app.json`. Isso é normal.
2. Ele pergunta se pode gerar uma **keystore** (chave de assinatura): responda **Yes** (veja a seção 8).
3. O build roda **na nuvem** (não precisa de Android Studio). No fim aparece um link e um QR Code:
   abra no celular e instale o APK.
4. No computador: `npx expo start`. Abra o app instalado e escaneie o QR Code (ou digite a URL).

> **iOS:** builds para aparelho físico exigem conta paga no Apple Developer Program.
> Sem ela, use o simulador (macOS) ou o Expo Go.

---

## 6. Gerar o APK (`preview`)

O APK é o arquivo instalável direto no Android, ótimo para o professor e os colegas testarem.

```bash
eas build -p android --profile preview
```

No fim, o EAS mostra um link: baixe o `.apk` no celular e instale. Pode ser preciso permitir
"instalar apps de fontes desconhecidas".

---

## 7. Gerar o AAB (`production`)

O **AAB (Android App Bundle)** é o formato exigido pela **Google Play Store**. Ele não instala
direto no celular: a Play Store gera, a partir dele, um APK otimizado para cada aparelho.

```bash
eas build -p android --profile production
```

Para enviar à Play Store depois: `eas submit -p android` (precisa de conta Google Play Console).

---

## 8. Assinatura Android (keystore gerenciada pelo EAS)

Todo app Android precisa ser **assinado digitalmente** com uma chave (a *keystore*). A assinatura
prova que uma atualização veio do mesmo autor: o Android só aceita atualizar um app se a nova versão
tiver a **mesma assinatura** da instalada.

- Na primeira build, o EAS **gera a keystore e guarda nos servidores da Expo**. Você não precisa
  criar nem guardar o arquivo manualmente.
- Para ver ou baixar um backup: `eas credentials` → Android → escolha o perfil.
- **Nunca perca a keystore** de um app publicado sem o *Play App Signing*: sem ela, não dá para
  atualizar o app. Com o Play App Signing (padrão da Play Store hoje), o Google guarda a chave final
  e a sua passa a ser só a "chave de upload", que pode ser trocada pelo suporte se for perdida.

---

## 9. Versionamento (`version` e `versionCode`)

No `app.json` existem dois números diferentes:

| Campo | Exemplo | Para quem é | Regra |
|---|---|---|---|
| `version` | `"1.0.0"` | o **usuário** (aparece na loja e na tela Sobre) | formato MAIOR.MENOR.CORREÇÃO |
| `android.versionCode` | `1` | o **Android/Play Store** | número inteiro que **sempre aumenta** |
| `ios.buildNumber` | `"1"` | o **iOS/App Store** | equivalente ao versionCode |

- Correção de bug: `1.0.0` → `1.0.1`. Funcionalidade nova: `1.0.0` → `1.1.0`.
  Mudança grande: `1.0.0` → `2.0.0`. Quem muda o `version` é você.
- A Play Store **rejeita** um AAB com `versionCode` igual ou menor que o já publicado.
- No `eas.json`, o perfil `production` tem `"autoIncrement": true` e o `"appVersionSource": "local"`:
  a cada build de produção, o EAS **soma 1 no `versionCode` do `app.json`** automaticamente. Depois da
  build, salve (faça commit) o `app.json` alterado.

---

## 10. Testes antes de publicar

A tabela completa para preencher no celular está em [docs/CHECKLIST_TESTES.md](docs/CHECKLIST_TESTES.md).
Resumo do que testar:

**Funcionalidades**
- [ ] A lista carrega; "puxar para atualizar" funciona.
- [ ] Busca sem acento encontra texto com acento ("academica" → "Acadêmica").
- [ ] Cada filtro (categoria, data, modalidade, encerrados) e o "Limpar filtros".
- [ ] Detalhes de um evento **aberto**, **encerrado**, **esgotado** e **cancelado**: etiqueta,
      cartão apagado, botão de inscrição bloqueado e mensagem explicativa.
- [ ] Formulário: enviar vazio mostra erro embaixo de cada campo; e-mail inválido; matrícula com
      letra; erro some ao corrigir; envio válido mostra a mensagem de sucesso.
- [ ] Favoritar, **fechar o app por completo** e abrir de novo: o favorito continua lá.

**Rede e erros**
- [ ] Modo avião ao abrir o app: os eventos acadêmicos locais aparecem com um aviso
      (ou a tela de erro, se a API acadêmica estiver configurada no MockAPI) e "Tentar novamente" funciona.

**Notificações**
- [ ] Tocar em "Lembrar-me" mostra a explicação **antes** do pedido do sistema.
- [ ] Negar a permissão → mensagem amigável + "Abrir configurações" abre as configurações do app.
- [ ] Permitir → lembrete agendado; "Cancelar lembrete" funciona; remover dos favoritos também cancela.
- [ ] Dica para ver a notificação chegar: crie um evento (no MockAPI ou no JSON local) que comece
      daqui a ~62 minutos. O lembrete tocará em ~2 minutos (60 min de antecedência).

**Plataformas e aparelhos**
- [ ] Testar em um **celular de verdade** (não só no emulador), Android e, se possível, iOS.
- [ ] Tela pequena, teclado aberto no formulário (nenhum campo escondido) e aparelho com entalhe.
- [ ] Instalar o **APK do perfil preview** e conferir a versão na tela Sobre.

---

## 11. Observações sobre os dados

- A Open Hackathons API marca quase todos os hackathons como `"open"`, mas a maioria tem datas que
  já passaram. O app **calcula o status pela data** e por isso mostra esses eventos como
  **Encerrados**. Eles ficam escondidos por padrão (a lista mostra eventos futuros). Para vê-los,
  ative **Mais filtros → Mostrar eventos encerrados**.
- Os eventos acadêmicos de exemplo têm datas entre out/2026 e abr/2027. Se for apresentar o app
  depois disso, atualize as datas no JSON (ou no MockAPI).
