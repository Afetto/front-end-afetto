import { mensagemDaApi } from "@/api/erros";
import { SeletorTipoCuidado } from "@/components/SeletorTipoCuidado";
import { BotaoEnviar } from "@/components/ui/BotaoEnviar";
import CampoTexto from "@/components/ui/CampoTexto";
import { useAtualizarRemedio, useCriarRemedio, useRemedio } from "@/hooks/useRemedios";
import { DadosRemedio, FormRemedio, FormRemedioSchema } from "@/schemas/remedio.schema";
import { converterDataParaBR, converterDataParaISO } from "@/utils/data";
import { mascararData } from "@/utils/mascaras";
import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// Adicionar ou editar (?remedioId=) um remédio do pet
export default function TelaRemedio() {
  const { id, remedioId } = useLocalSearchParams<{ id: string; remedioId?: string }>();
  const editando = !!remedioId;

  const { data: remedio, isLoading: carregandoRemedio } = useRemedio(remedioId ?? "");
  const { mutate: criarRemedio, isPending: criando } = useCriarRemedio(id);
  const { mutate: atualizarRemedio, isPending: atualizando } = useAtualizarRemedio(id);
  const enviando = criando || atualizando;

  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<FormRemedio>({
    resolver: zodResolver(FormRemedioSchema),
    mode: "onTouched",
    defaultValues: {
      nomeRemedio: "",
      dosagem: "",
      frequencia: "",
      dataInicio: "",
      dataFim: "",
      observacoes: "",
    },
  });

  useEffect(() => {
    if (!remedio) return;
    reset({
      nomeRemedio: remedio.nomeRemedio,
      dosagem: remedio.dosagem ?? "",
      frequencia: remedio.frequencia ?? "",
      dataInicio: converterDataParaBR(remedio.dataInicio),
      dataFim: remedio.dataFim ? converterDataParaBR(remedio.dataFim) : "",
      observacoes: remedio.observacoes ?? "",
    });
  }, [remedio, reset]);

  function aoSalvar(form: FormRemedio) {
    const dados: DadosRemedio = {
      nomeRemedio: form.nomeRemedio,
      dosagem: form.dosagem || undefined,
      frequencia: form.frequencia || undefined,
      dataInicio: converterDataParaISO(form.dataInicio),
      dataFim: form.dataFim ? converterDataParaISO(form.dataFim) : undefined,
      observacoes: form.observacoes || undefined,
      idPet: id,
    };

    const aoConcluir = {
      // `as any`: rota gerada por template literal, fora do que o typedRoutes infere.
      onSuccess: () => router.replace(`/pet/${id}/historico` as any),
      // Mensagem da API quando ela recusa (ex.: fim antes do início) ou de conexão
      onError: (erro: unknown) => setError("root", { message: mensagemDaApi(erro) }),
    };

    if (editando && remedioId) {
      atualizarRemedio({ id: remedioId, dados }, aoConcluir);
    } else {
      criarRemedio(dados, aoConcluir);
    }
  }

  if (editando && carregandoRemedio) {
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
              {editando ? "Editar remédio" : "Adicionar cuidado"}
            </Text>
          </View>

          {!editando && <SeletorTipoCuidado idPet={id} atual="remedio" />}

          <View className="gap-5">
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
