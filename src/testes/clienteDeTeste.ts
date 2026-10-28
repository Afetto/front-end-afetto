import { QueryClient } from "@tanstack/react-query";

/**
 * QueryClient dos testes. Fica fora de `__tests__` porque o Jest trata todo
 * arquivo dessa pasta como teste.
 *
 * - `retry: false`: uma chamada que falha mostra o erro na hora, sem esperar
 *   as 3 tentativas padrão.
 * - `gcTime: Infinity`: o TanStack não agenda a limpeza do cache (5 min por
 *   padrão). Sem isso, o Jest esperava esses timers e não terminava sozinho
 *   ("Jest did not exit").
 */
export function criarClienteDeTeste(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: Infinity },
      mutations: { retry: false, gcTime: Infinity },
    },
  });
}
