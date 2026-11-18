# Checklist de testes — Agenda do Estudante

Executar no **APK do perfil preview** (ou no build final), em um **celular Android de verdade**.
Preencha as colunas "Resultado obtido", "Aprovado", "Aparelho/Android" e "Data", e tire um print dos
testes marcados com 📸 para o relatório.

**Preparação**
- Configure a API acadêmica no MockAPI (README, seção 3). Sem isso, os testes 3, 4 e 5 mostram
  o aviso de falha parcial em vez da tela de erro, porque os eventos acadêmicos locais nunca falham.
- Para o teste 21 (notificação chegando): no MockAPI, mude a `data` de um evento para **daqui a
  ~62 minutos** (ex.: `2026-11-20T15:02:00-03:00`) e o `dataFim` para depois disso. O lembrete é
  agendado 60 min antes, então chegará em ~2 minutos.

Aparelho usado: ______________________ · Versão do Android: ______ · Versão do app (tela Sobre): ______

| Nº | Funcionalidade testada | Passos | Resultado esperado | Resultado obtido | Aprovado (Sim/Não) | Aparelho/Android | Data |
|---|---|---|---|---|---|---|---|
| 1 | Abrir o app | Tocar no ícone "Agenda do Estudante" | Abre sem travar na aba "Eventos" | | | | |
| 2 | Lista carregando 📸 | Abrir o app com internet | Rodinha "Buscando eventos..." e depois os cartões | | | | |
| 3 | Sem internet 📸 | Ativar o modo avião → fechar e abrir o app | Tela "Algo deu errado" + "Sem conexão com a internet..." + botão "Tentar novamente" | | | | |
| 4 | Tentar novamente | No teste 3, desativar o modo avião → "Tentar novamente" | A lista carrega normalmente | | | | |
| 5 | API com erro (falha parcial) 📸 | No MockAPI, renomear o recurso "eventos" → puxar a lista para atualizar | Lista de hackathons + aviso amarelo "Não conseguimos carregar: eventos acadêmicos" com "Tentar novamente" (desfazer depois) | | | | |
| 6 | Puxar para atualizar | Arrastar a lista para baixo | Aparece a rodinha no topo e a lista recarrega | | | | |
| 7 | Lista vazia 📸 | Buscar "xyzxyz" | "Nenhum evento encontrado" + botão "Limpar filtros" (que volta a lista) | | | | |
| 8 | Busca por texto | Buscar "academica" (sem acento) | Aparecem eventos com "Acadêmica" | | | | |
| 9 | Filtro por categoria 📸 | Tocar no chip "Oficina" | Só aparecem oficinas | | | | |
| 10 | Filtro por data | "Mais filtros" → "Este mês" | Só eventos que acontecem até o fim do mês | | | | |
| 11 | Filtro por modalidade | "Mais filtros" → "Online" | Só eventos online | | | | |
| 12 | Mostrar encerrados | "Mais filtros" → ligar "Mostrar eventos encerrados" | Aparecem eventos encerrados no fim da lista, com etiqueta cinza e cartão apagado | | | | |
| 13 | Detalhes 📸 | Tocar em um evento aberto | Imagem, etiquetas, data, local, modalidade, organização, descrição, temas e botões | | | | |
| 14 | Evento encerrado 📸 | Abrir um evento encerrado (teste 12) | Etiqueta "Encerrado", mensagem "Este evento terminou em..." e botão "Inscrições bloqueadas" desativado | | | | |
| 15 | Evento indisponível 📸 | Abrir "Prototipação de Interfaces com Figma" (esgotado) e "Empreendedorismo e Startups" (cancelado) | Etiqueta "Indisponível", mensagem explicando o motivo e botão bloqueado | | | | |
| 16 | Favoritar e desfavoritar | Tocar no coração de um cartão; depois tocar de novo | Coração fica vermelho e o evento aparece na aba Favoritos; ao tocar de novo, sai | | | | |
| 17 | Favoritos após reabrir o app 📸 | Favoritar 2 eventos → fechar o app por completo (tirar dos recentes) → abrir | Os 2 eventos continuam na aba Favoritos | | | | |
| 18 | Formulário inválido 📸 | Detalhes → "Quero me inscrever" → enviar vazio; depois e-mail "ana@" e matrícula "12a" | Mensagem de erro vermelha embaixo de cada campo; o erro some ao corrigir | | | | |
| 19 | Formulário válido 📸 | Preencher "Ana Souza", "ana@uni.br", "2023123456", "Sistemas de Informação" → Enviar | Alert "Inscrição registrada!" → volta aos Detalhes com "Você já se inscreveu como Ana Souza..." | | | | |
| 20 | Inscrição após reabrir o app | Fechar o app por completo → abrir o mesmo evento | A mensagem "Você já se inscreveu..." continua aparecendo | | | | |
| 21 | Permissão aceita + notificação recebida 📸 | Favoritar o evento preparado → "Lembrar-me" → "Continuar" → "Permitir" → aguardar ~2 min com o app fechado | Alert explicativo antes do pedido do sistema; "Lembrete ativado"; a notificação chega na barra do Android | | | | |
| 22 | Canal de notificação 📸 | Configurações do Android → Apps → Agenda do Estudante → Notificações | Aparece o canal "Lembretes de eventos" | | | | |
| 23 | Cancelar lembrete | Em um favorito com lembrete → "Cancelar lembrete" | Alert "Lembrete cancelado" e o botão volta para "Lembrar-me" | | | | |
| 24 | Remover favorito cancela lembrete | Com lembrete ativo → "Remover dos favoritos" | O lembrete some (o texto pede para favoritar de novo) | | | | |
| 25 | Permissão negada 📸 | Desinstalar e instalar de novo → "Lembrar-me" → "Continuar" → "Não permitir" | Mensagem amigável "Notificações desativadas" + botão "Abrir configurações" que abre as configurações do app | | | | |
| 26 | Navegação entre todas as telas | Eventos → Detalhes → Inscrição → voltar → voltar; abas Favoritos e Sobre; Favoritos → Detalhes | Todas as telas abrem e o "voltar" (botão e gesto) funciona | | | | |
| 27 | Teclado sobre o formulário 📸 | No formulário, tocar em "Observação" (último campo) | O teclado não cobre o campo; dá para rolar até o botão "Enviar" | | | | |
| 28 | Versão na tela Sobre 📸 | Aba "Sobre" | Mostra "Versão 1.0.0 (versionCode N)" igual ao app.json do build | | | | |
| 29 | Abrir página do evento | Detalhes → "Abrir página do evento" | Abre o navegador com o site do evento | | | | |
| 30 | Tela pequena / girar | Testar em um aparelho de tela pequena | Nada cortado; textos longos quebram linha | | | | |

**Resumo:** ____ de 30 aprovados. Problemas encontrados e correções: ______________________________
