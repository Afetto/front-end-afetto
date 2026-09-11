import { BotaoEnviar } from "@/components/ui/BotaoEnviar";
import CampoTexto from "@/components/ui/CampoTexto";
import { CadastroInput, CadastroSchema } from "@/schemas/cadastro.schema";
import { cadastrar as servicoCadastrar } from "@/services/autenticacao.service"; // ← alias
import { mascararCelular, mascararCPF, mascararData } from "@/utils/mascaras";
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

export default function TelaCadastro() {
  const [mostrarSucesso, setMostrarSucesso] = useState(false);

  const scale = useSharedValue(0.7);
  const opacity = useSharedValue(0);

  const estiloCartao = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  useEffect(() => {
    if (!mostrarSucesso) return;

    scale.value = withSpring(1, { damping: 14, mass: 0.8 });
    opacity.value = withTiming(1, { duration: 250 });

    const timer = setTimeout(() => {
      setMostrarSucesso(false);
      router.replace("/login");
    }, 2500);

    return () => clearTimeout(timer);
  }, [mostrarSucesso]);

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<CadastroInput>({
    defaultValues: {
      name: "",
      cpf: "",
      email: "",
      phoneCode: "+55",
      phone: "",
      birthDate: "",
      password: "",
    },
    resolver: zodResolver(CadastroSchema),
    mode: "onTouched",
  });

  // ─── useMutation ─────────────────────────────────────────────────────────
  const { mutate: enviarCadastro, isPending: enviando } = useMutation({
    mutationFn: (data: CadastroInput) => servicoCadastrar(data),
    onSuccess: (resultado) => {
      if (!resultado.ok) {
        if (resultado.error === "email_taken") {
          setError("email", { message: "Este e-mail já está cadastrado" });
        } else {
          setError("root", {
            message: "Erro ao criar conta. Tente novamente.",
          });
        }
        return;
      }

      scale.value = 0.7;
      opacity.value = 0;
      setMostrarSucesso(true);
    },
    onError: () => {
      setError("root", { message: "Erro de conexão. Tente novamente." });
    },
  });

  function fazerCadastro(data: CadastroInput) {
    enviarCadastro(data);
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
          <Text className="text-4xl font-bold text-gray-900 leading-tight">
            Crie sua{"\n"}Conta!
          </Text>

          <View className="gap-5">
            <CampoTexto
              name="name"
              control={control}
              label="Nome"
              placeholder="Jack Sullivan"
              autoComplete="name"
              textContentType="name"
              autoCapitalize="words"
            />

            <CampoTexto
              name="cpf"
              control={control}
              label="CPF"
              placeholder="000.000.000-00"
              keyboardType="numeric"
              transformarTexto={mascararCPF}
            />

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
              <Text className="text-sm text-gray-700 font-medium">Celular</Text>
              <View className="flex-row gap-3">
                <View className="w-20">
                  <CampoTexto
                    name="phoneCode"
                    control={control}
                    keyboardType="phone-pad"
                    textContentType="telephoneNumber"
                  />
                </View>
                <View className="flex-1">
                  <CampoTexto
                    name="phone"
                    control={control}
                    placeholder="99999-9999"
                    keyboardType="phone-pad"
                    textContentType="telephoneNumber"
                    transformarTexto={mascararCelular}
                  />
                </View>
              </View>
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

            <CampoTexto
              name="password"
              control={control}
              label="Senha:"
              placeholder="••••••••"
              campoSenha
              autoComplete="password-new"
              textContentType="newPassword"
            />
          </View>

          {errors.root && (
            <Text className="text-red-500 text-sm text-center -mt-4">
              {errors.root.message}
            </Text>
          )}

          <View className="flex-1" />

          
          <BotaoEnviar
            enviando={enviando}
            onPress={handleSubmit(fazerCadastro)}
            texto="Fazer cadastro"
            textoLoading="Criando..."
          />
        </View>
      </ScrollView>

      <Modal
        transparent
        visible={mostrarSucesso}
        animationType="fade"
        statusBarTranslucent
      >
        <View className="flex-1 bg-black/60 items-center justify-center px-8">
          <Animated.View
            style={estiloCartao}
            className="bg-white rounded-3xl p-8 items-center gap-5 w-full"
          >
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
