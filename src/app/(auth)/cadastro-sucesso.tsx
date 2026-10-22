import { ModalSucesso } from "@/components/ModalSucesso";
import { router } from "expo-router";
import { Text } from "react-native";

// Só aparece quando a conta foi criada mas o login automático falhou: leva ao login
export default function TelaCadastroSucesso() {
  return (
    <ModalSucesso
      titulo="Conta criada!"
      mensagem={
        <>
          Conta criada com sucesso!{"\n"}
          Agora faça login para entrar no Afe
          <Text className="text-amber font-semibold">tto</Text>.
        </>
      }
      textoBotao="Fazer login"
      onConfirmar={() => router.replace("/login")}
      confirmarSozinhoEm={2500}
    />
  );
}
