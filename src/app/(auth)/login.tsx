import { mensagemPorTipo } from "@/api/erros";
import { BotaoEnviar } from "@/components/ui/BotaoEnviar";
import CampoTexto from "@/components/ui/CampoTexto";
import { useSessao } from "@/context/SessaoContext";
import { LoginInput, LoginSchema } from "@/schemas/login.schema";
import { autenticar } from "@/services/autenticacao.service";
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
  const { entrar } = useSessao();

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
        setError("root", {
          message:
            resultado.motivo === "credenciais_invalidas"
              ? "E-mail ou senha incorretos"
              : mensagemPorTipo(resultado.motivo),
        });
        return;
      }

      // Login OK — o cookie de sessão já foi salvo automaticamente.
      await entrar({
        id: resultado.usuario.id,
        email: resultado.usuario.email,
        nome: resultado.usuario.nome || resultado.usuario.email,
      });
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
                campoSenha
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

          <BotaoEnviar
            enviando={enviando}
            onPress={handleSubmit(fazerLogin)}
            texto="Entrar"
            textoLoading="Entrando..."
          />
          
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
