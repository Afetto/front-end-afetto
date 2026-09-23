import { BotaoEnviar } from "@/components/ui/BotaoEnviar";
import CampoTexto from "@/components/ui/CampoTexto";
import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { z } from "zod";

const EsqueciSenhaSchema = z.object({
  email: z
    .string()
    .min(1, "E-mail é obrigatório")
    .email("Informe um e-mail válido")
    .toLowerCase()
    .trim(),
});

type EsqueciSenhaInput = z.infer<typeof EsqueciSenhaSchema>;

export default function TelaEsqueciSenha() {
  const [enviado, setEnviado] = useState(false);

  const { control, handleSubmit } = useForm<EsqueciSenhaInput>({
    defaultValues: { email: "" },
    resolver: zodResolver(EsqueciSenhaSchema),
    mode: "onTouched",
  });

  // A API ainda não tem endpoint de recuperação de senha — o formulário só
  // valida o e-mail e mostra um aviso, sem chamar nada.
  function aoEnviar() {
    setEnviado(true);
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
          <TouchableOpacity onPress={() => router.back()} hitSlop={8} className="self-start">
            <Ionicons name="chevron-back" size={24} color="#1E3A2F" />
          </TouchableOpacity>

          <View className="gap-1">
            <Text className="text-4xl font-bold text-gray-900 dark:text-white leading-tight">
              Recuperar{"\n"}senha
            </Text>
            <Text className="text-sm text-muted dark:text-gray-400 mt-1">
              Digite o e-mail da sua conta para receber o link de recuperação.
            </Text>
          </View>

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

            {enviado && (
              <Text className="text-sm text-amber text-center">
                Em breve esta funcionalidade estará disponível.
              </Text>
            )}
          </View>

          <View className="flex-1" />

          <BotaoEnviar
            enviando={false}
            onPress={handleSubmit(aoEnviar)}
            texto="Enviar link"
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
