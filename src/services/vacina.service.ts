import { api } from "@/api/api";
import { extrairLista } from "@/api/paginacao";
import { DadosVacina, Vacina } from "@/schemas/vacina.schema";

// ⚠️ CONTORNO DE LACUNA DA API: `GET /vacina?idPet=` já filtra pelo pet no
// servidor, mas a API nunca devolve `id` nem `idPet` como campos diretos, nem
// em VacinaLista (listagem) nem em VacinaResponse (detalhe). O vínculo vem só
// nos links HATEOAS (`linkVacina.href`, `linkPet.href`, ex.: ".../pet/3fa8...").
// Por isso o id da vacina (e o do pet, no detalhe) sai do fim da URL do link.
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
  // GET /vacina?idPet= — só as vacinas deste pet (antes vinha a lista de todos
  // os pets e o app filtrava aqui)
  listarPorPet: async (idPet: string): Promise<Vacina[]> => {
    const response = await api.get("/vacina", { params: { idPet, page: 0, size: 200 } });

    return extrairLista<VacinaListaApi>(response.data).map((item) => ({
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
