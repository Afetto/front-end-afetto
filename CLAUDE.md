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
| Context API | Autenticação e sessão (`src/context/SessionContext.tsx`) |
| AsyncStorage | Persistência local da sessão |

---

## 📂 Estrutura de Pastas

```
src/
├── api/
│   ├── api.ts          ← instância do Axios com baseURL e interceptors
│   └── queryClient.ts  ← QueryClient do TanStack Query
├── app/
│   ├── _layout.tsx     ← raiz: QueryClientProvider + SessionProvider + Stack
│   ├── index.tsx       ← guard de rotas (redireciona para login ou tabs)
│   ├── login.tsx
│   ├── register.tsx
│   ├── complete-profile.tsx
│   ├── pets.tsx        ← fora das tabs (onboarding)
│   └── (tabs)/
│       ├── _layout.tsx ← tabs: Home, Clínica, Assistente, Perfil
│       ├── index.tsx   ← Home
│       ├── clinica.tsx
│       └── assistente.tsx
├── components/
│   ├── MyInput.tsx         ← input padrão com react-hook-form
│   ├── SelectField.tsx     ← seletor de opções em botões
│   └── ProtectedRoute.tsx  ← guard de rotas privadas
├── context/
│   └── SessionContext.tsx  ← sessão, login, logout, completeStep
├── hooks/
│   ├── usePets.ts      ← useQuery + useMutation para pets
│   ├── useClinicas.ts  ← useQuery + useMutation para clínicas
│   └── useAuth.ts      ← useMutation para login, register, logout
├── schemas/
│   ├── login.schema.ts
│   ├── register.schema.ts
│   ├── pet.schema.ts
│   └── clinica.schema.ts
├── services/
│   ├── auth.service.ts     ← register, authenticate, logout, updateUser
│   ├── pet.service.ts      ← getAll, getById, create, update, delete
│   └── clinica.service.ts  ← getAll, vincular, desvincular
├── types/
│   └── auth.types.ts   ← tipos globais de autenticação
└── global.css          ← Tailwind base/components/utilities
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
- Use o componente `MyInput` para campos de texto
- Use o componente `SelectField` para seleções em botões
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
- Rotas fora das tabs: `/pets`, `/complete-profile`, `/login` etc.

### 7. Proteção de rotas
- Telas privadas devem usar `<ProtectedRoute>` ou verificar `useSession()`
- O `index.tsx` raiz redireciona baseado no estado da sessão
- A aba Pets só aparece nas tabs após `session.setup.petRegistered === true`

### 8. Imports com conflito de nome
Quando uma função do service tiver o mesmo nome do `mutate`, use alias:
```ts
import { register as registerService } from "@/services/auth.service";
const { mutate: submitRegister } = useMutation({
  mutationFn: (data) => registerService(data),
});
```

### 9. Convenção de nomes de arquivos
```
auth.service.ts     ← serviços HTTP
auth.types.ts       ← tipos TypeScript
login.schema.ts     ← schemas Zod
usePets.ts          ← hooks TanStack Query
ProtectedRoute.tsx  ← componentes (PascalCase)
```

---

## 🔄 Fluxo de Onboarding

```
Login/Registro
  └── Home (checklist)
        ├── /complete-profile  → profileCompleted: true
        ├── /pets              → petRegistered: true  (fora das tabs)
        └── /(tabs)/clinica    → clinicLinked: true   (opcional)

Após petRegistered: true
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
- O `SessionProvider` deve sempre envolver o `Stack` no `_layout.tsx`
- Telas do Figma serão implementadas progressivamente — sempre verificar o design antes de criar

---

*Afetto — Challenge FIAP 2026 / CLYVO VET*
*React Native + Expo + TypeScript + NativeWind + TanStack Query*
