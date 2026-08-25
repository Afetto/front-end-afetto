import MyInput from "@/components/MyInput";
import { useSession } from "@/context/SessionContext";
import { LoginInput, LoginSchema } from "@/schemas/login.schema";
import { zodResolver } from "@hookform/resolvers/zod";
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
  const { login } = useSession();

  const {
    control,
    handleSubmit,
    setError,
    formState: { isSubmitting },
  } = useForm<LoginInput>({
    defaultValues: { email: "", password: "" },
    resolver: zodResolver(LoginSchema),
    mode: "onTouched",
  });

  async function doLogin({ email, password }: LoginInput) {
    const ok = await login(email, password);

    if (ok) {
      router.replace("/(tabs)");
    } else {
      setError("root", { message: "E-mail ou senha incorretos" });
    }
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

              {/* TODO - Alterar rota de "esquecer senha"  */}
              <TouchableOpacity
                onPress={() => router.push("/forgot-password")}
                className="self-end mt-1"
              >
                <Text className="text-sm text-gray-700">
                  Esqueci minha senha
                </Text>
              </TouchableOpacity>
            </View>

            {/* Erro geral (credenciais inválidas) */}
            {control._formState.errors.root && (
              <Text className="text-red-500 text-sm text-center">
                {control._formState.errors.root.message}
              </Text>
            )}
          </View>

          <View className="flex-1" />

          {/* Botão entrar */}
          <TouchableOpacity
            onPress={handleSubmit(doLogin)}
            disabled={isSubmitting}
            activeOpacity={0.85}
            className={`items-center justify-center py-4 rounded-2xl ${
              isSubmitting ? "bg-primary/70" : "bg-primary"
            }`}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white text-lg font-semibold">Entrar</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
