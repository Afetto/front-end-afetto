import { EstadoErro } from "@/components/EstadoErro";
import { SeletorEspecie } from "@/components/SeletorEspecie";
import { TituloSecao } from "@/components/TituloSecao";
import { BotaoEnviar } from "@/components/ui/BotaoEnviar";
import { CampoSelecao } from "@/components/ui/CampoSelecao";
import CampoTexto from "@/components/ui/CampoTexto";
import { useAtualizarPet, usePet, useRemoverPet } from "@/hooks/usePets";
import { FormCadastroPet, FormCadastroPetSchema } from "@/schemas/pet.schema";
import { calcularIdade, converterDataParaBR, converterDataParaISO } from "@/utils/data";
import { mascararData } from "@/utils/mascaras";
import { ICONE_ESPECIE, LABEL_ESPECIE } from "@/utils/pet";
import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

function LinhaInfo({ label, valor }: { label: string; valor: string }) {
  return (
    <View>
      <Text className="text-xs text-muted">{label}</Text>
      <Text className="text-base font-medium text-gray-900 mt-0.5">{valor}</Text>
    </View>
  );
}

export default function TelaDetalhePet() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: pet, isLoading: carregando, isError: temErro, refetch } = usePet(id);
  const { mutate: atualizarPet, isPending: salvando } = useAtualizarPet();
  const { mutate: removerPet, isPending: removendo } = useRemoverPet();

  const [editando, setEditando] = useState(false);

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

  function cancelarEdicao() {
    if (pet) {
      reset({
        nome: pet.nome,
        especie: pet.especie,
        sexo: pet.sexo,
        raca: pet.raca ?? "",
        peso: pet.peso != null ? String(pet.peso) : "",
        dataNasc: pet.dataNasc ? converterDataParaBR(pet.dataNasc) : "",
        descricao: pet.descricao ?? "",
      });
    }
    setEditando(false);
  }

  function aoSalvar(form: FormCadastroPet) {
    if (!id) return;

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
        },
      },
      {
        onSuccess: () => setEditando(false),
        onError: () =>
          setError("root", {
            message: "Erro ao salvar as alterações. Tente novamente.",
          }),
      }
    );
  }

  function aoExcluir() {
    if (!pet) return;

    Alert.alert(
      "Excluir pet",
      `Tem certeza que deseja excluir ${pet.nome}? Esta ação não pode ser desfeita.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: () =>
            removerPet(pet.id, {
              onSuccess: () => router.replace("/(tabs)/pets"),
            }),
        },
      ]
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

  const icone = ICONE_ESPECIE[pet.especie] ?? "🐾";
  const idade = calcularIdade(pet.dataNasc);

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
        <View className="flex-1 px-6 pt-10 pb-10 gap-6">
          {/* Header */}
          <View className="flex-row items-center justify-between gap-3">
            <View className="flex-1 flex-row items-center gap-3">
              <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
                <Ionicons name="chevron-back" size={24} color="#1E3A2F" />
              </TouchableOpacity>
              <Text
                className="flex-1 text-2xl font-bold text-gray-900"
                numberOfLines={1}
              >
                {pet.nome}
              </Text>
            </View>

            {editando ? (
              <TouchableOpacity onPress={cancelarEdicao} hitSlop={8}>
                <Text className="text-sm font-semibold text-muted">Cancelar</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={() => setEditando(true)} hitSlop={8}>
                <Ionicons name="pencil" size={20} color="#1E3A2F" />
              </TouchableOpacity>
            )}
          </View>

          {/* Avatar */}
          <View className="items-center">
            <View className="w-24 h-24 rounded-full items-center justify-center bg-primary">
              <Text className="text-[44px]">{icone}</Text>
            </View>
          </View>

          {editando ? (
            <View className="gap-5">
              <CampoTexto
                name="nome"
                control={control}
                label="Nome"
                autoCapitalize="words"
              />

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

              <CampoTexto
                name="raca"
                control={control}
                label="Raça (opcional)"
                autoCapitalize="words"
              />

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
                <Text className="text-red-500 text-sm text-center">
                  {errors.root.message}
                </Text>
              )}
            </View>
          ) : (
            <View className="gap-6">
              <View className="gap-3">
                <TituloSecao icone="paw-outline" texto="Sobre o pet" />
                <View className="bg-white rounded-2xl p-4 gap-3 shadow-sm">
                  <LinhaInfo
                    label="Espécie"
                    valor={LABEL_ESPECIE[pet.especie] ?? pet.especie}
                  />
                  <LinhaInfo label="Raça" valor={pet.raca || "Não informada"} />
                  <LinhaInfo
                    label="Sexo"
                    valor={
                      pet.sexo === "MACHO"
                        ? "Macho"
                        : pet.sexo === "FEMEA"
                          ? "Fêmea"
                          : "Não informado"
                    }
                  />
                </View>
              </View>

              <View className="gap-3">
                <TituloSecao icone="heart-outline" texto="Saúde" />
                <View className="bg-white rounded-2xl p-4 gap-3 shadow-sm">
                  <LinhaInfo
                    label="Peso"
                    valor={pet.peso != null ? `${pet.peso} kg` : "Não informado"}
                  />
                  <LinhaInfo
                    label="Data de nascimento"
                    valor={pet.dataNasc ? converterDataParaBR(pet.dataNasc) : "Não informada"}
                  />
                  <LinhaInfo label="Idade" valor={idade} />
                </View>
              </View>

              {pet.descricao && (
                <View className="gap-3">
                  <TituloSecao icone="document-text-outline" texto="Descrição" />
                  <View className="bg-white rounded-2xl p-4 shadow-sm">
                    <Text className="text-sm text-gray-700 leading-relaxed">
                      {pet.descricao}
                    </Text>
                  </View>
                </View>
              )}

              <TouchableOpacity
                onPress={aoExcluir}
                disabled={removendo}
                activeOpacity={0.7}
                className="items-center justify-center py-3 rounded-2xl border border-red-500 mt-4"
              >
                {removendo ? (
                  <ActivityIndicator color="#ef4444" />
                ) : (
                  <Text className="text-red-500 font-semibold">Excluir pet</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      {editando && (
        <BotaoEnviar
          enviando={salvando}
          onPress={handleSubmit(aoSalvar)}
          texto="Salvar alterações"
          textoLoading="Salvando..."
        />
      )}
    </KeyboardAvoidingView>
  );
}
