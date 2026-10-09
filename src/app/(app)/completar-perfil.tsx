import { BotaoEnviar } from "@/components/ui/BotaoEnviar";
import { CampoSelecao } from "@/components/ui/CampoSelecao";
import CampoTexto from "@/components/ui/CampoTexto";
import { useBuscarCep } from "@/hooks/useBuscarCep";
import { usePerfilCompleto, useSalvarPerfilCompleto } from "@/hooks/usePerfilCompleto";
import {
    CompletarPerfilInput,
    CompletarPerfilSchema,
} from "@/schemas/completar-perfil.schema";
import { mascararCEP } from "@/utils/mascaras";
import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { useEffect, useRef } from "react";
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
  // O que já foi salvo antes (GET /usuario/me/perfil) preenche o formulário
  const { data: perfilSalvo, isLoading: carregandoPerfil } = usePerfilCompleto();

  const {
    control,
    handleSubmit,
    setValue,
    setError,
    reset,
    formState: { errors },
  } = useForm<CompletarPerfilInput>({
    defaultValues: {
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

  // Preenche uma vez só: um refetch depois não pode apagar o que o tutor está digitando
  const jaPreencheu = useRef(false);
  useEffect(() => {
    if (!perfilSalvo || jaPreencheu.current) return;
    jaPreencheu.current = true;
    if (!perfilSalvo.perfilCompleto) return;

    reset({
      tipoMoradia: perfilSalvo.tipoMoradia,
      telaProtecao: perfilSalvo.telaProtecao,
      quantidadePets: String(Math.max(perfilSalvo.quantidadePets, 1)),
      cep: perfilSalvo.endereco?.cep ?? "",
      logradouro: perfilSalvo.endereco?.logradouro ?? "",
      numero: perfilSalvo.endereco?.numero ?? "",
      complemento: perfilSalvo.endereco?.complemento ?? "",
      bairro: perfilSalvo.endereco?.bairro ?? "",
      cidade: perfilSalvo.endereco?.cidade ?? "",
      estado: perfilSalvo.endereco?.estado ?? "",
    });
  }, [perfilSalvo, reset]);

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

  const { mutate: enviarPerfil, isPending: enviando } = useSalvarPerfilCompleto();

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
        onSuccess: (resultado) => {
          if (!resultado.ok) {
            // Mensagem da API (ex.: "UF inválida: XX") ou de falha de conexão
            setError("root", { message: resultado.mensagem });
            return;
          }
          // A Home já recebe o perfil salvo (o hook atualiza o cache)
          router.back();
        },
        onError: () => {
          setError("root", { message: "Erro de conexão. Tente novamente." });
        },
      }
    );
  }

  if (carregandoPerfil) {
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
        {/* pb-32: espaço para o botão fixo do rodapé não cobrir o último campo */}
        <View className="flex-1 px-6 pt-10 pb-32 gap-8">

          {/* Título */}
          <View className="gap-1">
            <Text className="text-4xl font-bold text-gray-900 dark:text-white leading-tight">
              Complete seu{"\n"}Cadastro!
            </Text>
            <Text className="text-sm text-muted dark:text-gray-400 mt-1">
              Essas informações nos ajudam a personalizar sua experiência.
            </Text>
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
