import { FormularioCuidado } from "@/components/cuidados/FormularioCuidado";
import CampoTexto from "@/components/ui/CampoTexto";
import { useFormularioCuidado } from "@/hooks/useFormularioCuidado";
import { useAtualizarRemedio, useCriarRemedio, useRemedio } from "@/hooks/useRemedios";
import { FormRemedioSchema } from "@/schemas/remedio.schema";
import { remedioService } from "@/services/remedio.service";
import { mascararData } from "@/utils/mascaras";
import { zodResolver } from "@hookform/resolvers/zod";
import { router, useLocalSearchParams } from "expo-router";

// Adicionar ou editar (?remedioId=) um remédio do pet
export default function TelaRemedio() {
  const { id, remedioId } = useLocalSearchParams<{ id: string; remedioId?: string }>();

  const remedio = useRemedio(remedioId ?? "");
  const { control, erros, enviar, enviando, editando } = useFormularioCuidado({
    resolver: zodResolver(FormRemedioSchema),
    valoresIniciais: {
      nomeRemedio: "",
      dosagem: "",
      frequencia: "",
      dataInicio: "",
      dataFim: "",
      observacoes: "",
    },
    idEdicao: remedioId,
    item: remedio.data,
    paraFormulario: remedioService.paraFormulario,
    paraDados: (form) => remedioService.doFormulario(form, id),
    criar: useCriarRemedio(id),
    atualizar: useAtualizarRemedio(id),
    aoSalvar: () => router.replace({ pathname: "/pet/[id]/historico", params: { id } }),
  });

  return (
    <FormularioCuidado
      idPet={id}
      tipo="remedio"
      editando={editando}
      tituloEdicao="Editar remédio"
      carregando={remedio.isLoading}
      erroAoCarregar={remedio.isError ? "Não foi possível carregar o remédio." : undefined}
      onTentarNovamente={remedio.refetch}
      erro={erros.root?.message}
      enviando={enviando}
      onEnviar={enviar}
    >
      <CampoTexto
        name="nomeRemedio"
        control={control}
        label="Nome do remédio"
        placeholder="Amoxicilina, Vermífugo..."
        autoCapitalize="words"
      />

      <CampoTexto
        name="dosagem"
        control={control}
        label="Dosagem (opcional)"
        placeholder="1 comprimido, 5 gotas..."
        autoCapitalize="sentences"
      />

      <CampoTexto
        name="frequencia"
        control={control}
        label="Frequência (opcional)"
        placeholder="A cada 12 horas, 1 vez ao dia..."
        autoCapitalize="sentences"
      />

      <CampoTexto
        name="dataInicio"
        control={control}
        label="Início"
        placeholder="DD/MM/AAAA"
        keyboardType="numeric"
        transformarTexto={mascararData}
      />

      <CampoTexto
        name="dataFim"
        control={control}
        label="Fim (opcional — deixe vazio se for de uso contínuo)"
        placeholder="DD/MM/AAAA"
        keyboardType="numeric"
        transformarTexto={mascararData}
      />

      <CampoTexto
        name="observacoes"
        control={control}
        label="Observação (opcional)"
        placeholder="Dar junto com a comida..."
        autoCapitalize="sentences"
      />
    </FormularioCuidado>
  );
}
