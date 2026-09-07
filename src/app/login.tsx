import CampoTexto from "@/components/CampoTexto";
import { LoginInput, LoginSchema } from "@/schemas/login.schema";
import { autenticar } from "@/services/autenticacao.service";
import { useSessao } from "@/context/SessaoContext";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";
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

export default function TelaLogin() {
  const { entrar, entrarComoDevs } = useSessao();

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginInput>({
    defaultValues: { email: "", password: "" },
    resolver: zodResolver(LoginSchema),
    mode: "onTouched",
  });

  // ─── useMutation ─────────────────────────────────────────────────────────
  const { mutate: enviarLogin, isPending: enviando } = useMutation({
    mutationFn: ({ email, password }: LoginInput) =>
      autenticar(email, password),
    onSuccess: async (resultado) => {
      if (!resultado.ok) {
        setError("root", { message: "E-mail ou senha incorretos" });
        return;
      }

      // Persiste sessão via contexto (dados já vieram da API)
      await entrar(
        {
          id: resultado.user.id,
          email: resultado.user.email,
          name: resultado.user.name,
        },
        resultado.token
      );
      router.replace("/(tabs)");
    },
    onError: () => {
      setError("root", { message: "Erro de conexão. Tente novamente." });
    },
  });

  function fazerLogin(data: LoginInput) {
    enviarLogin(data);
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
          <Text className="text-4xl font-bold text-gray-900 leading-tight">
            Entre na sua{"\n"}Conta!
          </Text>

          {/* Campos */}
          <View className="gap-5">
            <CampoTexto
              name="email"
              control={control}
              label="Email"
              placeholder="exemplo@email.com"
              keyboardType="email-address"
              autoComplete="email"
              textContentType="emailAddress"
            />

            <View className="gap-1">
              <CampoTexto
                name="password"
                control={control}
                label="Senha:"
                placeholder="••••••••"
                secureText
                autoComplete="password"
                textContentType="password"
              />

              {/* TODO - criar a tela "/esqueci-senha" e remover o cast */}
              <TouchableOpacity
                onPress={() => router.push("/esqueci-senha" as any)}
                className="self-end mt-1"
              >
                <Text className="text-sm text-gray-700">
                  Esqueci minha senha
                </Text>
              </TouchableOpacity>
            </View>

            {/* Erro geral */}
            {errors.root && (
              <Text className="text-red-500 text-sm text-center">
                {errors.root.message}
              </Text>
            )}
          </View>

          <View className="flex-1" />

          {/* Botão entrar — enviando substitui isSubmitting */}
          <TouchableOpacity
            onPress={handleSubmit(fazerLogin)}
            disabled={enviando}
            activeOpacity={0.85}
            className={`items-center justify-center py-4 rounded-2xl ${
              enviando ? "bg-primary/70" : "bg-primary"
            }`}
          >
            {enviando ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white text-lg font-semibold">Entrar</Text>
            )}
          </TouchableOpacity>

          {__DEV__ && (
            <TouchableOpacity
              onPress={async () => {
                await entrarComoDevs();
                router.replace("/(tabs)");
              }}
              activeOpacity={0.7}
              className="items-center justify-center py-3 rounded-2xl border border-dashed border-muted mt-2"
            >
              <Text className="text-muted text-sm">
                🛠 Entrar como Dev (sem API)
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
