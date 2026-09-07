# Afetto — Regras para o Claude Code

Você é um desenvolvedor Sênior de React Native trabalhando no app **Afetto** — uma plataforma de saúde contínua para pets, desenvolvida com Expo e TypeScript.

Siga estas regras estritamente ao gerar qualquer código.

---

## 🛠 Tech Stack

| Tecnologia | Uso |
|---|---|
| React Native + Expo | Framework mobile |
| Expo Router | Navegação baseada em arquivos (`src/app/`) |
| NativeWind (Tailwind CSS) | Estilização via `className` |
| React Hook Form + Zod | Formulários e validação (`src/schemas/`) |
| TanStack React Query | Gerenciamento de estado assíncrono |
| Axios | Cliente HTTP (`src/api/api.ts`) |
| Context API | Autenticação e sessão (`src/context/SessaoContext.tsx`) |
| AsyncStorage | Persistência local da sessão |

---

## 📂 Estrutura de Pastas

```
src/
├── api/
│   ├── api.ts          ← instância do Axios com baseURL e interceptors
│   └── queryClient.ts  ← QueryClient do TanStack Query
├── app/
│   ├── _layout.tsx           ← raiz: QueryClientProvider + SessaoProvider + Stack
│   ├── index.tsx             ← guard de rotas (redireciona para login ou tabs)
│   ├── login.tsx
│   ├── cadastro.tsx
│   ├── completar-perfil.tsx
│   ├── cadastro-sucesso.tsx
│   ├── perfil.tsx
│   └── (tabs)/
│       ├── _layout.tsx ← tabs: Home, Pets, Assistente, Clínica
│       ├── index.tsx   ← Home
│       ├── pets.tsx
│       ├── clinica.tsx
│       └── assistente.tsx
├── components/
│   ├── CampoTexto.tsx           ← input padrão com react-hook-form
│   ├── CampoSelecao.tsx         ← seletor de opções em botões
│   ├── RotaProtegida.tsx        ← guard de rotas privadas
│   ├── PetsVazio.tsx            ← estado vazio da lista de pets
│   └── CirculosConcentricos.tsx ← decoração da tela de onboarding
├── context/
│   └── SessaoContext.tsx  ← sessão, entrar, sair, concluirEtapa
├── hooks/
│   ├── usePets.ts          ← useQuery + useMutation para pets
│   ├── useClinicas.ts      ← useQuery + useMutation para clínicas
│   └── useAutenticacao.ts  ← useMutation para entrar, cadastrar, sair
├── schemas/
│   ├── login.schema.ts
│   ├── cadastro.schema.ts
│   ├── completar-perfil.schema.ts
│   ├── pet.schema.ts
│   ├── clinica.schema.ts
│   └── usuario.schema.ts
├── services/
│   ├── autenticacao.service.ts ← cadastrar, autenticar, sair, atualizarUsuario
│   ├── pet.service.ts          ← getAll, getById, create, update, delete
│   └── clinica.service.ts      ← getAll, vincular, desvincular
├── types/
│   └── autenticacao.types.ts   ← tipos globais de autenticação
└── global.css                  ← Tailwind base/components/utilities
```

---

## 🎨 Identidade Visual

```
Verde escuro:  #1F3B30 / #2D4A3E  → bg-primary, headers, botões principais
Âmbar:         #E8A838             → text-amber, destaques, barra de progresso
Creme:         #F5F0E8             → bg-surface, fundo geral
Verde médio:   #A8C5A0             → bg-green-medium, itens concluídos
Cinza suave:   #9E9589             → text-muted, textos secundários
```

**Tipografia:**
- Títulos: `Fraunces` (serif)
- Interface: `DM Sans`

---

## 📋 Regras de Geração de Código

### 1. Antes de qualquer coisa
Leia os arquivos existentes do projeto antes de escrever código. Identifique padrões de componentes, hooks e estilos já usados. Nunca duplique código existente.

### 2. Estilização
- Use **sempre** `className` com classes NativeWind
- Nunca use `StyleSheet.create` — só em último caso para o que o Tailwind não suporta
- Nunca hardcode cores — use as classes definidas no `tailwind.config.js`
- Use as cores do projeto: `bg-primary`, `bg-surface`, `text-amber`, `text-muted`, etc.

### 3. Formulários
- Sempre use `useForm` + `zodResolver` para telas com inputs
- O schema Zod fica em `src/schemas/nome.schema.ts`
- Use o componente `CampoTexto` para campos de texto
- Use o componente `CampoSelecao` para seleções em botões
- Estados de loading: use `isPending` do `useMutation`, nunca `isSubmitting`

### 4. Consumo de dados
- **Nunca** faça fetch diretamente na tela
- Para leitura: use `useQuery` via hooks customizados (`usePets`, `useClinicas`)
- Para escrita: use `useMutation` via hooks customizados
- Sempre trate `isLoading` e `isError` nas telas com dados da API
- `queryClient.invalidateQueries` sempre via `useQueryClient()` hook — nunca import direto

### 5. Arquitetura de hooks
```ts
// CORRETO — invalidação via hook
export function useCreatePet() {
  const queryClient = useQueryClient(); // ← hook
  return useMutation({
    mutationFn: (data) => petService.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["pets"] }),
  });
}

// ERRADO — import direto
import { queryClient } from "@/api/queryClient"; // ← nunca nos hooks
```

### 6. Navegação
- Use `router.push`, `router.replace`, `router.back` do `expo-router`
- Rotas das tabs: `/(tabs)`, `/(tabs)/clinica` etc.
- Rotas fora das tabs: `/completar-perfil`, `/cadastro`, `/perfil`, `/login` etc.

### 7. Proteção de rotas
- Telas privadas devem usar `<RotaProtegida>` ou verificar `useSessao()`
- O `index.tsx` raiz redireciona baseado no estado da sessão
- A aba Pets só aparece nas tabs após `sessao.progresso.petCadastrado === true`

### 8. Imports com conflito de nome
Quando uma função do service tiver o mesmo nome do `mutate`, use alias:
```ts
import { cadastrar as servicoCadastrar } from "@/services/autenticacao.service";
const { mutate: enviarCadastro } = useMutation({
  mutationFn: (data) => servicoCadastrar(data),
});
```

### 9. Convenção de nomes de arquivos
```
autenticacao.service.ts  ← serviços HTTP
autenticacao.types.ts    ← tipos TypeScript
login.schema.ts          ← schemas Zod
usePets.ts               ← hooks TanStack Query
RotaProtegida.tsx        ← componentes (PascalCase)
```

---

## 🔄 Fluxo de Onboarding

```
Login/Cadastro
  └── Home (checklist)
        ├── /completar-perfil  → perfilCompleto: true
        ├── /(tabs)/pets       → petCadastrado: true
        └── /(tabs)/clinica    → clinicaVinculada: true   (opcional)

Após petCadastrado: true
  └── Aba "Pets" aparece nas tabs
  └── Botão "Seus Pets" aparece na Home
```

---

## ✅ Checklist antes de entregar código

- [ ] Leu os arquivos existentes antes de escrever?
- [ ] Usou `className` NativeWind em vez de `StyleSheet`?
- [ ] Usou cores via classes Tailwind (não hardcoded)?
- [ ] Formulários com `useForm` + `zodResolver`?
- [ ] Dados via hooks (`usePets`, `useClinicas`) e não fetch direto?
- [ ] `isPending` em vez de `isSubmitting`?
- [ ] `useQueryClient()` em vez de import direto?
- [ ] Tipagem TypeScript completa?
- [ ] Não duplicou componentes existentes?
- [ ] Tratou `isLoading` e `isError` nas telas com API?

---

## 📌 Notas importantes

- O projeto usa **Node 22 LTS**
- O `app/` fica dentro de `src/` — `tsconfig.json` tem `baseUrl: "./src"`
- O alias `@/` aponta para `src/`
- O `QueryClient` é importado diretamente apenas no `_layout.tsx` para o `QueryClientProvider`
- O `SessaoProvider` deve sempre envolver o `Stack` no `_layout.tsx`
- Telas do Figma serão implementadas progressivamente — sempre verificar o design antes de criar

---

*Afetto — Challenge FIAP 2026 / CLYVO VET*
*React Native + Expo + TypeScript + NativeWind + TanStack Query*
