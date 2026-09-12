import { api } from "@/api/api";
import { DadosVacina, Vacina } from "@/schemas/vacina.schema";

// ⚠️ CONTORNO DE LACUNA DA API — confirmado lendo o OpenAPI real em
// GET /v3/api-docs: `GET /vacina` só aceita `page`/`size` (sem filtro por
// pet) e nunca devolve `idPet` como campo direto, nem em VacinaLista
// (listagem) nem em VacinaResponse (detalhe). O único vínculo com o pet é
// o link HATEOAS `linkPet.href` (ex.: ".../pet/3fa8...").  Por isso este
// service busca a página de vacinas inteira e extrai o id do pet (e o id
// da própria vacina, via `linkVacina.href`) do fim da URL de cada link.
function idDoLink(href?: string): string {
  if (!href) return "";
  const partes = href.split("/").filter(Boolean);
  return partes[partes.length - 1] ?? "";
}

type LinkApi = { href?: string } | undefined;

type VacinaListaApi = {
  nomeVacina: string;
  dataAplicacao: string;
  proximaDose?: string;
  linkPet?: LinkApi;
  linkVacina?: LinkApi;
};

type VacinaDetalheApi = {
  id: string;
  nomeVacina: string;
  dataAplicacao: string;
  proximaDose?: string;
  fabricante?: string;
  lote?: string;
  observacoes?: string;
  linkPet?: LinkApi;
};

function mapDetalhe(dados: VacinaDetalheApi): Vacina {
  return {
    id: dados.id,
    nomeVacina: dados.nomeVacina,
    dataAplicacao: dados.dataAplicacao,
    proximaDose: dados.proximaDose || undefined,
    fabricante: dados.fabricante || undefined,
    lote: dados.lote || undefined,
    observacoes: dados.observacoes || undefined,
    idPet: idDoLink(dados.linkPet?.href),
  };
}

export const vacinaService = {
  listarPorPet: async (idPet: string): Promise<Vacina[]> => {
    const response = await api.get("/vacina", { params: { page: 0, size: 200 } });
    const itens: VacinaListaApi[] = response.data?.content ?? [];

    return itens
      .filter((item) => idDoLink(item.linkPet?.href) === idPet)
      .map((item) => ({
        id: idDoLink(item.linkVacina?.href),
        nomeVacina: item.nomeVacina,
        dataAplicacao: item.dataAplicacao,
        proximaDose: item.proximaDose || undefined,
        idPet,
      }));
  },

  buscarPorId: async (id: string): Promise<Vacina> => {
    const response = await api.get<VacinaDetalheApi>(`/vacina/${id}`);
    return mapDetalhe(response.data);
  },

  criar: async (dados: DadosVacina): Promise<Vacina> => {
    const response = await api.post<VacinaDetalheApi>("/vacina", dados);
    return mapDetalhe(response.data);
  },

  atualizar: async (id: string, dados: DadosVacina): Promise<Vacina> => {
    const response = await api.put<VacinaDetalheApi>(`/vacina/${id}`, dados);
    return mapDetalhe(response.data);
  },

  remover: async (id: string): Promise<void> => {
    await api.delete(`/vacina/${id}`);
  },
};
