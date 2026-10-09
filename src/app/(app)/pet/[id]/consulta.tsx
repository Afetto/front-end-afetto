import { mensagemDaApi } from "@/api/erros";
import { SeletorTipoCuidado } from "@/components/SeletorTipoCuidado";
import { BotaoEnviar } from "@/components/ui/BotaoEnviar";
import { CampoSelecao } from "@/components/ui/CampoSelecao";
import CampoTexto from "@/components/ui/CampoTexto";
import { useAtualizarConsulta, useConsulta, useCriarConsulta } from "@/hooks/useConsultas";
import {
  DadosConsulta,
  FormConsulta,
  FormConsultaSchema,
  LABEL_TIPO_CONSULTA,
  TIPOS_CONSULTA,
} from "@/schemas/consulta.schema";
import { converterDataParaBR, converterDataParaISO } from "@/utils/data";
import { mascararData, mascararHora } from "@/utils/mascaras";
import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const OPCOES_TIPO = TIPOS_CONSULTA.map((tipo) => ({ label: LABEL_TIPO_CONSULTA[tipo], value: tipo }));

// Registrar ou editar (?consultaId=) uma consulta do pet. Data futura fica
// "agendada"; passada, "realizada" (a API decide pelo dia).
export default function TelaConsulta() {
  const { id, consultaId } = useLocalSearchParams<{ id: string; consultaId?: string }>();
  const editando = !!consultaId;

  const { data: consulta, isLoading: carregandoConsulta } = useConsulta(consultaId ?? "");
  const { mutate: criarConsulta, isPending: criando } = useCriarConsulta(id);
  const { mutate: atualizarConsulta, isPending: atualizando } = useAtualizarConsulta(id);
  const enviando = criando || atualizando;

  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<FormConsulta>({
    resolver: zodResolver(FormConsultaSchema),
    mode: "onTouched",
    defaultValues: {
      tipoEvento: "CONSULTA",
      descricao: "",
      data: "",
      hora: "",
      nomeVeterinario: "",
      observacoes: "",
    },
  });

  useEffect(() => {
    if (!consulta) return;
    reset({
      tipoEvento: consulta.tipoEvento,
      descricao: consulta.descricao,
      data: converterDataParaBR(consulta.data),
      hora: consulta.hora ?? "",
      nomeVeterinario: consulta.nomeVeterinario ?? "",
      observacoes: consulta.observacoes ?? "",
    });
  }, [consulta, reset]);

  function aoSalvar(form: FormConsulta) {
    const dados: DadosConsulta = {
      tipoEvento: form.tipoEvento,
      descricao: form.descricao,
      data: converterDataParaISO(form.data),
      hora: form.hora || undefined,
      nomeVeterinario: form.nomeVeterinario || undefined,
      observacoes: form.observacoes || undefined,
      idPet: id,
    };

    const aoConcluir = {
      // `as any`: rota gerada por template literal, fora do que o typedRoutes infere.
      onSuccess: () => router.replace(`/pet/${id}/historico` as any),
      // Mensagem da API (ex.: horário da clínica já ocupado ao remarcar) ou de conexão
      onError: (erro: unknown) => setError("root", { message: mensagemDaApi(erro) }),
    };

    if (editando && consultaId) {
      atualizarConsulta({ id: consultaId, dados }, aoConcluir);
    } else {
      criarConsulta(dados, aoConcluir);
    }
  }

  if (editando && carregandoConsulta) {
    return (
      <View className="flex-1 items-center justify-center bg-surface dark:bg-gray-900">
        <ActivityIndicator color="#E8A838" size="large" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-surface dark:bg-gray-900"
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1 px-6 pt-14 pb-32 gap-6">
          <View className="flex-row items-center gap-3">
            <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
              <Ionicons name="chevron-back" size={24} color="#1E3A2F" />
            </TouchableOpacity>
            <Text className="text-2xl font-bold text-gray-900 dark:text-white">
              {editando ? "Editar consulta" : "Adicionar cuidado"}
            </Text>
          </View>

          {!editando && <SeletorTipoCuidado idPet={id} atual="consulta" />}

          {consulta?.nomeClinica && (
            <View className="flex-row items-center gap-2 bg-white dark:bg-gray-800 rounded-2xl p-3">
              <Ionicons name="business-outline" size={16} color="#E8A838" />
              <Text className="flex-1 text-sm text-gray-700 dark:text-gray-300">
                Agendada na {consulta.nomeClinica}. Mudar data ou hora só vale para um horário livre da
                clínica.
              </Text>
            </View>
          )}

          <View className="gap-5">
            <Controller
              name="tipoEvento"
              control={control}
              render={({ field: { value, onChange } }) => (
                <CampoSelecao
                  label="Tipo"
                  value={value}
                  onChange={onChange}
                  error={errors.tipoEvento?.message}
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

            {errors.root && (
              <Text className="text-red-500 text-sm text-center">{errors.root.message}</Text>
            )}
          </View>
        </View>
      </ScrollView>

      <BotaoEnviar
        enviando={enviando}
        onPress={handleSubmit(aoSalvar)}
        texto="Salvar"
        textoLoading="Salvando..."
      />
    </KeyboardAvoidingView>
  );
}
