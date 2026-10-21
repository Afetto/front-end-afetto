import { calcularProgressoOnboarding } from "@/utils/onboarding";

describe("calcularProgressoOnboarding", () => {
  it("começa na etapa 1 de 3 quando nada foi concluído", () => {
    const resultado = calcularProgressoOnboarding({
      perfilCompleto: false,
      petCadastrado: false,
      clinicaVinculada: false,
    });

    expect(resultado.checklist.map((item) => item.id)).toEqual(["cadastro", "pet", "clinica"]);
    expect(resultado.checklist.every((item) => !item.concluido)).toBe(true);
    expect(resultado.rotuloEtapa).toBe("Etapa 1 de 3 — Finalize seu cadastro!");
    expect(resultado.percentual).toBeCloseTo(1 / 3);
    expect(resultado.obrigatoriosConcluidos).toBe(false);
  });

  it("marca a etapa do pet como concluída quando a API devolve ao menos um pet", () => {
    const resultado = calcularProgressoOnboarding({
      perfilCompleto: false,
      petCadastrado: true,
      clinicaVinculada: false,
    });

    const etapaPet = resultado.checklist.find((item) => item.id === "pet");
    expect(etapaPet?.concluido).toBe(true);
    expect(resultado.rotuloEtapa).toBe("Etapa 2 de 3 — Finalize seu cadastro!");
    expect(resultado.obrigatoriosConcluidos).toBe(false);
  });

  it("\"Vincular sua clínica\" é opcional e fica por último", () => {
    const { checklist } = calcularProgressoOnboarding({
      perfilCompleto: false,
      petCadastrado: false,
      clinicaVinculada: false,
    });

    const etapaClinica = checklist[checklist.length - 1];
    expect(etapaClinica).toMatchObject({
      id: "clinica",
      titulo: "Vincular sua clínica",
      opcional: true,
      rota: "/(tabs)/clinica",
    });
  });

  it("clínica favorita conta no progresso, mas a barra continua apontando para a etapa obrigatória", () => {
    const resultado = calcularProgressoOnboarding({
      perfilCompleto: false,
      petCadastrado: false,
      clinicaVinculada: true,
    });

    expect(resultado.checklist.find((item) => item.id === "clinica")?.concluido).toBe(true);
    expect(resultado.rotuloEtapa).toBe("Etapa 2 de 3 — Finalize seu cadastro!");
    expect(resultado.obrigatoriosConcluidos).toBe(false);
  });

  it("considera o onboarding concluído com perfil completo e pet cadastrado, mesmo sem clínica", () => {
    const resultado = calcularProgressoOnboarding({
      perfilCompleto: true,
      petCadastrado: true,
      clinicaVinculada: false,
    });

    expect(resultado.obrigatoriosConcluidos).toBe(true);
    expect(resultado.checklist.find((item) => item.id === "clinica")?.concluido).toBe(false);
  });

  it("chega a 100% com as três etapas", () => {
    const resultado = calcularProgressoOnboarding({
      perfilCompleto: true,
      petCadastrado: true,
      clinicaVinculada: true,
    });

    expect(resultado.obrigatoriosConcluidos).toBe(true);
    expect(resultado.percentual).toBe(1);
  });
});
