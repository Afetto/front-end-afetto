import { fireEvent, render, screen } from "@testing-library/react-native";

import { ContaCard } from "@/components/perfil/ContaCard";
import { SegurancaCard } from "@/components/perfil/SegurancaCard";
import { SobreAppCard } from "@/components/perfil/SobreAppCard";

// O /perfil só tem ações que funcionam: nada de interruptor ou botão sem efeito
describe("Cards Segurança, Aplicativo e Conta do /perfil", () => {
  it("Segurança: 'Alterar senha' abre o modal, e não há interruptor de WhatsApp sem efeito", async () => {
    const aoAlterarSenha = jest.fn();
    render(<SegurancaCard onAlterarSenha={aoAlterarSenha} />);

    fireEvent.press(await screen.findByText("Alterar senha"));

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

  it("Aplicativo: 'Sobre o App' mostra a versão e abre a tela", async () => {
    const aoAbrir = jest.fn();
    render(<SobreAppCard versao="1.0.0" onAbrir={aoAbrir} />);

    expect(await screen.findByText("v1.0.0")).toBeTruthy();
    fireEvent.press(screen.getByText("Sobre o App"));

    expect(aoAbrir).toHaveBeenCalledTimes(1);
  });
});
