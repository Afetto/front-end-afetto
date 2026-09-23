import { EstadoErro } from "@/components/EstadoErro";
import { AlterarSenhaModal } from "@/components/perfil/AlterarSenhaModal";
import { ContaCard } from "@/components/perfil/ContaCard";
import { DadosPessoaisCard } from "@/components/perfil/DadosPessoaisCard";
import { FormDadosPessoais } from "@/components/perfil/FormDadosPessoais";
import { PerfilHeader } from "@/components/perfil/PerfilHeader";
import { SegurancaCard } from "@/components/perfil/SegurancaCard";
import { BotaoEnviar } from "@/components/ui/BotaoEnviar";
import { ToastSucesso } from "@/components/ui/ToastSucesso";
import { useSessao } from "@/context/SessaoContext";
import { useAlterarSenha } from "@/hooks/perfil/useAlterarSenha";
import { usePerfil } from "@/hooks/perfil/usePerfil";
import { EditarPerfilInput, EditarPerfilSchema } from "@/schemas/editar-perfil.schema";
import { converterDataParaBR } from "@/utils/data";
import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";
import {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

function formatarDataNascimento(dataIso: string | undefined) {
  return dataIso ? converterDataParaBR(dataIso) : "";
}

export default function TelaPerfil() {
  const { sair } = useSessao();

  const {
    usuario,
    carregando,
    temErro,
    refazer,
    nomeExibido,
    inicial,
    salvarPerfil,
    salvando,
  } = usePerfil();

  const {
    mostrarModal,
    senhaAtual,
    novaSenha,
    confirmarSenha,
    erroSenha,
    salvandoSenha,
    setSenhaAtual,
    setNovaSenha,
    setConfirmarSenha,
    abrirModal,
    fecharModal,
    alterarSenha,
  } = useAlterarSenha();

  const [notifWhatsapp, setNotifWhatsapp] = useState(true);
  const [editando, setEditando] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<EditarPerfilInput>({
    resolver: zodResolver(EditarPerfilSchema),
    mode: "onTouched",
    defaultValues: {
      nome: "",
      email: "",
      telefone: "",
      dataNascimento: "",
      senha: "",
    },
  });

  useEffect(() => {
    if (!usuario) return;
    reset({
      nome: usuario.nome,
      email: usuario.email,
      telefone: usuario.telefone,
      dataNascimento: formatarDataNascimento(usuario.dataNascimento),
      senha: "",
    });
  }, [usuario, reset]);

  const toastOpacity = useSharedValue(0);

  const estiloToast = useAnimatedStyle(() => ({
    opacity: toastOpacity.value,
  }));

  const exibirToast = () => {
    toastOpacity.value = withTiming(1, { duration: 200 });
    setTimeout(() => {
      toastOpacity.value = withTiming(0, { duration: 400 });
    }, 2500);
  };

  function cancelarEdicao() {
    if (usuario) {
      reset({
        nome: usuario.nome,
        email: usuario.email,
        telefone: usuario.telefone,
        dataNascimento: formatarDataNascimento(usuario.dataNascimento),
        senha: "",
      });
    }
    setEditando(false);
  }

  function aoSalvar(dados: EditarPerfilInput) {
    salvarPerfil(dados, {
      onSuccess: () => {
        setEditando(false);
        exibirToast();
      },
      onError: (erro) => {
        if (erro instanceof Error && erro.message === "sem_id") {
          setError("root", {
            message: "Não foi possível identificar seu usuário. Tente sair e entrar de novo.",
          });
        } else if (erro && typeof erro === "object" && "error" in erro) {
          const codigo = (erro as { error: string }).error;
          setError("root", {
            message:
              codigo === "email_taken"
                ? "Este e-mail já está em uso."
                : "Erro ao salvar. Tente novamente.",
          });
        } else {
          setError("root", { message: "Erro ao salvar. Tente novamente." });
        }
      },
    });
  }

  const handleAlterarSenha = async () => {
    const sucesso = await alterarSenha();
    if (sucesso) {
      exibirToast();
    }
  };

  const handleSair = () => {
    Alert.alert("Sair da conta", "Tem certeza que deseja sair?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Sair",
        style: "destructive",
        onPress: async () => {
          await sair();
          router.replace("/");
        },
      },
    ]);
  };

  if (carregando) {
    return (
      <View className="flex-1 items-center justify-center bg-surface dark:bg-gray-900">
        <ActivityIndicator color="#E8A838" size="large" />
      </View>
    );
  }

  if (temErro || !usuario) {
    return (
      <EstadoErro
        mensagem="Erro ao carregar seus dados. Tente novamente."
        onTentarNovamente={() => refazer()}
      />
    );
  }

  return (
    <View className="flex-1 bg-surface dark:bg-gray-900">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: editando ? 120 : 48,
          }}
        >
          <PerfilHeader
            nome={nomeExibido}
            inicial={inicial}
            editando={editando}
            onEditar={() => setEditando(true)}
            onCancelar={cancelarEdicao}
          />

          <View className="gap-5 px-5 pb-6 pt-6">
            {editando ? (
              <FormDadosPessoais control={control} cpf={usuario.cpf} />
            ) : (
              <DadosPessoaisCard
                email={usuario.email}
                telefone={usuario.telefone}
                dataNascimento={formatarDataNascimento(usuario.dataNascimento)}
                cpf={usuario.cpf}
              />
            )}

            {errors.root && (
              <Text className="px-1 text-center text-xs text-red-500">
                {errors.root.message}
              </Text>
            )}

            <SegurancaCard
              notifWhatsapp={notifWhatsapp}
              onNotifWhatsappChange={setNotifWhatsapp}
              onAlterarSenha={abrirModal}
            />

            <ContaCard onSair={handleSair} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {editando && (
        <BotaoEnviar
          enviando={salvando}
          onPress={handleSubmit(aoSalvar)}
          texto="Salvar alterações"
          textoLoading="Salvando..."
        />
      )}

      <ToastSucesso estilo={estiloToast} />

      <AlterarSenhaModal
        visible={mostrarModal}
        senhaAtual={senhaAtual}
        novaSenha={novaSenha}
        confirmarSenha={confirmarSenha}
        erro={erroSenha}
        salvando={salvandoSenha}
        onClose={fecharModal}
        onSenhaAtualChange={setSenhaAtual}
        onNovaSenhaChange={setNovaSenha}
        onConfirmarSenhaChange={setConfirmarSenha}
        onConfirmar={handleAlterarSenha}
      />
    </View>
  );
}
