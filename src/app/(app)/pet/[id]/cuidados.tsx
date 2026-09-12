import { BotaoEnviar } from "@/components/ui/BotaoEnviar";
import CampoTexto from "@/components/ui/CampoTexto";
import { useAtualizarVacina, useCriarVacina, useVacina } from "@/hooks/useVacinas";
import { FormCuidado, FormCuidadoSchema } from "@/schemas/vacina.schema";
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

export default function TelaCuidados() {
  const { id, vacinaId } = useLocalSearchParams<{ id: string; vacinaId?: string }>();
  const editando = !!vacinaId;

  const { data: vacina, isLoading: carregandoVacina } = useVacina(vacinaId ?? "");
  const { mutate: criarVacina, isPending: criando } = useCriarVacina(id);
  const { mutate: atualizarVacina, isPending: atualizando } = useAtualizarVacina(id);
  const enviando = criando || atualizando;

  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<FormCuidado>({
    resolver: zodResolver(FormCuidadoSchema),
    mode: "onTouched",
    defaultValues: {
      nomeVacina: "",
      dataAplicacao: "",
      proximaDose: "",
      fabricante: "",
      lote: "",
      observacoes: "",
    },
  });

  useEffect(() => {
    if (!vacina) return;
    reset({
      nomeVacina: vacina.nomeVacina,
      dataAplicacao: converterDataParaBR(vacina.dataAplicacao),
      proximaDose: vacina.proximaDose ? converterDataParaBR(vacina.proximaDose) : "",
      fabricante: vacina.fabricante ?? "",
      lote: vacina.lote ?? "",
      observacoes: vacina.observacoes ?? "",
    });
  }, [vacina, reset]);

  function aoSalvar(form: FormCuidado) {
    const dados = {
      nomeVacina: form.nomeVacina,
      dataAplicacao: converterDataParaISO(form.dataAplicacao),
      proximaDose: form.proximaDose ? converterDataParaISO(form.proximaDose) : undefined,
      fabricante: form.fabricante?.trim() || undefined,
      lote: form.lote?.trim() || undefined,
      observacoes: form.observacoes?.trim() || undefined,
      idPet: id,
    };

    const aoConcluir = {
      // `as any`: rota gerada por template literal, fora do que o typedRoutes infere.
      onSuccess: () => router.replace(`/pet/${id}/historico` as any),
      onError: () =>
        setError("root", {
          message: "Erro ao salvar o cuidado. Tente novamente.",
        }),
    };

    if (editando && vacinaId) {
      atualizarVacina({ id: vacinaId, data: dados }, aoConcluir);
    } else {
      criarVacina(dados, aoConcluir);
    }
  }

  if (editando && carregandoVacina) {
    return (
      <View className="flex-1 items-center justify-center bg-surface">
        <ActivityIndicator color="#E8A838" size="large" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-surface"
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
            <Text className="text-2xl font-bold text-gray-900">
              {editando ? "Editar cuidado" : "Adicionar cuidado"}
            </Text>
          </View>

          <View className="gap-5">
            <CampoTexto
              name="nomeVacina"
              control={control}
              label="Nome da vacina ou medicamento"
              placeholder="V10, Antipulgas..."
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
