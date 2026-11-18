/**
 * ARQUIVO: src/tipos/respostasApi.ts
 *
 * PARA QUE SERVE?
 * Descreve o formato "cru" do JSON que cada API devolve, exatamente com os nomes
 * de campos que a API usa (em inglês na API de hackathons, em português na acadêmica).
 *
 * Esses tipos são usados SÓ na camada de API e nos conversores. O resto do app
 * trabalha com a interface "Evento" (tipos/evento.ts), que é o formato do nosso app.
 *
 * ATENÇÃO: o TypeScript não confere o JSON que chega da internet. Estes tipos dizem
 * o que ESPERAMOS receber; por isso os conversores ainda conferem os campos
 * importantes antes de usar.
 */

/* ---------- Fonte 1: Open Hackathons API ---------- */

export interface TemaHackathonApi {
  id: number;
  name: string;
}

export interface HackathonApi {
  id: number;
  title: string;
  url: string;
  thumbnail_url: string | null;
  organization_name: string | null;
  isOpen: string; // ex.: "open", "ended", "upcoming"
  submission_period_dates: string; // ex.: "May 15 - Jun 30, 2026"
  displayed_location: string | null; // ex.: "Online" ou "Toronto"
  registrations_count: number | null;
  prizeText: string | null; // vem com HTML, ex.: "$<span data-currency-value>500</span>"
  time_left_to_submission: string | null;
  themes: TemaHackathonApi[] | null;
  source: string | null;
}

export interface RespostaHackathonsApi {
  last_updated: string;
  count: number;
  hackathons: HackathonApi[];
}

/* ---------- Fonte 2: API acadêmica (MockAPI.io ou json-server) ---------- */

/**
 * O "?" depois do nome do campo indica que ele é OPCIONAL: o JSON pode não ter
 * esse campo, e o conversor usa um valor padrão.
 */
export interface EventoAcademicoApi {
  id: string;
  titulo: string;
  tipo: string; // "Palestra", "Oficina", "Semana Acadêmica" ou "Evento Profissional"
  data: string; // início, no formato ISO 8601
  dataFim?: string; // término, no formato ISO 8601
  local: string;
  modalidade: string; // "Presencial" ou "Online"
  link?: string | null;
  imagem?: string | null;
  organizador?: string;
  temas?: string[];
  vagas?: number | null; // vagas restantes; null = sem limite
  situacao?: string; // "disponivel", "esgotado", "cancelado" ou "encerrado"
  descricao?: string;
}
