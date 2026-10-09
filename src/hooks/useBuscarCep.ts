import { cepService } from "@/services/cep.service";
import { useQuery } from "@tanstack/react-query";

export function useBuscarCep(cep: string) {
  return useQuery({
    queryKey: ["cep", cep],
    queryFn: () => cepService.buscarPorCep(cep),
    enabled: cep.replace(/\D/g, "").length === 8,
    staleTime: 1000 * 60 * 60,
    retry: false,
  });
}
