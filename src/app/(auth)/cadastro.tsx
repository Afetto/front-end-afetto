import { BotaoEnviar } from "@/components/ui/BotaoEnviar";
import CampoTexto from "@/components/ui/CampoTexto";
import { useCadastrar } from "@/hooks/useAutenticacao";
import { CadastroInput, CadastroSchema } from "@/schemas/cadastro.schema";
import { mascararCelular, mascararCPF, mascararData } from "@/utils/mascaras";
import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { useForm } from "react-hook-form";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";

export default function TelaCadastro() {
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

  const { mutate: enviarCadastro, isPending: enviando } = useCadastrar();

  function fazerCadastro(data: CadastroInput) {
    enviarCadastro(data, {
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

        router.replace("/cadastro-sucesso");
      },
      onError: () => {
        setError("root", { message: "Erro de conexão. Tente novamente." });
      },
    });
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
          <Text className="text-4xl font-bold text-gray-900 dark:text-white leading-tight">
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
              <Text className="text-sm text-gray-700 dark:text-gray-300 font-medium">Celular</Text>
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
    </KeyboardAvoidingView>
  );
}
