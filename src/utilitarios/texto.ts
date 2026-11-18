/**
 * ARQUIVO: src/utilitarios/texto.ts
 *
 * PARA QUE SERVE?
 * Funções pequenas para tratar textos. São usadas na busca (comparar textos sem
 * se preocupar com acentos e maiúsculas) e nos conversores das APIs.
 */

/**
 * Deixa o texto em um formato "neutro" para comparação: sem acentos, minúsculo
 * e sem espaços nas pontas.
 *
 * Recebe: um texto qualquer, ex.: "  Semana Acadêmica ".
 * Devolve: o texto normalizado, ex.: "semana academica".
 *
 * Por quê? Assim, quem digitar "academica" na busca também encontra "Acadêmica".
 * Como funciona: normalize("NFD") separa a letra do acento ("ê" vira "e" + "^");
 * depois o replace apaga os acentos que ficaram soltos.
 */
export function normalizarTexto(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

/**
 * Remove tags HTML de um texto.
 *
 * Recebe: um texto como "$<span data-currency-value>500</span>".
 * Devolve: só o texto visível, "$500".
 *
 * Por quê? A API de hackathons manda o prêmio com HTML dentro, e o componente
 * <Text> do React Native mostraria as tags como texto comum.
 */
export function removerTagsHtml(texto: string): string {
  return texto.replace(/<[^>]*>/g, "").trim();
}
