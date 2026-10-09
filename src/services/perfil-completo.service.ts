import { api } from "@/api/api";
import { mensagemDaApi } from "@/api/erros";

// "Finalize seu cadastro": moradia, tela de proteção, quantidade de pets e
// endereço do tutor logado (GET/PUT /usuario/me/perfil). No app os valores
// seguem o formulário ("casa"/"apartamento", "sim"/"nao"); a API usa
// CASA/APARTAMENTO e true/false — a conversão fica toda aqui.

export type TipoMoradia = "casa" | "apartamento";
export type RespostaSimNao = "sim" | "nao";

export type EnderecoPerfil = {
  cep: string;
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;
};

export type PerfilCompleto = {
  // A API considera completo quando moradia, tela de proteção e endereço foram salvos
  perfilCompleto: boolean;
  tipoMoradia?: TipoMoradia;
  telaProtecao?: RespostaSimNao;
  // O maior entre o que o tutor informou e os pets cadastrados
  quantidadePets: number;
  endereco?: EnderecoPerfil;
};

export type DadosPerfilCompleto = {
  tipoMoradia: TipoMoradia;
  telaProtecao: RespostaSimNao;
  quantidadePets: number;
  endereco: EnderecoPerfil;
};

export type ResultadoPerfilCompleto =
  | { ok: true; perfil: PerfilCompleto }
  | { ok: false; mensagem: string };

type PerfilApi = {
  perfilCompleto: boolean;
  tipoMoradia: "CASA" | "APARTAMENTO" | null;
  telaProtecao: boolean | null;
  quantidadePets: number;
  endereco: (Omit<EnderecoPerfil, "complemento"> & { complemento: string | null }) | null;
};

function mapearPerfil(dados: PerfilApi): PerfilCompleto {
  return {
    perfilCompleto: dados.perfilCompleto,
    tipoMoradia:
      dados.tipoMoradia === "APARTAMENTO" ? "apartamento" : dados.tipoMoradia === "CASA" ? "casa" : undefined,
    telaProtecao: dados.telaProtecao === null ? undefined : dados.telaProtecao ? "sim" : "nao",
    quantidadePets: dados.quantidadePets ?? 0,
    endereco: dados.endereco
      ? { ...dados.endereco, complemento: dados.endereco.complemento || undefined }
      : undefined,
  };
}

export const perfilCompletoService = {
  buscar: async (): Promise<PerfilCompleto> => {
    const response = await api.get<PerfilApi>("/usuario/me/perfil");
    return mapearPerfil(response.data);
  },

  salvar: async (dados: DadosPerfilCompleto): Promise<ResultadoPerfilCompleto> => {
    try {
      const response = await api.put<PerfilApi>("/usuario/me/perfil", {
        tipoMoradia: dados.tipoMoradia === "apartamento" ? "APARTAMENTO" : "CASA",
        telaProtecao: dados.telaProtecao === "sim",
        quantidadePets: dados.quantidadePets,
        endereco: {
          cep: dados.endereco.cep.trim(),
          logradouro: dados.endereco.logradouro.trim(),
          numero: dados.endereco.numero.trim(),
          complemento: dados.endereco.complemento?.trim() || null,
          bairro: dados.endereco.bairro.trim(),
          cidade: dados.endereco.cidade.trim(),
          estado: dados.endereco.estado.trim().toUpperCase(),
        },
      });
      return { ok: true, perfil: mapearPerfil(response.data) };
    } catch (error) {
      return { ok: false, mensagem: mensagemDaApi(error) };
    }
  },
};
