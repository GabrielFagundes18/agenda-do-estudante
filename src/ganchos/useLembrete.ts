/**
 * ARQUIVO: src/ganchos/useLembrete.ts
 *
 * PARA QUE SERVE?
 * Controla o botão "Lembrar-me" da tela de detalhes:
 * 1. Mostra se o evento já tem lembrete agendado.
 * 2. Ao tocar em "Lembrar-me", segue o fluxo de permissão recomendado:
 *    - pede a permissão SÓ neste momento (e não quando o app abre);
 *    - ANTES de pedir, explica em um Alert por que ela é necessária;
 *    - se o usuário negar, mostra uma mensagem amigável e um botão que abre
 *      as configurações do aparelho (Linking.openSettings).
 * 3. Permite cancelar o lembrete.
 *
 * Por que pedir só na hora? Se o app pede permissão logo ao abrir, sem contexto,
 * muita gente nega. Quando a pessoa acabou de tocar em "Lembrar-me", ela entende
 * para que serve e tende a aceitar.
 */
import { useEffect, useState } from "react";
import { Alert, Linking } from "react-native";
import {
  agendarLembreteDoEvento,
  calcularDataLembrete,
  cancelarLembreteDoEvento,
  eventoTemLembreteAgendado,
  pedirPermissaoNotificacoes,
  verificarPermissaoNotificacoes,
} from "../servicos/servicoNotificacoes";
import { Evento } from "../tipos/evento";
import { formatarDataHora } from "../utilitarios/formatarData";
import { calcularStatusEvento } from "../utilitarios/statusEvento";

/**
 * Recebe:
 * - evento: o evento da tela de detalhes;
 * - ehFavorito: se ele está nos favoritos (quando deixa de ser, o lembrete é
 *   cancelado pelo useFavoritos, e aqui conferimos de novo).
 *
 * Devolve: lembreteAtivo, processando, lembretePermitido, ativarLembrete e cancelarLembrete.
 */
export function useLembrete(evento: Evento, ehFavorito: boolean) {
  const [lembreteAtivo, setLembreteAtivo] = useState(false);
  const [processando, setProcessando] = useState(false);

  // Não faz sentido lembrar de evento cancelado ou que já terminou.
  const lembretePermitido = evento.situacao !== "cancelado" && calcularStatusEvento(evento) !== "encerrado";

  // Confere no aparelho se já existe lembrete agendado para este evento.
  // Dependências [evento.id, ehFavorito]: roda quando a tela abre, se o evento
  // mudar, e quando ele entra ou sai dos favoritos (remover dos favoritos cancela
  // o lembrete, então o botão precisa voltar para "Lembrar-me").
  // A função fica DENTRO do efeito, para o array de dependências ficar completo.
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

  /** Agenda a notificação (só é chamada quando já temos permissão). */
  async function agendar(dataLembrete: Date) {
    setProcessando(true);
    try {
      await agendarLembreteDoEvento(evento, dataLembrete);
      setLembreteAtivo(true);
      Alert.alert("Lembrete ativado", `Vamos avisar você em ${formatarDataHora(dataLembrete)}.`);
    } catch {
      Alert.alert("Ops!", "Não conseguimos agendar o lembrete. Tente novamente.");
    } finally {
      setProcessando(false);
    }
  }

  /** Mensagem amigável para quem negou, com atalho para as configurações. */
  function mostrarAlertaPermissaoNegada() {
    Alert.alert(
      "Notificações desativadas",
      "Tudo bem! Sem essa permissão não conseguimos enviar lembretes. " +
        "Se mudar de ideia, é só ativar as notificações do app nas configurações do aparelho.",
      [
        { text: "Agora não", style: "cancel" },
        { text: "Abrir configurações", onPress: () => Linking.openSettings() },
      ],
    );
  }

  /** Mostra a janela do sistema; se o usuário aceitar, agenda o lembrete. */
  async function pedirPermissaoEAgendar(dataLembrete: Date) {
    const permitiu = await pedirPermissaoNotificacoes();
    if (permitiu) {
      await agendar(dataLembrete);
    } else {
      mostrarAlertaPermissaoNegada();
    }
  }

  /** Chamada pelo botão "Lembrar-me". */
  async function ativarLembrete() {
    // 1. Conferimos ANTES se ainda dá tempo, para não pedir permissão à toa.
    const dataLembrete = calcularDataLembrete(evento);
    if (!dataLembrete) {
      Alert.alert("Não dá mais tempo", "Este evento já está terminando, então não há como agendar um lembrete.");
      return;
    }

    // 2. Vemos como está a permissão.
    const permissao = await verificarPermissaoNotificacoes();

    if (permissao === "concedida") {
      await agendar(dataLembrete);
      return;
    }
    if (permissao === "negada") {
      mostrarAlertaPermissaoNegada();
      return;
    }

    // 3. Ainda podemos perguntar: primeiro explicamos o motivo, depois pedimos.
    Alert.alert(
      "Permitir notificações?",
      "Para lembrar você deste evento, o app precisa enviar uma notificação no seu celular. " +
        "Usamos as notificações apenas para os lembretes que você ativar.",
      [
        { text: "Agora não", style: "cancel" },
        { text: "Continuar", onPress: () => pedirPermissaoEAgendar(dataLembrete) },
      ],
    );
  }

  /** Chamada pelo botão "Cancelar lembrete". */
  async function cancelarLembrete() {
    setProcessando(true);
    try {
      await cancelarLembreteDoEvento(evento.id);
      setLembreteAtivo(false);
      Alert.alert("Lembrete cancelado", "Você não vai mais receber a notificação deste evento.");
    } catch {
      Alert.alert("Ops!", "Não conseguimos cancelar o lembrete. Tente novamente.");
    } finally {
      setProcessando(false);
    }
  }

  return { lembreteAtivo, processando, lembretePermitido, ativarLembrete, cancelarLembrete };
}
