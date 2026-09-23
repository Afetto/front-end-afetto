import { BotaoEnviar } from "@/components/ui/BotaoEnviar";
import { CampoSelecao } from "@/components/ui/CampoSelecao";
import CampoTexto from "@/components/ui/CampoTexto";
import { useSessao } from "@/context/SessaoContext";
import { useCompletarPerfil } from "@/hooks/useAutenticacao";
import { useBuscarCep } from "@/hooks/useBuscarCep";
import {
    CompletarPerfilInput,
    CompletarPerfilSchema,
} from "@/schemas/completar-perfil.schema";
import { mascararCEP, mascararData } from "@/utils/mascaras";
import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { useEffect } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    View,
} from "react-native";

export default function TelaCompletarPerfil() {
  const { concluirEtapa } = useSessao();

  const {
    control,
    handleSubmit,
    setValue,
    setError,
    formState: { errors },
  } = useForm<CompletarPerfilInput>({
    defaultValues: {
      birthDate: "",
      tipoMoradia: undefined,
      telaProtecao: undefined,
      quantidadePets: "1",
      cep: "",
      logradouro: "",
      numero: "",
      complemento: "",
      bairro: "",
      cidade: "",
      estado: "",
    },
    resolver: zodResolver(CompletarPerfilSchema),
    mode: "onTouched",
  });

  // ─── Busca CEP — dispara sozinha quando o campo completa 8 dígitos ────────
  const cepDigitado = useWatch({ control, name: "cep" });
  const { data: enderecoCep, isFetching: cepCarregando, isError: cepComErro, error: erroCep } =
    useBuscarCep(cepDigitado);

  useEffect(() => {
    if (!enderecoCep) return;
    setValue("logradouro", enderecoCep.logradouro, { shouldValidate: true });
    setValue("bairro", enderecoCep.bairro, { shouldValidate: true });
    setValue("cidade", enderecoCep.cidade, { shouldValidate: true });
    setValue("estado", enderecoCep.estado, { shouldValidate: true });
  }, [enderecoCep, setValue]);

  useEffect(() => {
    if (!cepComErro) return;
    setError("cep", {
      message:
        erroCep instanceof Error && erroCep.message === "nao_encontrado"
          ? "CEP não encontrado"
          : "Erro ao buscar CEP",
    });
  }, [cepComErro, erroCep, setError]);

  const { mutate: enviarPerfil, isPending: enviando } = useCompletarPerfil();

  function aoEnviar(data: CompletarPerfilInput) {
    enviarPerfil(
      {
        tipoMoradia: data.tipoMoradia,
        telaProtecao: data.telaProtecao,
        quantidadePets: Number(data.quantidadePets),
        endereco: {
          cep: data.cep,
          logradouro: data.logradouro,
          numero: data.numero,
          complemento: data.complemento,
          bairro: data.bairro,
          cidade: data.cidade,
          estado: data.estado,
        },
      },
      {
        onSuccess: async (resultado) => {
          if (!resultado.ok) {
            setError("root", { message: "Erro ao salvar perfil. Tente novamente." });
            return;
          }
          await concluirEtapa("perfilCompleto");
          router.back();
        },
        onError: () => {
          setError("root", { message: "Erro de conexão. Tente novamente." });
        },
      }
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
        <View className="flex-1 px-6 pt-10 pb-10 gap-8">

          {/* Título */}
          <View className="gap-1">
            <Text className="text-4xl font-bold text-gray-900 dark:text-white leading-tight">
              Complete seu{"\n"}Cadastro!
            </Text>
            <Text className="text-sm text-muted dark:text-gray-400 mt-1">
              Essas informações nos ajudam a personalizar sua experiência.
            </Text>
          </View>

          {/* ─── SEÇÃO: Informações pessoais ───────────────────────────── */}
          <View className="gap-4">
            <View className="flex-row items-center gap-2">
              <Ionicons name="person-outline" size={16} color="#E8A838" />
              <Text className="text-sm font-semibold text-primary dark:text-white">
                Informações pessoais
              </Text>
            </View>

            <CampoTexto
              name="birthDate"
              control={control}
              label="Data de nascimento"
              placeholder="DD/MM/AAAA"
              keyboardType="numeric"
              transformarTexto={mascararData}
              iconeDireita={
                <Ionicons name="calendar-outline" size={18} color="#9E9589" />
              }
            />
          </View>

          {/* ─── SEÇÃO: Sobre seu lar ──────────────────────────────────── */}
          <View className="gap-4">
            <View className="flex-row items-center gap-2">
              <Ionicons name="home-outline" size={16} color="#E8A838" />
              <Text className="text-sm font-semibold text-primary dark:text-white">
                Sobre seu lar
              </Text>
            </View>

            {/* Tipo de moradia */}
            <Controller
              name="tipoMoradia"
              control={control}
              render={({ field: { value, onChange } }) => (
                <CampoSelecao
                  label="Tipo de moradia"
                  value={value}
                  onChange={onChange}
                  error={errors.tipoMoradia?.message}
                  opcoes={[
                    { label: "🏠  Casa", value: "casa" },
                    { label: "🏢  Apartamento", value: "apartamento" },
                  ]}
                />
              )}
            />

            {/* Tela de proteção */}
            <Controller
              name="telaProtecao"
              control={control}
              render={({ field: { value, onChange } }) => (
                <CampoSelecao
                  label="Possui tela de proteção?"
                  value={value}
                  onChange={onChange}
                  error={errors.telaProtecao?.message}
                  opcoes={[
                    { label: "✅  Sim", value: "sim" },
                    { label: "❌  Não", value: "nao" },
                  ]}
                />
              )}
            />

            {/* Quantidade de pets */}
            <CampoTexto
              name="quantidadePets"
              control={control}
              label="Quantidade de pets"
              placeholder="1"
              keyboardType="numeric"
              iconeDireita={
                <Ionicons name="paw-outline" size={18} color="#9E9589" />
              }
            />
          </View>

          {/* ─── SEÇÃO: Endereço ───────────────────────────────────────── */}
          <View className="gap-4">
            <View className="flex-row items-center gap-2">
              <Ionicons name="location-outline" size={16} color="#E8A838" />
              <Text className="text-sm font-semibold text-primary dark:text-white">
                Endereço
              </Text>
            </View>

            {/* CEP */}
            <CampoTexto
              name="cep"
              control={control}
              label="CEP"
              placeholder="00000-000"
              keyboardType="numeric"
              transformarTexto={mascararCEP}
              iconeDireita={
                cepCarregando
                  ? <ActivityIndicator size="small" color="#E8A838" />
                  : <Ionicons name="search-outline" size={18} color="#9E9589" />
              }
            />

            {/* Logradouro + Número */}
            <View className="flex-row gap-3">
              <View className="flex-1">
                <CampoTexto
                  name="logradouro"
                  control={control}
                  label="Logradouro"
                  placeholder="Rua, Av..."
                  autoCapitalize="words"
                />
              </View>
              <View className="w-24">
                <CampoTexto
                  name="numero"
                  control={control}
                  label="Número"
                  placeholder="123"
                  keyboardType="numeric"
                />
              </View>
            </View>

            {/* Complemento */}
            <CampoTexto
              name="complemento"
              control={control}
              label="Complemento (opcional)"
              placeholder="Apto, Bloco..."
              autoCapitalize="words"
            />

            {/* Bairro */}
            <CampoTexto
              name="bairro"
              control={control}
              label="Bairro"
              placeholder="Seu bairro"
              autoCapitalize="words"
            />

            {/* Cidade + Estado */}
            <View className="flex-row gap-3">
              <View className="flex-1">
                <CampoTexto
                  name="cidade"
                  control={control}
                  label="Cidade"
                  placeholder="Sua cidade"
                  autoCapitalize="words"
                />
              </View>
              <View className="w-20">
                <CampoTexto
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

          <BotaoEnviar
            enviando={enviando}
            onPress={handleSubmit(aoEnviar)}
            texto="Concluir"
            textoLoading="Salvando..."
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
