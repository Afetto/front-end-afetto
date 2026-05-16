import { Ionicons } from "@expo/vector-icons";
import MyInput from "@/components/MyInput";
import { RegisterInput, RegisterSchema } from "@/schemas/register.schema";
import { maskCPF, maskDate, maskPhone } from "@/utils/masks";
import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { useSession } from "@/context/SessionContext";
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

export default function RegisterScreen() {
  const { login } = useSession();

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<RegisterInput>({
    defaultValues: {
      name: "",
      cpf: "",
      email: "",
      phoneCode: "+55",
      phone: "",
      birthDate: "",
      password: "",
    },
    resolver: zodResolver(RegisterSchema),
    mode: "onTouched",
  });

  async function doRegister(data: RegisterInput) {
    // TODO: substituir pela chamada real à API
    await login(data.email, data.password, data.name);
    router.push("/register-success");
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
              Crie sua{"\n"}Conta!
            </Text>

            {/* Campos */}
            <View className="gap-5">
              <MyInput
                name="name"
                control={control}
                label="Nome"
                placeholder="Jack Sullivan"
                autoComplete="name"
                textContentType="name"
                autoCapitalize="words"
              />

              <MyInput
                name="cpf"
                control={control}
                label="CPF"
                placeholder="000.000.000-00"
                keyboardType="numeric"
                onChangeTransform={maskCPF}
              />

              <MyInput
                name="email"
                control={control}
                label="Email"
                placeholder="exemplo@email.com"
                keyboardType="email-address"
                autoComplete="email"
                textContentType="emailAddress"
              />

              {/* Celular — código + número lado a lado */}
              <View className="gap-1">
                <Text className="text-sm text-gray-700 font-medium">Celular</Text>
                <View className="flex-row gap-3">
                  <View className="w-20">
                    <MyInput
                      name="phoneCode"
                      control={control}
                      keyboardType="phone-pad"
                      textContentType="telephoneNumber"
                    />
                  </View>
                  <View className="flex-1">
                    <MyInput
                      name="phone"
                      control={control}
                      placeholder="99999-9999"
                      keyboardType="phone-pad"
                      textContentType="telephoneNumber"
                      onChangeTransform={maskPhone}
                    />
                  </View>
                </View>
              </View>

              <MyInput
                name="birthDate"
                control={control}
                label="Data de nascimento"
                placeholder="DD/MM/AAAA"
                keyboardType="numeric"
                onChangeTransform={maskDate}
                rightIcon={
                  <Ionicons name="calendar-outline" size={18} color="#9E9589" />
                }
              />

              <MyInput
                name="password"
                control={control}
                label="Senha:"
                placeholder="••••••••"
                secureText
                autoComplete="password-new"
                textContentType="newPassword"
              />
            </View>

            <View className="flex-1" />

            {/* Botão criar conta */}
            <TouchableOpacity
              onPress={handleSubmit(doRegister)}
              disabled={isSubmitting}
              activeOpacity={0.85}
              className={`items-center justify-center py-4 rounded-2xl ${
                isSubmitting ? "bg-primary/70" : "bg-primary"
              }`}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white text-lg font-semibold">
                  Criar Conta
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
  );
}
