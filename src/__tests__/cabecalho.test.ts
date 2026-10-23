import coresTailwind from "tailwindcss/colors";

import { opcoesCabecalhoNativo } from "@/utils/cabecalho";

const configTailwind = require("../../tailwind.config.js");

// A barra nativa do Stack (seta de voltar) tem que ter a cor do fundo da tela
// nos dois temas — no escuro ela ficava branca
describe("opcoesCabecalhoNativo", () => {
  it("no tema claro usa o creme do bg-surface e ícones escuros", () => {
    const opcoes = opcoesCabecalhoNativo(false);

    expect(opcoes.headerStyle.backgroundColor).toBe(configTailwind.theme.extend.colors.surface);
    expect(opcoes.headerTintColor).toBe(coresTailwind.gray[900]);
    expect(opcoes.headerShadowVisible).toBe(false);
  });

  it("no tema escuro usa o fundo dark:bg-gray-900 e ícones brancos", () => {
    const opcoes = opcoesCabecalhoNativo(true);

    expect(opcoes.headerStyle.backgroundColor).toBe(coresTailwind.gray[900]);
    expect(opcoes.headerTintColor).toBe("#FFFFFF");
  });
});
