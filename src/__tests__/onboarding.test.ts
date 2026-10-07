import { calcularProgressoOnboarding } from "@/utils/onboarding";

describe("calcularProgressoOnboarding", () => {
  it("começa na etapa 1 de 2 quando nada foi concluído", () => {
    const resultado = calcularProgressoOnboarding({
      perfilCompleto: false,
      petCadastrado: false,
    });

    expect(resultado.checklist.map((item) => item.id)).toEqual(["cadastro", "pet"]);
    expect(resultado.checklist.every((item) => !item.concluido)).toBe(true);
    expect(resultado.rotuloEtapa).toBe("Etapa 1 de 2 — Finalize seu cadastro!");
    expect(resultado.percentual).toBe(0.5);
    expect(resultado.obrigatoriosConcluidos).toBe(false);
  });

  it("marca a etapa do pet como concluída quando a API devolve ao menos um pet", () => {
    const resultado = calcularProgressoOnboarding({
      perfilCompleto: false,
      petCadastrado: true,
    });

    const etapaPet = resultado.checklist.find((item) => item.id === "pet");
    expect(etapaPet?.concluido).toBe(true);
    expect(resultado.rotuloEtapa).toBe("Etapa 2 de 2 — Finalize seu cadastro!");
    expect(resultado.obrigatoriosConcluidos).toBe(false);
  });

  it("considera o onboarding concluído com perfil completo e pet cadastrado", () => {
    const resultado = calcularProgressoOnboarding({
      perfilCompleto: true,
      petCadastrado: true,
    });

    expect(resultado.obrigatoriosConcluidos).toBe(true);
    expect(resultado.percentual).toBe(1);
  });

  it("não inclui a etapa de clínica enquanto o recurso não existe na API", () => {
    const resultado = calcularProgressoOnboarding({
      perfilCompleto: false,
      petCadastrado: false,
    });

    expect(resultado.checklist.some((item) => item.id === "clinica")).toBe(false);
  });
});
