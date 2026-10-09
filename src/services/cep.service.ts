export type EnderecoViaCep = {
  logradouro: string;
  bairro: string;
  cidade: string;
  estado: string;
};

export const cepService = {
  buscarPorCep: async (cep: string): Promise<EnderecoViaCep> => {
    const raw = cep.replace(/\D/g, "");
    const res = await fetch(`https://viacep.com.br/ws/${raw}/json/`);
    const data = await res.json();

    if (data.erro) throw new Error("nao_encontrado");

    return {
      logradouro: data.logradouro ?? "",
      bairro: data.bairro ?? "",
      cidade: data.localidade ?? "",
      estado: data.uf ?? "",
    };
  },
};
