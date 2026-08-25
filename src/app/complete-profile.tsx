import MyInput from "@/components/MyInput";
import { SelectField } from "@/components/SelectField";
import { useSession } from "@/context/SessionContext";
import {
  CompleteProfileInput,
  CompleteProfileSchema,
} from "@/schemas/complete.profile.schema";
import { updateUser } from "@/services/auth.service";
import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { maskCEP } from "@/utils/masks";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function CompleteProfileScreen() {
  const { completeStep } = useSession();
  const [cepLoading, setCepLoading] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    setError,
    formState: { errors },
  } = useForm<CompleteProfileInput>({
    defaultValues: {
      birthDate: "",
      tipoMoradia: undefined,
      telaTroteção: undefined,
      quantidadePets: "1",
      cep: "",
      logradouro: "",
      numero: "",
      complemento: "",
      bairro: "",
      cidade: "",
      estado: "",
    },
    resolver: zodResolver(CompleteProfileSchema),
    mode: "onTouched",
  });

  // ─── Busca CEP ───────────────────────────────────────────────────────────
  async function buscarCep(cep: string) {
    const raw = cep.replace(/\D/g, "");
    if (raw.length !== 8) return;

    setCepLoading(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${raw}/json/`);
      const data = await res.json();

      if (data.erro) {
        setError("cep", { message: "CEP não encontrado" });
        return;
      }

      setValue("logradouro", data.logradouro ?? "", { shouldValidate: true });
      setValue("bairro", data.bairro ?? "", { shouldValidate: true });
      setValue("cidade", data.localidade ?? "", { shouldValidate: true });
      setValue("estado", data.uf ?? "", { shouldValidate: true });
    } catch {
      setError("cep", { message: "Erro ao buscar CEP" });
    } finally {
      setCepLoading(false);
    }
  }

  // ─── useMutation ─────────────────────────────────────────────────────────
  const { mutate: submitProfile, isPending } = useMutation({
    mutationFn: (data: CompleteProfileInput) =>
      updateUser("", {
        name: undefined,
        email: undefined,
      }),
    onSuccess: async (result) => {
      if (!result.ok) {
        setError("root", { message: "Erro ao salvar perfil. Tente novamente." });
        return;
      }
      await completeStep("profileCompleted");
      router.back();
    },
    onError: () => {
      setError("root", { message: "Erro de conexão. Tente novamente." });
    },
  });

  function doSubmit(data: CompleteProfileInput) {
    submitProfile(data);
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
        <View className="flex-1 px-6 pt-10 pb-10 gap-8">

          {/* Título */}
          <View className="gap-1">
            <Text className="text-4xl font-bold text-gray-900 leading-tight">
              Complete seu{"\n"}Cadastro!
            </Text>
            <Text className="text-sm text-muted mt-1">
              Essas informações nos ajudam a personalizar sua experiência.
            </Text>
          </View>

          {/* ─── SEÇÃO: Informações pessoais ───────────────────────────── */}
          <View className="gap-4">
            <View className="flex-row items-center gap-2">
              <Ionicons name="person-outline" size={16} color="#E8A838" />
              <Text className="text-sm font-semibold text-primary">
                Informações pessoais
              </Text>
            </View>
          </View>

          {/* ─── SEÇÃO: Sobre seu lar ──────────────────────────────────── */}
          <View className="gap-4">
            <View className="flex-row items-center gap-2">
              <Ionicons name="home-outline" size={16} color="#E8A838" />
              <Text className="text-sm font-semibold text-primary">
                Sobre seu lar
              </Text>
            </View>

            {/* Tipo de moradia */}
            <Controller
              name="tipoMoradia"
              control={control}
              render={({ field: { value, onChange } }) => (
                <SelectField
                  label="Tipo de moradia"
                  value={value}
                  onChange={onChange}
                  error={errors.tipoMoradia?.message}
                  options={[
                    { label: "🏠  Casa", value: "casa" },
                    { label: "🏢  Apartamento", value: "apartamento" },
                  ]}
                />
              )}
            />

            {/* Tela de proteção */}
            <Controller
              name="telaTroteção"
              control={control}
              render={({ field: { value, onChange } }) => (
                <SelectField
                  label="Possui tela de proteção?"
                  value={value}
                  onChange={onChange}
                  error={errors.telaTroteção?.message}
                  options={[
                    { label: "✅  Sim", value: "sim" },
                    { label: "❌  Não", value: "nao" },
                  ]}
                />
              )}
            />

            {/* Quantidade de pets */}
            <MyInput
              name="quantidadePets"
              control={control}
              label="Quantidade de pets"
              placeholder="1"
              keyboardType="numeric"
              rightIcon={
                <Ionicons name="paw-outline" size={18} color="#9E9589" />
              }
            />
          </View>

          {/* ─── SEÇÃO: Endereço ───────────────────────────────────────── */}
          <View className="gap-4">
            <View className="flex-row items-center gap-2">
              <Ionicons name="location-outline" size={16} color="#E8A838" />
              <Text className="text-sm font-semibold text-primary">
                Endereço
              </Text>
            </View>

            {/* CEP */}
            <MyInput
              name="cep"
              control={control}
              label="CEP"
              placeholder="00000-000"
              keyboardType="numeric"
              onChangeTransform={maskCEP}
              rightIcon={
                cepLoading
                  ? <ActivityIndicator size="small" color="#E8A838" />
                  : <Ionicons name="search-outline" size={18} color="#9E9589" />
              }
              onBlur={(value: string) => buscarCep(value)}
            />

            {/* Logradouro + Número */}
            <View className="flex-row gap-3">
              <View className="flex-1">
                <MyInput
                  name="logradouro"
                  control={control}
                  label="Logradouro"
                  placeholder="Rua, Av..."
                  autoCapitalize="words"
                />
              </View>
              <View className="w-24">
                <MyInput
                  name="numero"
                  control={control}
                  label="Número"
                  placeholder="123"
                  keyboardType="numeric"
                />
              </View>
            </View>

            {/* Complemento */}
            <MyInput
              name="complemento"
              control={control}
              label="Complemento (opcional)"
              placeholder="Apto, Bloco..."
              autoCapitalize="words"
            />

            {/* Bairro */}
            <MyInput
              name="bairro"
              control={control}
              label="Bairro"
              placeholder="Seu bairro"
              autoCapitalize="words"
            />

            {/* Cidade + Estado */}
            <View className="flex-row gap-3">
              <View className="flex-1">
                <MyInput
                  name="cidade"
                  control={control}
                  label="Cidade"
                  placeholder="Sua cidade"
                  autoCapitalize="words"
                />
              </View>
              <View className="w-20">
                <MyInput
                  name="estado"
                  control={control}
                  label="UF"
                  placeholder="SP"
                  autoCapitalize="characters"
                  maxLength={2}
                />
              </View>
            </View>
          </View>

          {/* Erro geral */}
          {errors.root && (
            <Text className="text-red-500 text-sm text-center -mt-4">
              {errors.root.message}
            </Text>
          )}

          <View className="flex-1" />

          {/* Botão concluir */}
          <TouchableOpacity
            onPress={handleSubmit(doSubmit)}
            disabled={isPending}
            activeOpacity={0.85}
            className={`items-center justify-center py-4 rounded-2xl mb-10 ${isPending ? "bg-primary/70" : "bg-primary"
              }`}
          >
            {isPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white text-lg font-semibold">Concluir</Text>
            )}
          </TouchableOpacity>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
