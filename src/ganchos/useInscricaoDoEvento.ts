/**
 * ARQUIVO: src/ganchos/useInscricaoDoEvento.ts
 *
 * PARA QUE SERVE?
 * Descobre se o usuário já se inscreveu em um evento. A tela de detalhes usa
 * isso para mostrar "Você já se inscreveu..." e trocar o texto do botão.
 *
 * Também é a prova de que a inscrição ficou salva: depois de fechar e abrir o
 * app de novo, a mensagem continua aparecendo nos detalhes do evento.
 */
import { useIsFocused } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { buscarInscricaoDoEvento } from "../servicos/servicoArmazenamento";
import { Inscricao } from "../tipos/evento";

/**
 * Recebe: o id do evento.
 * Devolve: a inscrição salva para esse evento, ou null se não houver.
 */
export function useInscricaoDoEvento(eventoId: string): Inscricao | null {
  const [inscricao, setInscricao] = useState<Inscricao | null>(null);
  const telaEstaVisivel = useIsFocused();

  // Dependências [eventoId, telaEstaVisivel]: lemos de novo quando a tela volta
  // a ficar visível. Assim, ao voltar do formulário, a mensagem já aparece.
  useEffect(() => {
    if (!telaEstaVisivel) {
      return;
    }
    async function carregar() {
      try {
        const encontrada = await buscarInscricaoDoEvento(eventoId);
        setInscricao(encontrada);
      } catch {
        setInscricao(null); // se não der para ler, apenas não mostramos a mensagem
      }
    }
    carregar();
  }, [eventoId, telaEstaVisivel]);

  return inscricao;
}
