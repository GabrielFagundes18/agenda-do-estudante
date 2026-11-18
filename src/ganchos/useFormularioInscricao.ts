/**
 * ARQUIVO: src/ganchos/useFormularioInscricao.ts
 *
 * PARA QUE SERVE?
 * Guarda o que foi digitado no formulário, as mensagens de erro de cada campo
 * e faz o envio (validar + salvar no AsyncStorage).
 *
 * A tela do formulário só desenha os campos. Toda a lógica fica aqui.
 */
import { useState } from "react";
import { Alert } from "react-native";
import { salvarInscricao } from "../servicos/servicoArmazenamento";
import {
  CampoFormulario,
  DadosFormularioInscricao,
  ErrosFormularioInscricao,
  Evento,
  Inscricao,
} from "../tipos/evento";
import {
  formularioEhValido,
  limparDadosFormulario,
  validarCampo,
  validarFormularioInscricao,
} from "../utilitarios/validacoes";

/** Valores iniciais: todos os campos vazios. */
const DADOS_VAZIOS: DadosFormularioInscricao = {
  nome: "",
  email: "",
  matricula: "",
  curso: "",
  observacao: "",
};

/**
 * Recebe: o evento em que a pessoa está se inscrevendo.
 * Devolve: dados, erros, enviando, alterarCampo e enviarInscricao.
 */
export function useFormularioInscricao(evento: Evento) {
  const [dados, setDados] = useState<DadosFormularioInscricao>(DADOS_VAZIOS);
  const [erros, setErros] = useState<ErrosFormularioInscricao>({});
  const [enviando, setEnviando] = useState(false);

  /**
   * Atualiza um campo enquanto a pessoa digita.
   *
   * Recebe: o nome do campo (ex.: "email") e o novo texto.
   *
   * { ...dados, [campo]: valor } cria uma CÓPIA dos dados trocando só o campo
   * informado. No React, não alteramos o estado diretamente: sempre criamos um
   * objeto novo e passamos para o setDados.
   *
   * Se o campo estava com erro, validamos de novo a cada letra, para a mensagem
   * sumir assim que a pessoa corrigir (sem precisar tocar em "Enviar").
   */
  function alterarCampo(campo: CampoFormulario, valor: string) {
    setDados({ ...dados, [campo]: valor });

    if (erros[campo]) {
      const novosErros = { ...erros };
      const mensagem = validarCampo(campo, valor);
      if (mensagem) {
        novosErros[campo] = mensagem;
      } else {
        delete novosErros[campo];
      }
      setErros(novosErros);
    }
  }

  /**
   * Valida tudo e, se estiver certo, salva a inscrição.
   * Devolve: a inscrição salva, ou null se houver erro (a tela decide o que mostrar).
   */
  async function enviarInscricao(): Promise<Inscricao | null> {
    const errosEncontrados = validarFormularioInscricao(dados);
    setErros(errosEncontrados);

    if (!formularioEhValido(errosEncontrados)) {
      return null;
    }

    setEnviando(true);
    try {
      return await salvarInscricao(evento, limparDadosFormulario(dados));
    } catch {
      Alert.alert("Ops!", "Não foi possível salvar sua inscrição. Tente novamente.");
      return null;
    } finally {
      setEnviando(false);
    }
  }

  return { dados, erros, enviando, alterarCampo, enviarInscricao };
}
