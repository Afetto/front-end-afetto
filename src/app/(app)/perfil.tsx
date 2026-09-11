import { useSessao } from "@/context/SessaoContext";
import { ContaCard } from "@/components/perfil/ContaCard";
import { DadosPessoaisCard } from "@/components/perfil/DadosPessoaisCard";
import { PerfilHeader } from "@/components/perfil/PerfilHeader";
import { AlterarSenhaModal } from "@/components/perfil/AlterarSenhaModal";
import { useAlterarSenha } from "@/hooks/perfil/useAlterarSenha";
import { usePerfil } from "@/hooks/perfil/usePerfil";
import { router } from "expo-router";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
} from "react-native";
import {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { ToastSucesso } from "@/components/ui/ToastSucesso";
import { SegurancaCard } from "@/components/perfil/SegurancaCard";
import { BotaoEnviar } from "@/components/ui/BotaoEnviar";

export default function TelaPerfil() {
  const { sair } = useSessao();

  const {
    nome,
    email,
    telefone,
    cpf,
    inicial,
    setNome,
    setEmail,
    setTelefone,
    temAlteracoes,
    salvando,
    erroSalvar,
    salvarPerfil,
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

  const toastOpacity = useSharedValue(0);

  const estiloToast = useAnimatedStyle(() => ({
    opacity: toastOpacity.value,
  }));

  const exibirToast = () => {
    toastOpacity.value = withTiming(1, {
      duration: 200,
    });

    setTimeout(() => {
      toastOpacity.value = withTiming(0, {
        duration: 400,
      });
    }, 2500);
  };

  const handleSalvarPerfil = async () => {
    const sucesso = await salvarPerfil();

    if (sucesso) {
      exibirToast();
    }
  };

  const handleAlterarSenha = async () => {
    const sucesso = await alterarSenha();

    if (sucesso) {
      exibirToast();
    }
  };

  const handleSair = () => {
    Alert.alert("Sair da conta", "Tem certeza que deseja sair?", [
      {
        text: "Cancelar",
        style: "cancel",
      },
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

  return (
    <View className="flex-1 bg-surface">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: temAlteracoes ? 120 : 48,
          }}
        >
          <PerfilHeader nome={nome} inicial={inicial} />

          <View className="gap-5 px-5 pb-6 pt-6">
            <DadosPessoaisCard
              nome={nome}
              email={email}
              telefone={telefone}
              cpf={cpf}
              erro={erroSalvar}
              onNomeChange={setNome}
              onEmailChange={setEmail}
              onTelefoneChange={setTelefone}
            />

            <SegurancaCard
              notifWhatsapp={notifWhatsapp}
              onNotifWhatsappChange={setNotifWhatsapp}
              onAlterarSenha={abrirModal}
            />

            <ContaCard onSair={handleSair} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {temAlteracoes && (
        <BotaoEnviar
          enviando={salvando}
          onPress={handleSalvarPerfil}
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
