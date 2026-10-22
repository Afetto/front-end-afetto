import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { router } from "expo-router";

import TelaCadastroSucesso from "@/app/(auth)/cadastro-sucesso";
import TelaSenhaAlterada from "@/app/(auth)/senha-alterada";

beforeEach(() => {
  jest.clearAllMocks();
});

describe("Rotas modais de sucesso (ModalSucesso)", () => {
  it("'Senha alterada!' leva ao login pelo botão", async () => {
    render(<TelaSenhaAlterada />);

    expect(await screen.findByText("Senha alterada!")).toBeTruthy();
    expect(screen.getByText("Agora é só entrar com a sua senha nova.")).toBeTruthy();

    fireEvent.press(screen.getByText("Ir para o login"));
    expect(router.replace).toHaveBeenCalledWith("/login");
  });

  it("'Conta criada!' leva ao login pelo botão ou sozinho depois de 2,5 s", () => {
    jest.useFakeTimers();
    try {
      render(<TelaCadastroSucesso />);
      expect(screen.getByText("Conta criada!")).toBeTruthy();
      expect(router.replace).not.toHaveBeenCalled();

      act(() => {
        jest.advanceTimersByTime(2500);
      });
      expect(router.replace).toHaveBeenCalledWith("/login");

      fireEvent.press(screen.getByText("Fazer login"));
      expect(router.replace).toHaveBeenCalledTimes(2);
    } finally {
      jest.useRealTimers();
    }
  });
});
