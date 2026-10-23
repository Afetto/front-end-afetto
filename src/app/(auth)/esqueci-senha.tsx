import { BotaoEnviar } from "@/components/ui/BotaoEnviar";
import CampoTexto from "@/components/ui/CampoTexto";
import { useRedefinirSenha } from "@/hooks/useAutenticacao";
import { EsqueciSenhaInput, EsqueciSenhaSchema } from "@/schemas/esqueci-senha.schema";
import { mascararCPF, mascararData } from "@/utils/mascaras";
import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { useForm } from "react-hook-form";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// Esqueci a senha sem e-mail de recuperação: o tutor confirma os dados do
// cadastro (e-mail, CPF e nascimento) e já define a senha nova.
export default function TelaEsqueciSenha() {
  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<EsqueciSenhaInput>({
    defaultValues: { email: "", cpf: "", birthDate: "", password: "", confirmPassword: "" },
    resolver: zodResolver(EsqueciSenhaSchema),
    mode: "onTouched",
  });

  const { mutate: enviarRedefinicao, isPending: enviando } = useRedefinirSenha();

  function redefinir(data: EsqueciSenhaInput) {
    enviarRedefinicao(data, {
      onSuccess: (resultado) => {
        if (!resultado.ok) {
          // Mensagem pronta da API: dados que não conferem ou muitas tentativas
          setError("root", { message: resultado.mensagem });
          return;
        }
        // Sucesso: cartão "Senha alterada!" (rota modal), que leva ao login
        router.replace("/senha-alterada");
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
        {/* pb-32: espaço para o botão fixo do rodapé não cobrir o último campo */}
        <View className="flex-1 px-6 pt-10 pb-32 gap-8">
          <TouchableOpacity onPress={() => router.back()} hitSlop={8} className="self-start">
            <Ionicons name="chevron-back" size={24} color="#1E3A2F" />
          </TouchableOpacity>

          <View className="gap-1">
            <Text className="text-4xl font-bold text-gray-900 dark:text-white leading-tight">
              Recuperar{"\n"}senha
            </Text>
            <Text className="text-sm text-muted dark:text-gray-400 mt-1">
              Confirme os dados do seu cadastro e escolha uma senha nova.
            </Text>
          </View>

          <View className="gap-5">
            <CampoTexto
              name="email"
              control={control}
              label="E-mail"
              placeholder="exemplo@email.com"
              keyboardType="email-address"
              autoComplete="email"
              textContentType="emailAddress"
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
              name="birthDate"
              control={control}
              label="Data de nascimento"
              placeholder="DD/MM/AAAA"
              keyboardType="numeric"
              transformarTexto={mascararData}
              iconeDireita={<Ionicons name="calendar-outline" size={18} color="#9E9589" />}
            />

            <CampoTexto
              name="password"
              control={control}
              label="Senha nova"
              placeholder="Mínimo de 6 caracteres"
              campoSenha
              autoComplete="password-new"
              textContentType="newPassword"
            />

            <CampoTexto
              name="confirmPassword"
              control={control}
              label="Confirme a senha nova"
              placeholder="Repita a senha nova"
              campoSenha
              autoComplete="password-new"
              textContentType="newPassword"
            />

            {errors.root && (
              <Text className="text-red-500 text-sm text-center">{errors.root.message}</Text>
            )}
          </View>

          <View className="flex-1" />

          <BotaoEnviar
            enviando={enviando}
            onPress={handleSubmit(redefinir)}
            texto="Redefinir senha"
            textoLoading="Salvando..."
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
