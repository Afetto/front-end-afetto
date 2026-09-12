import { EstadoErro } from "@/components/EstadoErro";
import { SeletorEspecie } from "@/components/SeletorEspecie";
import { CampoSelecao } from "@/components/ui/CampoSelecao";
import CampoTexto from "@/components/ui/CampoTexto";
import { useSessao } from "@/context/SessaoContext";
import { useAtualizarPet, usePet } from "@/hooks/usePets";
import { FormCadastroPet, FormCadastroPetSchema } from "@/schemas/pet.schema";
import { converterDataParaBR, converterDataParaISO } from "@/utils/data";
import { mascararData } from "@/utils/mascaras";
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
      <View className="flex-1 items-center justify-center bg-surface">
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
      className="flex-1 bg-surface"
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1 px-6 pt-14 pb-10 gap-6">
          {/* Header */}
          <View className="flex-row items-center justify-between">
            <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
              <Ionicons name="close" size={24} color="#1E3A2F" />
            </TouchableOpacity>
            <Text className="text-lg font-bold text-gray-900">Editar pet</Text>
            <TouchableOpacity onPress={handleSubmit(aoSalvar)} disabled={salvando} hitSlop={8}>
              {salvando ? (
                <ActivityIndicator color="#1E3A2F" size="small" />
              ) : (
                <Ionicons name="checkmark" size={24} color="#1E3A2F" />
              )}
            </TouchableOpacity>
          </View>

          <View className="gap-5">
            <CampoTexto name="nome" control={control} label="Nome" autoCapitalize="words" />

            <Controller
              name="especie"
              control={control}
              render={({ field: { value, onChange }, fieldState: { error } }) => (
                <SeletorEspecie value={value} onChange={onChange} error={error?.message} />
              )}
            />

            <Controller
              name="sexo"
              control={control}
              render={({ field: { value, onChange }, fieldState: { error } }) => (
                <CampoSelecao
                  label="Sexo"
                  value={value ?? ""}
                  onChange={onChange}
                  error={error?.message}
                  opcoes={[
                    { label: "Macho", value: "MACHO" },
                    { label: "Fêmea", value: "FEMEA" },
                  ]}
                />
              )}
            />

            <CampoTexto name="raca" control={control} label="Raça (opcional)" autoCapitalize="words" />

            <View className="flex-row gap-3">
              <View className="flex-1">
                <CampoTexto
                  name="peso"
                  control={control}
                  label="Peso em kg (opcional)"
                  keyboardType="decimal-pad"
                />
              </View>
              <View className="flex-1">
                <CampoTexto
                  name="dataNasc"
                  control={control}
                  label="Nascimento (opcional)"
                  placeholder="DD/MM/AAAA"
                  keyboardType="numeric"
                  transformarTexto={mascararData}
                />
              </View>
            </View>

            <CampoTexto
              name="descricao"
              control={control}
              label="Descrição (opcional)"
              autoCapitalize="sentences"
            />

            {errors.root && (
              <Text className="text-red-500 text-sm text-center">{errors.root.message}</Text>
            )}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
