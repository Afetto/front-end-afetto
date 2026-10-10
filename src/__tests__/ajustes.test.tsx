import { fireEvent, render, screen } from "@testing-library/react-native";

import { MoradiaEnderecoCard } from "@/components/perfil/MoradiaEnderecoCard";
import { resumirAgenda, rotuloDia } from "@/utils/calendario";

describe("MoradiaEnderecoCard (/perfil)", () => {
  it("mostra moradia, pets e endereço salvos, e o Editar abre o formulário", async () => {
    const aoEditar = jest.fn();
    render(
      <MoradiaEnderecoCard
        carregando={false}
        onEditar={aoEditar}
        perfil={{
          perfilCompleto: true,
          tipoMoradia: "apartamento",
          telaProtecao: "nao",
          quantidadePets: 2,
          endereco: {
            cep: "05422-001", logradouro: "Rua dos Pinheiros", numero: "500", bairro: "Pinheiros",
            cidade: "São Paulo", estado: "SP",
          },
        }}
      />
    );

    // findBy: espera os ícones terminarem de carregar a fonte
    expect(await screen.findByText("Apartamento, sem tela de proteção")).toBeTruthy();
    expect(screen.getByText("2")).toBeTruthy();
    expect(screen.getByText("Rua dos Pinheiros, 500 — Pinheiros, São Paulo/SP · CEP 05422-001")).toBeTruthy();

    fireEvent.press(screen.getByText("Editar"));
    expect(aoEditar).toHaveBeenCalled();
  });

  it("sem o cadastro finalizado, convida a preencher", async () => {
    const aoEditar = jest.fn();
    render(
      <MoradiaEnderecoCard carregando={false} onEditar={aoEditar} perfil={{ perfilCompleto: false, quantidadePets: 0 }} />
    );

    fireEvent.press(await screen.findByText("Preencher agora"));
    expect(aoEditar).toHaveBeenCalled();
  });
});

describe("agenda da Home", () => {
  const HOJE = new Date(2026, 9, 9, 15, 0);

  it("rótulo do dia", () => {
    expect(rotuloDia("2026-10-09", HOJE)).toBe("Hoje");
    expect(rotuloDia("2026-10-10", HOJE)).toBe("Amanhã");
    expect(rotuloDia("2026-10-13", HOJE)).toBe("ter 13/10");
  });

  it("próximos sem remédio, em ordem de data e hora; remédio de hoje uma vez só", () => {
    const evento = (tipo: string, data: string, idReferencia: string, hora?: string) => ({ tipo, data, idReferencia, hora });
    const { proximos, emTratamento } = resumirAgenda(
      [
        evento("PROXIMA_DOSE", "2026-10-12", "v-1"),
        evento("CONSULTA", "2026-10-09", "c-2", "17:00"),
        evento("CONSULTA", "2026-10-09", "c-1", "09:00"),
        evento("REMEDIO", "2026-10-09", "r-1"),
        evento("REMEDIO", "2026-10-10", "r-1"),
      ],
      "2026-10-09"
    );

    expect(proximos.map((item) => item.idReferencia)).toEqual(["c-1", "c-2", "v-1"]);
    expect(emTratamento.map((item) => item.idReferencia)).toEqual(["r-1"]);
  });
});
