/**
 * ARQUIVO: src/utilitarios/validacoes.ts
 *
 * PARA QUE SERVE?
 * Regras de validação do formulário de inscrição.
 *
 * PADRÃO USADO: cada função valida UM campo e devolve:
 *  - null   → o valor está correto (não tem erro);
 *  - texto  → a mensagem de erro que aparece embaixo do campo.
 *
 * Por que separar as regras da tela? Porque assim a tela só mostra os erros.
 * As regras podem ser lidas e testadas sem abrir o app.
 */
import { LIMITES_FORMULARIO } from "../constantes/configuracoes";
import { CampoFormulario, DadosFormularioInscricao, ErrosFormularioInscricao } from "../tipos/evento";

/**
 * Expressões regulares (regex) são "moldes" para conferir textos:
 * - REGEX_EMAIL: algo + "@" + algo + "." + pelo menos 2 letras (ex.: ana@uni.br).
 * - REGEX_SO_NUMEROS: do começo (^) ao fim ($), só dígitos (\d), um ou mais (+).
 * - REGEX_SO_LETRAS: letras (inclusive acentuadas, À-ÿ), apóstrofo e espaço.
 */
const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const REGEX_SO_NUMEROS = /^\d+$/;
const REGEX_SO_LETRAS = /^[A-Za-zÀ-ÿ' ]+$/;

/** Lista com o nome de todos os campos, na ordem do formulário. */
const CAMPOS_FORMULARIO: CampoFormulario[] = ["nome", "email", "matricula", "curso", "observacao"];

/**
 * Valida o nome: obrigatório, só letras, tamanho mínimo e nome + sobrenome.
 * Recebe: o nome digitado → Devolve: mensagem de erro ou null.
 */
export function validarNome(nome: string): string | null {
  const texto = nome.trim();

  if (texto === "") {
    return "Informe seu nome completo.";
  }
  if (texto.length < LIMITES_FORMULARIO.nomeMinimo) {
    return `O nome precisa ter pelo menos ${LIMITES_FORMULARIO.nomeMinimo} letras.`;
  }
  if (!REGEX_SO_LETRAS.test(texto)) {
    return "Use apenas letras no nome.";
  }
  const palavras = texto.split(" ").filter((palavra) => palavra !== "");
  if (palavras.length < 2) {
    return "Informe nome e sobrenome.";
  }
  return null;
}

/**
 * Valida o e-mail: obrigatório e com formato válido.
 * Recebe: o e-mail digitado → Devolve: mensagem de erro ou null.
 */
export function validarEmail(email: string): string | null {
  const texto = email.trim();

  if (texto === "") {
    return "Informe seu e-mail.";
  }
  if (!REGEX_EMAIL.test(texto)) {
    return "Digite um e-mail válido, como nome@exemplo.com.";
  }
  return null;
}

/**
 * Valida a matrícula: obrigatória, só números, com tamanho mínimo e máximo.
 * Recebe: a matrícula digitada → Devolve: mensagem de erro ou null.
 */
export function validarMatricula(matricula: string): string | null {
  const texto = matricula.trim();
  const { matriculaMinima, matriculaMaxima } = LIMITES_FORMULARIO;

  if (texto === "") {
    return "Informe sua matrícula.";
  }
  if (!REGEX_SO_NUMEROS.test(texto)) {
    return "A matrícula deve ter apenas números.";
  }
  if (texto.length < matriculaMinima) {
    return `A matrícula precisa ter pelo menos ${matriculaMinima} dígitos.`;
  }
  if (texto.length > matriculaMaxima) {
    return `A matrícula pode ter no máximo ${matriculaMaxima} dígitos.`;
  }
  return null;
}

/**
 * Valida o curso: obrigatório e com tamanho mínimo.
 * Recebe: o curso digitado → Devolve: mensagem de erro ou null.
 */
export function validarCurso(curso: string): string | null {
  const texto = curso.trim();

  if (texto === "") {
    return "Informe seu curso.";
  }
  if (texto.length < LIMITES_FORMULARIO.cursoMinimo) {
    return `O curso precisa ter pelo menos ${LIMITES_FORMULARIO.cursoMinimo} letras.`;
  }
  return null;
}

/**
 * Valida a observação: é OPCIONAL, só tem limite de tamanho.
 * Recebe: a observação digitada → Devolve: mensagem de erro ou null.
 */
export function validarObservacao(observacao: string): string | null {
  if (observacao.trim().length > LIMITES_FORMULARIO.observacaoMaxima) {
    return `A observação pode ter no máximo ${LIMITES_FORMULARIO.observacaoMaxima} caracteres.`;
  }
  return null;
}

/**
 * Escolhe a função de validação certa para o campo informado.
 * Recebe: o nome do campo e o valor digitado → Devolve: mensagem de erro ou null.
 */
export function validarCampo(campo: CampoFormulario, valor: string): string | null {
  switch (campo) {
    case "nome":
      return validarNome(valor);
    case "email":
      return validarEmail(valor);
    case "matricula":
      return validarMatricula(valor);
    case "curso":
      return validarCurso(valor);
    case "observacao":
      return validarObservacao(valor);
  }
}

/**
 * Valida o formulário inteiro de uma vez (usado ao tocar em "Enviar").
 *
 * Recebe: todos os dados do formulário.
 * Devolve: um objeto só com os campos que têm erro.
 * Ex.: { email: "Digite um e-mail válido..." }. Objeto vazio = tudo certo.
 */
export function validarFormularioInscricao(dados: DadosFormularioInscricao): ErrosFormularioInscricao {
  const erros: ErrosFormularioInscricao = {};

  for (const campo of CAMPOS_FORMULARIO) {
    const mensagem = validarCampo(campo, dados[campo]);
    if (mensagem) {
      erros[campo] = mensagem;
    }
  }
  return erros;
}

/**
 * Diz se o formulário pode ser enviado.
 * Recebe: o objeto de erros → Devolve: true se não houver nenhum erro.
 */
export function formularioEhValido(erros: ErrosFormularioInscricao): boolean {
  return Object.keys(erros).length === 0;
}

/**
 * "Limpa" os dados antes de salvar: tira espaços das pontas e deixa o e-mail
 * em minúsculas (ANA@UNI.BR e ana@uni.br são o mesmo e-mail).
 *
 * Recebe: os dados como foram digitados → Devolve: uma CÓPIA limpa dos dados.
 */
export function limparDadosFormulario(dados: DadosFormularioInscricao): DadosFormularioInscricao {
  return {
    nome: dados.nome.trim(),
    email: dados.email.trim().toLowerCase(),
    matricula: dados.matricula.trim(),
    curso: dados.curso.trim(),
    observacao: dados.observacao.trim(),
  };
}
