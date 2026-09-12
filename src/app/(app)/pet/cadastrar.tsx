import { SeletorEspecie } from "@/components/SeletorEspecie";
import { CampoSelecao } from "@/components/ui/CampoSelecao";
import CampoTexto from "@/components/ui/CampoTexto";
import { useSessao } from "@/context/SessaoContext";
import { useCriarPet } from "@/hooks/usePets";
import { FormCadastroPet, FormCadastroPetSchema } from "@/schemas/pet.schema";
import { converterDataParaISO } from "@/utils/data";
import { mascararData } from "@/utils/mascaras";
import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
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

export default function TelaCadastrarPet() {
  const { sessao } = useSessao();
  const { mutate: criarPet, isPending: enviando } = useCriarPet();
  const idUsuario = sessao?.id ?? "";

  const {
    control,
    handleSubmit,
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

  function aoEnviar(form: FormCadastroPet) {
    if (!idUsuario) {
      setError("root", {
        message:
          "Não foi possível identificar seu usuário. Verifique a conexão com a API e entre novamente.",
      });
      return;
    }

    criarPet(
      {
        nome: form.nome,
        especie: form.especie,
        sexo: form.sexo,
        raca: form.raca?.trim() || "",
        peso: form.peso ? Number(form.peso.replace(",", ".")) : undefined,
        dataNasc: form.dataNasc ? converterDataParaISO(form.dataNasc) : "",
        descricao: form.descricao?.trim() || "",
        idUsuario,
      },
      {
        onSuccess: () => router.back(),
        onError: () =>
          setError("root", {
            message: "Erro ao cadastrar o pet. Tente novamente.",
          }),
      }
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
        <View className="flex-1 px-6 pt-10 pb-10 gap-6">
          {/* Header */}
          <View className="flex-row items-center gap-3">
            <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
              <Ionicons name="chevron-back" size={24} color="#1E3A2F" />
            </TouchableOpacity>
            <Text className="text-3xl font-bold text-gray-900">Novo pet</Text>
          </View>

          <View className="gap-5">
            <CampoTexto
              name="nome"
              control={control}
              label="Nome"
              placeholder="Rex"
              autoCapitalize="words"
            />

            {/* Espécie */}
            <Controller
              name="especie"
              control={control}
              render={({ field: { value, onChange }, fieldState: { error } }) => (
                <SeletorEspecie value={value} onChange={onChange} error={error?.message} />
              )}
            />

            {/* Sexo */}
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
              placeholder="Vira-lata"
              autoCapitalize="words"
            />

            <View className="flex-row gap-3">
              <View className="flex-1">
                <CampoTexto
                  name="peso"
                  control={control}
                  label="Peso em kg (opcional)"
                  placeholder="12.5"
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
              placeholder="Comportamento, cuidados..."
              autoCapitalize="sentences"
            />
          </View>

          {errors.root && (
            <Text className="text-red-500 text-sm text-center">
              {errors.root.message}
            </Text>
          )}

          <View className="flex-1" />

          <TouchableOpacity
            onPress={handleSubmit(aoEnviar)}
            disabled={enviando}
            activeOpacity={0.85}
            className={`items-center justify-center py-4 rounded-2xl ${
              enviando ? "bg-primary/70" : "bg-primary"
            }`}
          >
            {enviando ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white text-lg font-semibold">
                Cadastrar pet
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
