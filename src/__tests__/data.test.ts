import { normalizarData } from "@/utils/data";

describe("normalizarData", () => {
  it("lê uma data ISO da API no fuso do aparelho, sem voltar um dia", () => {
    const data = normalizarData("2026-10-08");

    expect(data.getFullYear()).toBe(2026);
    expect(data.getMonth()).toBe(9); // outubro
    expect(data.getDate()).toBe(8);
    expect(data.getHours()).toBe(0);
  });

  it("zera a hora de um Date, mantendo o dia", () => {
    const data = normalizarData(new Date(2026, 9, 8, 20, 45));

    expect(data.getDate()).toBe(8);
    expect(data.getHours()).toBe(0);
    expect(data.getMinutes()).toBe(0);
  });

  it("considera 'amanhã' como 1 dia de distância de hoje", () => {
    const hoje = normalizarData(new Date(2026, 9, 7, 20, 0));
    const amanha = normalizarData("2026-10-08");

    expect(Math.round((amanha.getTime() - hoje.getTime()) / 86_400_000)).toBe(1);
  });
});
