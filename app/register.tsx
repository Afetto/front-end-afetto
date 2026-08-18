import MyInput from "@/components/MyInput";
import { RegisterInput, RegisterSchema } from "@/schemas/register.schema";
import { authService } from "@/services/auth.service";
import { maskCPF, maskDate, maskPhone } from "@/utils/masks";
import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

export default function RegisterScreen() {
  const [showSuccess, setShowSuccess] = useState(false);

  const scale = useSharedValue(0.7);
  const opacity = useSharedValue(0);

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  useEffect(() => {
    if (!showSuccess) return;

    scale.value = withSpring(1, { damping: 14, mass: 0.8 });
    opacity.value = withTiming(1, { duration: 250 });

    const timer = setTimeout(() => {
      setShowSuccess(false);
      router.replace("/login");
    }, 2500);

    return () => clearTimeout(timer);
  }, [showSuccess]);

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
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

  // ─── useMutation — substitui o registerUser direto ───────────────────────
  const { mutate: register, isPending } = useMutation({
    mutationFn: (data: RegisterInput) => authService.register(data),
    onSuccess: (result) => {
      if (!result.ok) {
        if (result.error === "email_taken") {
          setError("email", { message: "Este e-mail já está cadastrado" });
        } else {
          setError("root", { message: "Erro ao criar conta. Tente novamente." });
        }
        return;
      }

      // Dispara animação de sucesso — igual ao original
      scale.value = 0.7;
      opacity.value = 0;
      setShowSuccess(true);
    },
    onError: () => {
      setError("root", { message: "Erro de conexão. Tente novamente." });
    },
  });

  function doRegister(data: RegisterInput) {
    register(data);
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

          {/* Erro geral */}
          {errors.root && (
            <Text className="text-red-500 text-sm text-center -mt-4">
              {errors.root.message}
            </Text>
          )}

          <View className="flex-1" />

          {/* Botão criar conta — isPending substitui isSubmitting */}
          <TouchableOpacity
            onPress={handleSubmit(doRegister)}
            disabled={isPending}
            activeOpacity={0.85}
            className={`items-center justify-center py-4 rounded-2xl ${isPending ? "bg-primary/70" : "bg-primary"
              }`}
          >
            {isPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white text-lg font-semibold">
                Criar Conta
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modal de sucesso — inalterado */}
      <Modal
        transparent
        visible={showSuccess}
        animationType="fade"
        statusBarTranslucent
      >
        <View style={styles.overlay}>
          <Animated.View style={[styles.card, cardStyle]}>
            <View className="w-20 h-20 rounded-full bg-green-medium items-center justify-center">
              <Ionicons name="checkmark" size={44} color="#fff" />
            </View>

            <View className="items-center gap-2">
              <Text className="text-2xl font-bold text-primary text-center">
                Conta criada!
              </Text>
              <Text className="text-sm text-muted text-center leading-relaxed">
                Conta criada com sucesso!{"\n"}
                Agora faça login para entrar no Afe
                <Text className="text-amber font-semibold">tto</Text>.
              </Text>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 32,
    alignItems: "center",
    gap: 20,
    width: "100%",
  },
});
