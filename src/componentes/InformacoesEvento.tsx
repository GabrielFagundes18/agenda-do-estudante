/**
 * ARQUIVO: src/componentes/InformacoesEvento.tsx
 *
 * PARA QUE SERVE?
 * O cartão da tela de detalhes com as informações principais do evento:
 * quando, onde, modalidade, organização, vagas e informações extras
 * (prêmio, inscritos e plataforma, no caso dos hackathons).
 *
 * Fica separado da tela para a função da tela não ficar grande demais.
 */
import { View } from "react-native";
import { estilosGlobais } from "../estilos/estilosGlobais";
import { Evento } from "../tipos/evento";
import { formatarPeriodoEvento } from "../utilitarios/formatarData";
import LinhaInformacao from "./LinhaInformacao";

interface PropsInformacoesEvento {
  evento: Evento;
}

/**
 * Recebe (props): o evento.
 * Devolve: um cartão com uma LinhaInformacao para cada dado do evento.
 * Vagas e extras só aparecem quando a API informa esses dados.
 */
export default function InformacoesEvento({ evento }: PropsInformacoesEvento) {
  return (
    <View style={estilosGlobais.cartao}>
      <LinhaInformacao icone="calendar-outline" rotulo="Quando" texto={formatarPeriodoEvento(evento)} />
      <LinhaInformacao icone="location-outline" rotulo="Onde" texto={evento.local} />
      <LinhaInformacao
        icone={evento.modalidade === "Online" ? "globe-outline" : "people-outline"}
        rotulo="Modalidade"
        texto={evento.modalidade}
      />
      <LinhaInformacao icone="business-outline" rotulo="Organização" texto={evento.organizador} />
      {evento.vagas !== null ? (
        <LinhaInformacao icone="ticket-outline" rotulo="Vagas restantes" texto={String(evento.vagas)} />
      ) : null}
      {evento.informacoesExtras.map((extra) => (
        <LinhaInformacao key={extra.rotulo} icone="star-outline" rotulo={extra.rotulo} texto={extra.valor} />
      ))}
    </View>
  );
}
