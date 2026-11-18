/**
 * ARQUIVO: src/servicos/servicoNotificacoes.ts
 *
 * PARA QUE SERVE?
 * Cuida das notificações LOCAIS (agendadas pelo próprio celular, sem servidor):
 * - configurar como a notificação aparece com o app aberto;
 * - criar o canal de notificação do Android;
 * - verificar e pedir a permissão;
 * - agendar e cancelar o lembrete de um evento.
 *
 * Este arquivo NÃO mostra alertas. A conversa com o usuário (explicar por que
 * precisamos da permissão, oferecer abrir as configurações) fica no gancho
 * useLembrete, porque faz parte da interface.
 */
// "import * as Notifications" traz todas as funções do pacote em um só objeto
// (Notifications.scheduleNotificationAsync, etc.). As duas listas de valores fixos
// (enums) abaixo são importadas pelo nome porque o ESLint não as encontrava
// dentro do objeto Notifications (o app funcionava, mas o linter acusava erro).
import * as Notifications from "expo-notifications";
import { AndroidImportance, IosAuthorizationStatus } from "expo-notifications";
import { Platform } from "react-native";
import { ANTECEDENCIA_LEMBRETE_MINUTOS, CANAL_LEMBRETES } from "../constantes/configuracoes";
import { cores } from "../estilos/tema";
import { Evento } from "../tipos/evento";
import { formatarDataHora, formatarPeriodoEvento } from "../utilitarios/formatarData";
import { obterDataTermino } from "../utilitarios/statusEvento";
import { buscarIdLembrete, removerIdLembrete, salvarIdLembrete } from "./servicoArmazenamento";

/**
 * Situação da permissão de notificações:
 * - "concedida": o usuário já permitiu;
 * - "podePerguntar": ainda podemos mostrar a janela do sistema pedindo permissão;
 * - "negada": o usuário negou e o sistema não deixa perguntar de novo
 *   (só dá para mudar nas configurações do aparelho).
 */
export type SituacaoPermissao = "concedida" | "podePerguntar" | "negada";

/**
 * Define o que fazer quando uma notificação chega com o APP ABERTO.
 * Por padrão, o sistema não mostra nada nesse caso; aqui pedimos para mostrar
 * o banner, colocar na central de notificações e tocar o som.
 *
 * Deve ser chamada uma única vez, quando o app inicia (veja App.tsx).
 */
export function configurarExibicaoNotificacoes(): void {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

/**
 * Cria o canal de notificação no ANDROID.
 *
 * Por quê? Desde o Android 8, toda notificação precisa pertencer a um "canal".
 * O usuário pode ligar e desligar cada canal nas configurações (ex.: deixar
 * ligados só os "Lembretes de eventos"). E, a partir do Android 13, a janela que
 * pede permissão só aparece se o app já tiver pelo menos um canal criado.
 *
 * No iOS não existe canal; por isso a função não faz nada lá (Platform.OS).
 * Criar um canal que já existe não dá erro; ele só é atualizado.
 */
export async function criarCanalAndroid(): Promise<void> {
  if (Platform.OS !== "android") {
    return;
  }
  await Notifications.setNotificationChannelAsync(CANAL_LEMBRETES.id, {
    name: CANAL_LEMBRETES.nome,
    importance: AndroidImportance.HIGH, // HIGH = aparece como banner na tela
    vibrationPattern: [0, 250, 250, 250],
    lightColor: cores.primaria,
  });
}

/**
 * Confere se a resposta do sistema significa "pode notificar".
 * No iOS existe ainda a permissão "provisória" (notificações silenciosas na
 * central), que também consideramos como permitida.
 */
function permissaoFoiConcedida(resposta: Notifications.NotificationPermissionsStatus): boolean {
  return resposta.granted || resposta.ios?.status === IosAuthorizationStatus.PROVISIONAL;
}

/**
 * Consulta a permissão atual SEM perguntar nada ao usuário.
 * Devolve: "concedida", "podePerguntar" ou "negada".
 */
export async function verificarPermissaoNotificacoes(): Promise<SituacaoPermissao> {
  const resposta = await Notifications.getPermissionsAsync();

  if (permissaoFoiConcedida(resposta)) {
    return "concedida";
  }
  if (resposta.canAskAgain) {
    return "podePerguntar";
  }
  return "negada";
}

/**
 * Mostra a janela do SISTEMA pedindo permissão de notificação.
 * Devolve: true se o usuário permitiu.
 *
 * Antes de pedir, criamos o canal (exigência do Android 13 explicada acima).
 */
export async function pedirPermissaoNotificacoes(): Promise<boolean> {
  await criarCanalAndroid();
  const resposta = await Notifications.requestPermissionsAsync();
  return permissaoFoiConcedida(resposta);
}

/**
 * Calcula QUANDO o lembrete deve tocar.
 *
 * Regra: ANTECEDENCIA_LEMBRETE_MINUTOS (60 min) antes do início.
 * Se o evento já começou (ex.: um hackathon de vários dias), lembramos
 * 60 minutos antes do FIM, para a pessoa não perder o prazo.
 *
 * Recebe: o evento e o momento atual.
 * Devolve: a data do lembrete, ou null se já não há tempo para lembrar.
 */
export function calcularDataLembrete(evento: Evento, agora: Date = new Date()): Date | null {
  const antecedenciaEmMs = ANTECEDENCIA_LEMBRETE_MINUTOS * 60 * 1000;

  const antesDoInicio = new Date(new Date(evento.dataInicio).getTime() - antecedenciaEmMs);
  if (antesDoInicio > agora) {
    return antesDoInicio;
  }

  const antesDoFim = new Date(obterDataTermino(evento).getTime() - antecedenciaEmMs);
  if (antesDoFim > agora) {
    return antesDoFim;
  }
  return null;
}

/**
 * Monta o texto da notificação.
 * Se o lembrete é antes do início, avisa que vai começar; senão, que vai terminar.
 */
function montarTextoLembrete(evento: Evento, dataLembrete: Date): string {
  const lembraDoInicio = dataLembrete < new Date(evento.dataInicio);
  if (lembraDoInicio) {
    return `Começa em breve: ${formatarPeriodoEvento(evento)} • ${evento.local}`;
  }
  return `Está acabando! O prazo termina em ${formatarDataHora(obterDataTermino(evento))}.`;
}

/**
 * Agenda a notificação do evento e guarda o id dela no aparelho.
 *
 * Recebe: o evento e a data em que a notificação deve aparecer.
 * Devolve: nada (Promise<void>). Lança erro se o agendamento falhar.
 *
 * O "trigger" (gatilho) do tipo DATE faz a notificação aparecer uma única vez,
 * na data indicada. No Android, também informamos o canal.
 */
export async function agendarLembreteDoEvento(evento: Evento, dataLembrete: Date): Promise<void> {
  await criarCanalAndroid();

  const idNotificacao = await Notifications.scheduleNotificationAsync({
    content: {
      title: `Lembrete: ${evento.titulo}`,
      body: montarTextoLembrete(evento, dataLembrete),
      data: { eventoId: evento.id },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: dataLembrete,
      channelId: CANAL_LEMBRETES.id,
    },
  });

  await salvarIdLembrete(evento.id, idNotificacao);
}

/**
 * Cancela o lembrete de um evento (se existir) e apaga o registro dele.
 * Recebe: o id do evento.
 */
export async function cancelarLembreteDoEvento(eventoId: string): Promise<void> {
  const idNotificacao = await buscarIdLembrete(eventoId);
  if (idNotificacao) {
    await Notifications.cancelScheduledNotificationAsync(idNotificacao);
  }
  await removerIdLembrete(eventoId);
}

/**
 * Diz se o evento tem um lembrete AINDA agendado.
 *
 * Por que conferir com o sistema? Depois que a notificação toca, ela sai da
 * lista de agendadas, mas o id continua salvo no AsyncStorage. Aqui conferimos
 * e, se ela já tocou, limpamos o registro antigo.
 */
export async function eventoTemLembreteAgendado(eventoId: string): Promise<boolean> {
  const idNotificacao = await buscarIdLembrete(eventoId);
  if (!idNotificacao) {
    return false;
  }

  const agendadas = await Notifications.getAllScheduledNotificationsAsync();
  const aindaAgendado = agendadas.some((notificacao) => notificacao.identifier === idNotificacao);

  if (!aindaAgendado) {
    await removerIdLembrete(eventoId);
  }
  return aindaAgendado;
}
