/**
 * ARQUIVO: src/componentes/EtiquetaStatus.tsx
 *
 * PARA QUE SERVE?
 * Mostra o status do evento ("Aberto", "Encerrado" ou "Indisponível") com a cor
 * certa: verde, cinza ou vermelho. Os textos e as cores vêm de um único lugar
 * (statusEvento.ts e tema.ts), então mudar ali muda em todas as telas.
 */
import { coresStatus } from "../estilos/tema";
import { StatusEvento } from "../tipos/evento";
import { ROTULOS_STATUS } from "../utilitarios/statusEvento";
import Etiqueta from "./Etiqueta";

interface PropsEtiquetaStatus {
  status: StatusEvento;
}

/**
 * Recebe (props): o status do evento.
 * Devolve: uma Etiqueta com o texto e as cores desse status.
 */
export default function EtiquetaStatus({ status }: PropsEtiquetaStatus) {
  return (
    <Etiqueta
      texto={ROTULOS_STATUS[status]}
      corTexto={coresStatus[status].texto}
      corFundo={coresStatus[status].fundo}
    />
  );
}
