import { mensagemPorTipo } from "@/api/erros";
import { BotaoEnviar } from "@/components/ui/BotaoEnviar";
import CampoTexto from "@/components/ui/CampoTexto";
import { TelaFormulario } from "@/components/ui/TelaFormulario";
import { useSessao } from "@/context/SessaoContext";
import { useEntrar } from "@/hooks/useAutenticacao";
import { LoginInput, LoginSchema } from "@/schemas/login.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { useForm } from "react-hook-form";
import { Text, TouchableOpacity, View } from "react-native";

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

  const { mutate: enviarLogin, isPending: enviando } = useEntrar();

  function fazerLogin(data: LoginInput) {
    enviarLogin(data, {
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
  }

  return (
    <TelaFormulario
      titulo={"Entre na sua\nConta!"}
      erro={errors.root?.message}
      rodape={
        <BotaoEnviar
          enviando={enviando}
          onPress={handleSubmit(fazerLogin)}
          texto="Entrar"
          textoLoading="Entrando..."
        />
      }
    >
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

        <View className="gap-1">
          <CampoTexto
            name="password"
            control={control}
            label="Senha"
            placeholder="••••••••"
            campoSenha
            autoComplete="password"
            textContentType="password"
          />

          <TouchableOpacity onPress={() => router.push("/esqueci-senha")} className="self-end mt-1">
            <Text className="text-sm text-gray-700 dark:text-gray-300">Esqueci minha senha</Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity onPress={() => router.push("/cadastro")} activeOpacity={0.7} className="self-center">
        <Text className="text-sm text-gray-700 dark:text-gray-300">
          Ainda não tem conta?{" "}
          <Text className="text-amber-dark dark:text-amber font-semibold">Criar conta</Text>
        </Text>
      </TouchableOpacity>
    </TelaFormulario>
  );
}
