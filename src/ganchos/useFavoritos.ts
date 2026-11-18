/**
 * ARQUIVO: src/ganchos/useFavoritos.ts
 *
 * PARA QUE SERVE?
 * Carrega os favoritos salvos no aparelho e permite favoritar/desfavoritar.
 * É usado em três telas: Lista (coração nos cartões), Detalhes e Favoritos.
 *
 * COMO AS TELAS FICAM SINCRONIZADAS?
 * Cada tela tem a SUA cópia dos favoritos. Se você favorita na tela de Detalhes
 * e volta para a Lista, a Lista precisa ler os favoritos de novo.
 * Para isso usamos useIsFocused (do React Navigation), que diz se a tela está
 * visível. Sempre que a tela volta a ficar visível, recarregamos do AsyncStorage.
 */
import { useIsFocused } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { Alert } from "react-native";
import { buscarFavoritos, removerFavorito, salvarFavorito } from "../servicos/servicoArmazenamento";
import { cancelarLembreteDoEvento } from "../servicos/servicoNotificacoes";
import { Evento } from "../tipos/evento";

/**
 * Recebe: nada.
 * Devolve:
 * - favoritos: a lista de eventos favoritos;
 * - carregando / erro: para a tela de Favoritos mostrar os estados;
 * - ehFavorito(id): diz se um evento está nos favoritos;
 * - alternarFavorito(evento): favorita ou desfavorita;
 * - tentarNovamente: lê de novo do aparelho (botão "Tentar novamente").
 */
export function useFavoritos() {
  const [favoritos, setFavoritos] = useState<Evento[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [tentativa, setTentativa] = useState(0); // muda para pedir uma nova leitura
  const telaEstaVisivel = useIsFocused();

  // Dependências [telaEstaVisivel, tentativa]: o efeito roda quando a tela abre,
  // quando ela volta a ficar visível e quando o usuário toca em "Tentar novamente".
  // Se a tela ficou invisível, não fazemos nada (return antecipado).
  useEffect(() => {
    if (!telaEstaVisivel) {
      return;
    }
    async function carregar() {
      try {
        const lista = await buscarFavoritos();
        setFavoritos(lista);
        setErro(null);
      } catch {
        setErro("Não foi possível ler os favoritos salvos no aparelho.");
      } finally {
        setCarregando(false);
      }
    }
    carregar();
  }, [telaEstaVisivel, tentativa]);

  /** Botão "Tentar novamente": mostra o carregando e pede uma nova leitura. */
  function tentarNovamente() {
    setCarregando(true);
    setTentativa(tentativa + 1);
  }

  /**
   * Diz se o evento está nos favoritos.
   * Recebe: o id do evento → Devolve: true ou false.
   */
  function ehFavorito(eventoId: string): boolean {
    return favoritos.some((favorito) => favorito.id === eventoId);
  }

  /**
   * Se o evento é favorito, remove; se não é, adiciona.
   * Recebe: o evento. Devolve: nada (atualiza o estado "favoritos").
   * Ao remover, também cancelamos o lembrete: o lembrete é um recurso dos
   * favoritos, então não faz sentido ele continuar tocando.
   */
  async function alternarFavorito(evento: Evento) {
    try {
      if (ehFavorito(evento.id)) {
        const novaLista = await removerFavorito(evento.id);
        setFavoritos(novaLista);
        await cancelarLembreteDoEvento(evento.id);
      } else {
        const novaLista = await salvarFavorito(evento);
        setFavoritos(novaLista);
      }
    } catch {
      Alert.alert("Ops!", "Não foi possível atualizar seus favoritos. Tente novamente.");
    }
  }

  return { favoritos, carregando, erro, ehFavorito, alternarFavorito, tentarNovamente };
}
