import { FormularioCuidado } from "@/components/cuidados/FormularioCuidado";
import CampoTexto from "@/components/ui/CampoTexto";
import { useFormularioCuidado } from "@/hooks/useFormularioCuidado";
import { useAtualizarVacina, useCriarVacina, useVacina } from "@/hooks/useVacinas";
import { FormCuidadoSchema } from "@/schemas/vacina.schema";
import { vacinaService } from "@/services/vacina.service";
import { mascararData } from "@/utils/mascaras";
import { zodResolver } from "@hookform/resolvers/zod";
import { router, useLocalSearchParams } from "expo-router";

// Adicionar ou editar (?vacinaId=) uma vacina do pet
export default function TelaCuidados() {
  const { id, vacinaId } = useLocalSearchParams<{ id: string; vacinaId?: string }>();

  const vacina = useVacina(vacinaId ?? "");
  const { control, erros, enviar, enviando, editando } = useFormularioCuidado({
    resolver: zodResolver(FormCuidadoSchema),
    valoresIniciais: {
      nomeVacina: "",
      dataAplicacao: "",
      proximaDose: "",
      fabricante: "",
      lote: "",
      observacoes: "",
    },
    idEdicao: vacinaId,
    item: vacina.data,
    paraFormulario: vacinaService.paraFormulario,
    paraDados: (form) => vacinaService.doFormulario(form, id),
    criar: useCriarVacina(id),
    atualizar: useAtualizarVacina(id),
    aoSalvar: () => router.replace({ pathname: "/pet/[id]/historico", params: { id } }),
  });

  return (
    <FormularioCuidado
      idPet={id}
      tipo="vacina"
      editando={editando}
      tituloEdicao="Editar vacina"
      carregando={vacina.isLoading}
      erroAoCarregar={vacina.isError ? "Não foi possível carregar a vacina." : undefined}
      onTentarNovamente={vacina.refetch}
      erro={erros.root?.message}
      enviando={enviando}
      onEnviar={enviar}
    >
      <CampoTexto
        name="nomeVacina"
        control={control}
        label="Nome da vacina"
        placeholder="V10, Antirrábica..."
        autoCapitalize="words"
      />

      <CampoTexto
        name="dataAplicacao"
        control={control}
        label="Data de aplicação"
        placeholder="DD/MM/AAAA"
        keyboardType="numeric"
        transformarTexto={mascararData}
      />

      <CampoTexto
        name="proximaDose"
        control={control}
        label="Próxima dose (opcional)"
        placeholder="DD/MM/AAAA"
        keyboardType="numeric"
        transformarTexto={mascararData}
      />

      <CampoTexto
        name="fabricante"
        control={control}
        label="Fabricante (opcional)"
        autoCapitalize="words"
      />

      <CampoTexto name="lote" control={control} label="Lote (opcional)" />

      <CampoTexto
        name="observacoes"
        control={control}
        label="Observação (opcional)"
        autoCapitalize="sentences"
      />
    </FormularioCuidado>
  );
}
