import { useState } from "react";

type EnderecoViaCep = {
  logradouro: string;
  bairro: string;
  cidade: string;
  estado: string;
};

type ResultadoBuscaCep =
  | { ok: true; endereco: EnderecoViaCep }
  | { ok: false; motivo: "nao_encontrado" | "erro" };

/**
 * Busca endereço por CEP na API pública do ViaCEP (não é a API do Afetto —
 * por isso não passa por `src/services/`, só por este hook).
 */
export function useBuscarCep() {
  const [buscando, setBuscando] = useState(false);

  async function buscarCep(cep: string): Promise<ResultadoBuscaCep | null> {
    const raw = cep.replace(/\D/g, "");
    if (raw.length !== 8) return null;

    setBuscando(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${raw}/json/`);
      const data = await res.json();

      if (data.erro) return { ok: false, motivo: "nao_encontrado" };

      return {
        ok: true,
        endereco: {
          logradouro: data.logradouro ?? "",
          bairro: data.bairro ?? "",
          cidade: data.localidade ?? "",
          estado: data.uf ?? "",
        },
      };
    } catch {
      return { ok: false, motivo: "erro" };
    } finally {
      setBuscando(false);
    }
  }

  return { buscando, buscarCep };
}
