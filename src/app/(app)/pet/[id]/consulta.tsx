import { FormularioCuidado } from "@/components/cuidados/FormularioCuidado";
import { CampoSelecao } from "@/components/ui/CampoSelecao";
import CampoTexto from "@/components/ui/CampoTexto";
import { useAtualizarConsulta, useConsulta, useCriarConsulta } from "@/hooks/useConsultas";
import { useFormularioCuidado } from "@/hooks/useFormularioCuidado";
import {
  FormConsultaSchema,
  LABEL_TIPO_CONSULTA,
  TIPOS_CONSULTA,
} from "@/schemas/consulta.schema";
import { consultaService } from "@/services/consulta.service";
import { mascararData, mascararHora } from "@/utils/mascaras";
import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { router, useLocalSearchParams } from "expo-router";
import { Controller } from "react-hook-form";
import { Text, View } from "react-native";

const OPCOES_TIPO = TIPOS_CONSULTA.map((tipo) => ({ label: LABEL_TIPO_CONSULTA[tipo], value: tipo }));

// Registrar ou editar (?consultaId=) uma consulta do pet. Data futura fica
// "agendada"; passada, "realizada" (a API decide pelo dia).
export default function TelaConsulta() {
  const { id, consultaId } = useLocalSearchParams<{ id: string; consultaId?: string }>();

  const consulta = useConsulta(consultaId ?? "");
  const { control, erros, enviar, enviando, editando } = useFormularioCuidado({
    resolver: zodResolver(FormConsultaSchema),
    valoresIniciais: {
      tipoEvento: "CONSULTA",
      descricao: "",
      data: "",
      hora: "",
      nomeVeterinario: "",
      observacoes: "",
    },
    idEdicao: consultaId,
    item: consulta.data,
    paraFormulario: consultaService.paraFormulario,
    paraDados: (form) => consultaService.doFormulario(form, id),
    criar: useCriarConsulta(id),
    atualizar: useAtualizarConsulta(id),
    aoSalvar: () => router.replace({ pathname: "/pet/[id]/historico", params: { id } }),
  });

  const nomeClinica = consulta.data?.nomeClinica;

  return (
    <FormularioCuidado
      idPet={id}
      tipo="consulta"
      editando={editando}
      tituloEdicao="Editar consulta"
      carregando={consulta.isLoading}
      erroAoCarregar={consulta.isError ? "Não foi possível carregar a consulta." : undefined}
      onTentarNovamente={consulta.refetch}
      erro={erros.root?.message}
      enviando={enviando}
      onEnviar={enviar}
      aviso={
        nomeClinica && (
          <View className="flex-row items-center gap-2 bg-white dark:bg-gray-800 rounded-2xl p-3">
            <Ionicons name="business-outline" size={16} color="#E8A838" />
            <Text className="flex-1 text-sm text-gray-700 dark:text-gray-300">
              Agendada na {nomeClinica}. Mudar data ou hora só vale para um horário livre da
              clínica.
            </Text>
          </View>
        )
      }
    >
      <Controller
        name="tipoEvento"
        control={control}
        render={({ field: { value, onChange } }) => (
          <CampoSelecao
            label="Tipo"
            value={value}
            onChange={onChange}
            error={erros.tipoEvento?.message}
            opcoes={OPCOES_TIPO}
            tresPorLinha
          />
        )}
      />

      <CampoTexto
        name="descricao"
        control={control}
        label="Motivo"
        placeholder="Check-up anual, vacina, retorno..."
        autoCapitalize="sentences"
      />

      <View className="flex-row gap-3">
        <View className="flex-1">
          <CampoTexto
            name="data"
            control={control}
            label="Data"
            placeholder="DD/MM/AAAA"
            keyboardType="numeric"
            transformarTexto={mascararData}
          />
        </View>
        <View className="w-28">
          <CampoTexto
            name="hora"
            control={control}
            label="Hora (opcional)"
            placeholder="HH:MM"
            keyboardType="numeric"
            transformarTexto={mascararHora}
          />
        </View>
      </View>

      <CampoTexto
        name="nomeVeterinario"
        control={control}
        label="Veterinário (opcional)"
        placeholder="Dra. Ana"
        autoCapitalize="words"
      />

      <CampoTexto
        name="observacoes"
        control={control}
        label="Observação (opcional)"
        placeholder="Levar exames anteriores..."
        autoCapitalize="sentences"
      />
    </FormularioCuidado>
  );
}
