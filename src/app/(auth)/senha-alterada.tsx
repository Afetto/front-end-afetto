import { ModalSucesso } from "@/components/ModalSucesso";
import { router } from "expo-router";

// Depois de redefinir a senha em /esqueci-senha (sem login)
export default function TelaSenhaAlterada() {
  return (
    <ModalSucesso
      titulo="Senha alterada!"
      mensagem="Agora é só entrar com a sua senha nova."
      textoBotao="Ir para o login"
      onConfirmar={() => router.replace("/login")}
    />
  );
}
