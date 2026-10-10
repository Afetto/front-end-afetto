import { fireEvent, render, screen } from "@testing-library/react-native";

import { ContaCard } from "@/components/perfil/ContaCard";
import { SegurancaCard } from "@/components/perfil/SegurancaCard";

// O /perfil só tem ações que funcionam: nada de interruptor ou botão sem efeito
describe("Cards Segurança e Conta do /perfil", () => {
  it("Segurança: 'Alterar senha' abre o modal, e não há interruptor de WhatsApp sem efeito", () => {
    const aoAlterarSenha = jest.fn();
    render(<SegurancaCard onAlterarSenha={aoAlterarSenha} />);

    fireEvent.press(screen.getByText("Alterar senha"));

    expect(aoAlterarSenha).toHaveBeenCalledTimes(1);
    expect(screen.queryByText("Notificações WhatsApp")).toBeNull();
  });

  it("Conta: 'Sair da conta' encerra a sessão, e não há botão de upgrade sem ação", () => {
    const aoSair = jest.fn();
    render(<ContaCard onSair={aoSair} />);

    fireEvent.press(screen.getByText("Sair da conta"));

    expect(aoSair).toHaveBeenCalledTimes(1);
    expect(screen.queryByText(/Upgrade/)).toBeNull();
  });
});
