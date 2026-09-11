import { CadastroInput } from "@/schemas/cadastro.schema";
import { cadastrar } from "@/services/autenticacao.service";
import { useMutation } from "@tanstack/react-query";

// O login usa um `useMutation` inline em `login.tsx` (precisa chamar
// `setError` do react-hook-form e `entrar()` do SessaoContext) e o logout usa
// `sair()` do SessaoContext diretamente em `perfil.tsx` — não há necessidade
// de hooks genéricos para esses dois casos.

// ─── CADASTRO ────────────────────────────────────────────────────────────────

export function useCadastrar() {
    return useMutation({
        mutationFn: (data: CadastroInput) => cadastrar(data),
    });
}
