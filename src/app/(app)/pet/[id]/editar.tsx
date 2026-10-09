import { EstadoErro } from "@/components/EstadoErro";
import { FormPet } from "@/components/FormPet";
import { useSessao } from "@/context/SessaoContext";
import { useAtualizarPet, usePet } from "@/hooks/usePets";
import { FormCadastroPet, FormCadastroPetSchema } from "@/schemas/pet.schema";
import { converterDataParaBR, converterDataParaISO } from "@/utils/data";
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

export default function TelaEditarPet() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { sessao } = useSessao();
  const { data: pet, isLoading: carregando, isError: temErro, refetch } = usePet(id);
  const { mutate: atualizarPet, isPending: salvando } = useAtualizarPet();

  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<FormCadastroPet>({
    resolver: zodResolver(FormCadastroPetSchema),
    mode: "onTouched",
    defaultValues: {
      nome: "",
      especie: undefined,
      sexo: undefined,
      raca: "",
      peso: "",
      dataNasc: "",
      descricao: "",
    },
  });

  useEffect(() => {
    if (!pet) return;
    reset({
      nome: pet.nome,
      especie: pet.especie,
      sexo: pet.sexo,
      raca: pet.raca ?? "",
      peso: pet.peso != null ? String(pet.peso) : "",
      dataNasc: pet.dataNasc ? converterDataParaBR(pet.dataNasc) : "",
      descricao: pet.descricao ?? "",
    });
  }, [pet, reset]);

  function aoSalvar(form: FormCadastroPet) {
    if (!id || !sessao?.id) {
      setError("root", {
        message: "Não foi possível identificar seu usuário. Entre novamente.",
      });
      return;
    }

    atualizarPet(
      {
        id,
        data: {
          nome: form.nome,
          especie: form.especie,
          sexo: form.sexo,
          raca: form.raca?.trim() || "",
          peso: form.peso ? Number(form.peso.replace(",", ".")) : undefined,
          dataNasc: form.dataNasc ? converterDataParaISO(form.dataNasc) : "",
          descricao: form.descricao?.trim() || "",
          idUsuario: sessao.id,
        },
      },
      {
        onSuccess: () => router.back(),
        onError: () =>
          setError("root", {
            message: "Erro ao salvar as alterações. Tente novamente.",
          }),
      }
    );
  }

  if (carregando) {
    return (
      <View className="flex-1 items-center justify-center bg-surface dark:bg-gray-900">
        <ActivityIndicator color="#E8A838" size="large" />
      </View>
    );
  }

  if (temErro || !pet) {
    return (
      <EstadoErro
        mensagem="Erro ao carregar os dados do pet. Tente novamente."
        onTentarNovamente={() => refetch()}
      />
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
        <View className="flex-1 px-6 pt-14 pb-10 gap-6">
          {/* Header */}
          <View className="flex-row items-center gap-3">
            <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
              <Ionicons name="chevron-back" size={24} color="#1E3A2F" />
            </TouchableOpacity>
            <Text className="text-2xl font-bold text-gray-900 dark:text-white">Editar pet</Text>
          </View>

          <FormPet
            control={control}
            errors={errors}
            isPending={salvando}
            textoBotao="Salvar alterações"
            onSubmit={handleSubmit(aoSalvar)}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
