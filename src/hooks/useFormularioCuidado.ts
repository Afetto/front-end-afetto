import { mensagemDaApi } from "@/api/erros";
import { useEffect } from "react";
import { DefaultValues, FieldValues, Resolver, useForm } from "react-hook-form";

/*
 * Hook de tela compartilhado pelos formulários de cuidado do pet (vacina,
 * remédio e consulta). As três telas faziam igual: preencher com o cuidado
 * salvo ao editar, decidir entre criar e atualizar, mostrar a mensagem da API
 * no erro e voltar ao histórico no sucesso. Cada tela agora só declara os
 * campos; o que muda entre elas vem nas opções (schema, valores iniciais,
 * conversões do service e as mutations do hook de dados).
 */

type Callbacks = {
  onSuccess: () => void;
  onError: (erro: unknown) => void;
};

// O que o hook usa de um useMutation (useCriarVacina, useAtualizarRemedio...)
type Mutacao<TVariaveis> = {
  mutate: (variaveis: TVariaveis, callbacks: Callbacks) => void;
  isPending: boolean;
};

type Opcoes<TForm extends FieldValues, TItem, TDados> = {
  /** `zodResolver(FormXSchema)` — validação no schema, nunca na tela. */
  resolver: Resolver<TForm>;
  valoresIniciais: DefaultValues<TForm>;
  /** Id do cuidado em edição (`?vacinaId=`...). Sem ele, é um cadastro novo. */
  idEdicao?: string;
  /** O cuidado carregado da API, na edição. */
  item: TItem | undefined;
  /** Conversões do service: API → formulário e formulário → corpo do POST/PUT. */
  paraFormulario: (item: TItem) => TForm;
  paraDados: (form: TForm) => TDados;
  criar: Mutacao<TDados>;
  atualizar: Mutacao<{ id: string; dados: TDados }>;
  /** Depois de salvar (a tela navega — hook não navega). */
  aoSalvar: () => void;
};

export function useFormularioCuidado<TForm extends FieldValues, TItem, TDados>({
  resolver,
  valoresIniciais,
  idEdicao,
  item,
  paraFormulario,
  paraDados,
  criar,
  atualizar,
  aoSalvar,
}: Opcoes<TForm, TItem, TDados>) {
  const formulario = useForm<TForm>({
    resolver,
    mode: "onTouched",
    defaultValues: valoresIniciais,
  });
  const { reset, setError, handleSubmit } = formulario;

  // Edição: preenche com o que está salvo assim que o cuidado chega da API
  useEffect(() => {
    if (item) reset(paraFormulario(item));
  }, [item, reset, paraFormulario]);

  function salvar(form: TForm) {
    const dados = paraDados(form);
    const callbacks: Callbacks = {
      onSuccess: aoSalvar,
      // Mensagem da API (ex.: fim antes do início, horário ocupado) ou de conexão
      onError: (erro) => setError("root", { message: mensagemDaApi(erro) }),
    };

    if (idEdicao) {
      atualizar.mutate({ id: idEdicao, dados }, callbacks);
    } else {
      criar.mutate(dados, callbacks);
    }
  }

  return {
    control: formulario.control,
    erros: formulario.formState.errors,
    enviar: handleSubmit(salvar),
    enviando: criar.isPending || atualizar.isPending,
    editando: !!idEdicao,
  };
}
