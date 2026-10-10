import { api } from "@/api/api";
import { extrairLista } from "@/api/paginacao";
import {
  Avaliacao,
  ClinicaDetalhe,
  ClinicaResumo,
  EnderecoClinica,
  Expediente,
  FormAvaliacao,
  Veterinario,
} from "@/schemas/clinica.schema";

// Clínicas parceiras (/clinica), favoritas (/clinica/{id}/favorito) e
// avaliações (/clinica/{id}/avaliacao).
//
// "Perto de você": o app não manda a localização do aparelho (não há
// biblioteca de GPS no projeto). A API usa então as coordenadas do endereço
// salvo em "Finalize seu cadastro"; sem elas, "perto" é estar na mesma cidade.

type Nulavel<T> = { [K in keyof T]?: T[K] | null };

type ClinicaApi = {
  id: string;
  nome: string;
  imagemUrl?: string | null;
  endereco?: Nulavel<EnderecoClinica> | null;
  distanciaKm?: number | null;
  perto: boolean;
  favorita: boolean;
  notaMedia?: number | null;
  totalAvaliacoes: number;
  descricao?: string | null;
  telefone?: string | null;
  email?: string | null;
  site?: string | null;
  veterinarios?: { nome: string; especialidade?: string | null; turno?: Veterinario["turno"] | null }[] | null;
  expediente?: Expediente[] | null;
};

type AvaliacaoApi = {
  id: string;
  nota: number;
  comentario?: string | null;
  autor?: string | null;
  data?: string | null;
  minha: boolean;
};

function semNulos<T extends object>(objeto: Nulavel<T>): T {
  return Object.fromEntries(
    Object.entries(objeto).filter(([, valor]) => valor !== null && valor !== undefined && valor !== "")
  ) as T;
}

function mapearResumo(dados: ClinicaApi): ClinicaResumo {
  return {
    id: dados.id,
    nome: dados.nome,
    imagemUrl: dados.imagemUrl || undefined,
    endereco: dados.endereco ? semNulos<EnderecoClinica>(dados.endereco) : undefined,
    distanciaKm: dados.distanciaKm ?? undefined,
    perto: dados.perto,
    favorita: dados.favorita,
    notaMedia: dados.notaMedia ?? undefined,
    totalAvaliacoes: dados.totalAvaliacoes ?? 0,
  };
}

function mapearDetalhe(dados: ClinicaApi): ClinicaDetalhe {
  return {
    ...mapearResumo(dados),
    descricao: dados.descricao || undefined,
    telefone: dados.telefone || undefined,
    email: dados.email || undefined,
    site: dados.site || undefined,
    veterinarios: (dados.veterinarios ?? []).map((vet) => ({
      nome: vet.nome,
      especialidade: vet.especialidade || undefined,
      turno: vet.turno || undefined,
    })),
    expediente: dados.expediente ?? [],
  };
}

function mapearAvaliacao(dados: AvaliacaoApi): Avaliacao {
  return {
    id: dados.id,
    nota: dados.nota,
    comentario: dados.comentario || undefined,
    autor: dados.autor || "Tutor",
    // A API manda data e hora ("2026-10-09T10:00:00"); o app mostra só o dia
    data: (dados.data ?? "").slice(0, 10),
    minha: dados.minha,
  };
}

export const clinicaService = {
  // Mais perto primeiro; ?nome= busca; ?favoritas=true só as favoritas
  listar: async (filtro: { nome?: string; favoritas?: boolean } = {}): Promise<ClinicaResumo[]> => {
    const params: Record<string, string | number | boolean> = { page: 0, size: 50 };
    if (filtro.nome?.trim()) params.nome = filtro.nome.trim();
    if (filtro.favoritas) params.favoritas = true;

    const response = await api.get("/clinica", { params });
    return extrairLista<ClinicaApi>(response.data).map(mapearResumo);
  },

  buscarPorId: async (id: string): Promise<ClinicaDetalhe> => {
    const response = await api.get<ClinicaApi>(`/clinica/${id}`);
    return mapearDetalhe(response.data);
  },

  favoritar: async (id: string): Promise<void> => {
    await api.put(`/clinica/${id}/favorito`);
  },

  desfavoritar: async (id: string): Promise<void> => {
    await api.delete(`/clinica/${id}/favorito`);
  },

  // Mais recentes primeiro
  listarAvaliacoes: async (idClinica: string): Promise<Avaliacao[]> => {
    const response = await api.get(`/clinica/${idClinica}/avaliacao`, { params: { page: 0, size: 50 } });
    return extrairLista<AvaliacaoApi>(response.data).map(mapearAvaliacao);
  },

  // Avaliar de novo substitui a avaliação anterior do usuário
  avaliar: async (idClinica: string, dados: FormAvaliacao): Promise<Avaliacao> => {
    const response = await api.put<AvaliacaoApi>(`/clinica/${idClinica}/avaliacao`, {
      nota: dados.nota,
      comentario: dados.comentario?.trim() || null,
    });
    return mapearAvaliacao(response.data);
  },

  apagarAvaliacao: async (idClinica: string): Promise<void> => {
    await api.delete(`/clinica/${idClinica}/avaliacao`);
  },
};
