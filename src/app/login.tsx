import MyInput from "@/components/MyInput";
import { LoginInput, LoginSchema } from "@/schemas/login.schema";
import { authenticate } from "@/services/auth.service";
import { useSession } from "@/context/SessionContext";
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

export default function LoginScreen() {
  const { login, loginDev } = useSession();

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
  const { mutate: submitLogin, isPending } = useMutation({
    mutationFn: ({ email, password }: LoginInput) =>
      authenticate(email, password),
    onSuccess: async (result) => {
      if (!result.ok) {
        setError("root", { message: "E-mail ou senha incorretos" });
        return;
      }

      // Persiste sessão via contexto (dados já vieram da API)
      await login(
        {
          id: result.user.id,
          email: result.user.email,
          name: result.user.name,
        },
        result.token
      );
      router.replace("/(tabs)");
    },
    onError: () => {
      setError("root", { message: "Erro de conexão. Tente novamente." });
    },
  });

  function doLogin(data: LoginInput) {
    submitLogin(data);
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
            <MyInput
              name="email"
              control={control}
              label="Email"
              placeholder="exemplo@email.com"
              keyboardType="email-address"
              autoComplete="email"
              textContentType="emailAddress"
            />

            <View className="gap-1">
              <MyInput
                name="password"
                control={control}
                label="Senha:"
                placeholder="••••••••"
                secureText
                autoComplete="password"
                textContentType="password"
              />

              {/* TODO - Alterar rota de "esquecer senha" */}
              <TouchableOpacity
                onPress={() => router.push("/forgot-password")}
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

          {/* Botão entrar — isPending substitui isSubmitting */}
          <TouchableOpacity
            onPress={handleSubmit(doLogin)}
            disabled={isPending}
            activeOpacity={0.85}
            className={`items-center justify-center py-4 rounded-2xl ${
              isPending ? "bg-primary/70" : "bg-primary"
            }`}
          >
            {isPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white text-lg font-semibold">Entrar</Text>
            )}
          </TouchableOpacity>

          {__DEV__ && (
            <TouchableOpacity
              onPress={async () => {
                await loginDev();
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
