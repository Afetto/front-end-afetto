# Afetto — Contrato de Desenvolvimento

Você é um desenvolvedor Sênior de React Native trabalhando no app **Afetto** — uma plataforma de saúde contínua para pets, em parceria com a **CLYVO VET**, desenvolvida para o **Challenge FIAP 2026**.

Este arquivo é o contrato de desenvolvimento do projeto: todo código gerado (por humano ou IA) deve seguir estas regras. Elas refletem o **estado real do código hoje** — onde o código ainda não segue a regra, isso está marcado explicitamente como inconsistência a corrigir, não como padrão a copiar.

Idioma do código: **português** (nomes de variáveis, funções, tipos, textos de UI). Exceções documentadas na seção 11.

---

## 1. Visão Geral do Projeto

- **Produto:** Afetto — app mobile de acompanhamento de saúde de pets (onboarding, cadastro de pet, clínicas parceiras, assistente).
- **Parceiro:** CLYVO VET.
- **Contexto:** Challenge FIAP 2026.
- **Plataforma:** React Native + Expo (Android/iOS/Web via `react-native-web`).
- **Linguagem de código:** português (identificadores, textos, comentários).

---

## 2. Stack e Dependências

| Categoria | Biblioteca |
|---|---|
| Runtime/Framework | Expo `~54`, React Native `0.81`, React `19.1` |
| Navegação | `expo-router` `~6` (roteamento por arquivos, `typedRoutes` habilitado no `app.json`) |
| Estilização | `nativewind` `^4` (Tailwind CSS via `className`) |
| Formulários | `react-hook-form` `^7` + `@hookform/resolvers/zod` |
| Validação | `zod` `^4` |
| Data fetching | `@tanstack/react-query` `^5` (+ `@dev-plugins/react-query` para devtools) |
| HTTP client | `axios` `^1` |
| Sessão/Storage | `@react-native-async-storage/async-storage` |
| Ícones | `@expo/vector-icons` — **padrão real: `Ionicons`** (usado em todas as telas e componentes; `FontAwesome` só existe no boilerplate do `_layout.tsx` para os ícones de navegação padrão do template, sem uso funcional hoje) |
| Animações | `react-native-reanimated` `~4` |
| Testes | `jest` + `jest-expo` + `@testing-library/react-native` (instalados; `npm test` funciona) |
| ⚠️ Presente mas não integrado | `firebase` `^12` — só é referenciado por `AutenticacaoContext.tsx`, que é código morto (ver seção 9) |

**Variável de ambiente:** `EXPO_PUBLIC_API_URL` define a base da API. Sem ela, `src/api/api.ts` cai num fallback (`https://java-afetto-fork.onrender.com`) e emite um `console.warn`. Sempre configure um `.env` local em desenvolvimento.

---

## 3. Estrutura de Pastas

```
src/
├── api/
│   ├── api.ts          ← instância Axios (baseURL, withCredentials, interceptor de 401)
│   ├── erros.ts         ← classificarErro / mensagemPorTipo / mensagemErroApi (mensagens padronizadas de erro de API)
│   ├── paginacao.ts      ← extrairLista — normaliza resposta paginada (Spring Page) ou array puro
│   └── queryClient.ts   ← instância do QueryClient (só importado no _layout.tsx raiz)
├── app/
│   ├── _layout.tsx            ← raiz: fontes, QueryClientProvider + SessaoProvider + Stack de grupos
│   ├── index.tsx               ← onboarding + gate (sessão → tabs; sem sessão → onboarding)
│   ├── +not-found.tsx          ← tela de erro 404 do Expo Router (rota inexistente) — nome de arquivo reservado, não renomear
│   ├── (auth)/                 ← telas PRÉ-login (grupo não aparece na URL)
│   │   ├── _layout.tsx
│   │   ├── login.tsx                → /login
│   │   ├── cadastro.tsx              → /cadastro
│   │   ├── cadastro-sucesso.tsx      → /cadastro-sucesso (modal transparente — cadastro.tsx navega pra cá no sucesso)
│   │   └── esqueci-senha.tsx         → /esqueci-senha (formulário só valida e-mail; API ainda não tem endpoint de recuperação)
│   ├── (app)/                  ← telas PÓS-login fora das tabs (Stack, protegido por <RotaProtegida>)
│   │   ├── _layout.tsx
│   │   ├── completar-perfil.tsx     → /completar-perfil
│   │   ├── perfil.tsx                → /perfil
│   │   └── pet/
│   │       ├── cadastrar.tsx          → /pet/cadastrar
│   │       └── [id]/                  ← hub de detalhe do pet
│   │           ├── index.tsx           → /pet/{id} (resumo, acesso rápido, próximos cuidados, excluir)
│   │           ├── editar.tsx          → /pet/{id}/editar
│   │           ├── historico.tsx       → /pet/{id}/historico (linha do tempo de vacinas)
│   │           ├── cuidados.tsx        → /pet/{id}/cuidados (criar/editar vacina)
│   │           └── calendario.tsx      → /pet/{id}/calendario (placeholder "Em breve")
│   └── (tabs)/                 ← app principal (protegido por <RotaProtegida>)
│       ├── _layout.tsx  ← abas: Início, Pets, Assistente, Clínica
│       ├── index.tsx    ← Início (Home / checklist de onboarding)
│       ├── pets.tsx
│       ├── clinica.tsx
│       └── assistente.tsx ← placeholder ("Em breve")
├── components/
│   ├── ui/                        ← componentes de UI genéricos, reutilizáveis entre telas
│   │   ├── CampoTexto.tsx           ← input padrão com react-hook-form (Controller)
│   │   ├── CampoSelecao.tsx         ← seletor de opções em botões
│   │   ├── BotaoEnviar.tsx          ← botão fixo no rodapé com estado de envio (isPending)
│   │   └── ToastSucesso.tsx         ← toast animado de sucesso (usa classe Tailwind inválida — ver seção 4)
│   ├── FormPet.tsx                ← campos + botão de submit do formulário de pet — usado em pet/cadastrar.tsx e pet/[id]/editar.tsx
│   ├── SeletorEspecie.tsx         ← grid de cards (emoji + nome) para escolher a espécie do pet — usado dentro de FormPet
│   ├── CardPet.tsx                ← card de pet na listagem (pets.tsx)
│   ├── CardPetResumo.tsx          ← card de pet que sobrepõe o header verde — usado em pet/[id]/index.tsx e historico.tsx
│   ├── CardClinica.tsx            ← ⚠️ não usado hoje — clinica.tsx virou tela estática "Em breve" (ver seção 5)
│   ├── EstadoVazio.tsx / EstadoErro.tsx ← estados genéricos reutilizáveis (lista vazia / erro de carregamento)
│   ├── perfil/                    ← componentes específicos da tela /perfil (não reutilizados fora dela)
│   │   ├── PerfilHeader.tsx         ← header com toggle visualização/edição (pencil ↔ "Cancelar")
│   │   ├── DadosPessoaisCard.tsx    ← modo visualização (somente leitura, com ícones)
│   │   ├── FormDadosPessoais.tsx    ← modo edição (CampoTexto + react-hook-form)
│   │   ├── SegurancaCard.tsx
│   │   ├── ContaCard.tsx
│   │   └── AlterarSenhaModal.tsx
│   ├── RotaProtegida.tsx          ← guard de rotas privadas
│   ├── PetsVazio.tsx              ← estado vazio/erro da lista de pets
│   ├── CirculosConcentricos.tsx   ← decoração da tela de onboarding
│   ├── ExternalLink.tsx           ← ⚠️ boilerplate do template Expo Router, não usado
│   ├── useColorScheme.ts(.web.ts) ← ⚠️ boilerplate do template, não usado — o dark mode real usa `useColorScheme` de `"react-native"` direto (ver seção 4), não este hook
│   └── useClientOnlyValue.ts(.web.ts) ← ⚠️ boilerplate do template, não usado
├── context/
│   ├── SessaoContext.tsx          ← ÚNICA fonte de verdade de sessão (ver seção 9)
│   └── AutenticacaoContext.tsx    ← ⚠️ código morto — importa `@/lib/firebase`, que NÃO EXISTE no projeto. Nunca importe este arquivo.
├── hooks/
│   ├── usePets.ts             ← usePets, usePet, useCriarPet, useAtualizarPet, useRemoverPet
│   ├── useVacinas.ts          ← useVacinasPet, useVacina, useCriarVacina, useAtualizarVacina, useDeletarVacina
│   ├── useClinicas.ts         ← useClinicas, useVincularClinica, useDesvincularClinica — ⚠️ nenhum é chamado por tela hoje (clinica.tsx é estática, ver seção 5)
│   ├── useAutenticacao.ts     ← useCadastrar, useEntrar, useCompletarPerfil (logout fica inline — ver seção 8)
│   ├── useBuscarCep.ts        ← useQuery reativo, chama `cepService.buscarPorCep`
│   └── perfil/
│       ├── usePerfil.ts        ← hook de dados: useQuery(usuario) + useMutation(salvarPerfil)
│       └── useAlterarSenha.ts  ← estado + validação + mutation do modal de troca de senha
├── schemas/
│   ├── login.schema.ts
│   ├── cadastro.schema.ts
│   ├── completar-perfil.schema.ts
│   ├── pet.schema.ts
│   ├── clinica.schema.ts
│   ├── editar-perfil.schema.ts ← edição de dados pessoais em /perfil (nome, email, telefone, dataNascimento)
│   └── usuario.schema.ts      ← ⚠️ não é importado por nenhuma tela/hook/service — ver seção 5
├── services/
│   ├── autenticacao.service.ts ← cadastrar, autenticar, buscarUsuarioPorId, atualizarUsuario, atualizarSenha, sair, completarPerfil (funções nomeadas)
│   ├── cep.service.ts           ← cepService.buscarPorCep (objeto) — API pública do ViaCEP, usa `fetch` direto (não é a API do Afetto, não passa pelo cliente Axios)
│   ├── pet.service.ts           ← petService.{listar,buscarPorId,criar,atualizar,remover} (objeto)
│   ├── vacina.service.ts        ← vacinaService.{listarPorPet,buscarPorId,criar,atualizar,remover} (objeto)
│   └── clinica.service.ts       ← ⚠️ stub — todo método lança erro ("A API ainda não expõe endpoints de clínica"), confirmado em GET /v3/api-docs. Não faz nenhuma chamada HTTP hoje.
├── types/
│   └── autenticacao.types.ts   ← tipos globais de autenticação/usuário
├── utils/
│   └── mascaras.ts              ← mascararCPF, mascararCelular, mascararData, mascararCEP
├── __tests__/
│   └── cadastro.test.tsx        ← teste de integração da tela de cadastro (HTTP mockado)
└── global.css                   ← @tailwind base/components/utilities
```

---

## 4. Regras de Estilização

**Regras absolutas:**
- Use **sempre** `className` com NativeWind.
- Nunca use `StyleSheet.create` — exceção documentada hoje: animações com `react-native-reanimated` (`useAnimatedStyle` exige objeto de estilo, não `className`).
- Nunca passe cor via `style={{ backgroundColor: "#hex" }}` / `style={{ color: "#hex" }}`. O projeto já teve esse bug (`pets.tsx`, `clinica.tsx`, `PetsVazio.tsx` usavam `style={{ backgroundColor: "#1F3B30" }}` em vez de `className="bg-primary"`, criando duas cores "verde escuro" quase iguais na mesma UI) — já foi corrigido (essas telas hoje usam `CabecalhoOla`/`className="bg-primary"`), mas a regra continua valendo para código novo.
- **Antes de usar uma classe de cor, confirme que ela existe** no `tailwind.config.js` ou na paleta padrão do Tailwind. O projeto já tem duas classes inválidas em produção que não renderizam a cor pretendida:
  - `bg-greenMedium` (`ToastSucesso.tsx`) — o token real é `green-medium` (kebab-case). Deveria ser `bg-green-medium`.
  - `text-red` (`DadosPessoaisCard.tsx`, `ContaCard.tsx`, `AlterarSenhaModal.tsx`) — não existe token `red` no config nem na paleta padrão do Tailwind (que exige um shade, ex. `red-500`). O restante do app usa corretamente `text-red-500` (`login.tsx`, `cadastro.tsx`, `pet/cadastrar.tsx`). Ao corrigir, alinhe para `text-red-500` ou adicione um token `red` no `tailwind.config.js`.

**Tokens de cor disponíveis** (`tailwind.config.js`):

| Classe | Hex | Uso esperado |
|---|---|---|
| `bg-surface` / `text-surface` | `#F5F0E8` | Fundo geral das telas (creme) |
| `bg-primary` / `text-primary` | `#1E3A2F` | Verde escuro — headers, botões principais |
| `bg-primary-dark` | `#152B22` | Variante mais escura do primary |
| `text-muted` | `#9E9589` | Textos secundários, subtítulos |
| `border-border` | `#D8D1C7` | Bordas de inputs e cards |
| `bg-golden` / `text-golden` | `#D4921E` | Destaques na tela de onboarding |
| `bg-golden-light` | `#E8B96A` | Variante clara do golden |
| `bg-golden-pale` | `#F2D9A0` | Fundo de badges (ex. "opcional") |
| `text-amber` / `bg-amber` | `#E8A838` | Âmbar — destaques, barra de progresso, CTAs secundários |
| `bg-green-medium` | `#A8C5A0` | Verde médio — itens concluídos, sucesso (⚠️ não escreva `greenMedium`) |

Além desses tokens, o projeto usa livremente a **paleta padrão do Tailwind** para tons neutros e de erro (`text-gray-900`, `text-gray-700`, `text-gray-600`, `border-gray-200`, `text-red-500`, `bg-black/60`, `bg-white/20` etc.) — isso é aceitável e não conta como "cor hardcoded", desde que seja uma classe Tailwind válida (custom ou padrão), nunca um valor `#hex` inline.

**Tipografia — estado real (⚠️ diferente do que a documentação antiga descrevia):**
- O `tailwind.config.js` **não define nenhum `fontFamily`** customizado.
- O `_layout.tsx` raiz carrega via `useFonts` apenas `SpaceMono` (não usada em nenhuma tela) e os ícones do `FontAwesome`. **Fraunces e DM Sans não estão configuradas nem carregadas no projeto** — hoje o app renderiza com a fonte padrão do sistema.
- Se/quando Fraunces (títulos) e DM Sans (interface) forem adicionadas ao design, isso exige: baixar os `.ttf`, registrar em `useFonts` no `_layout.tsx`, e estender `theme.fontFamily` no `tailwind.config.js` — só então usar `className="font-fraunces"` / `font-dmsans`. Não escreva `style={{ fontFamily: ... }}` solto em telas.

**Dark mode:**
- `tailwind.config.js` tem `darkMode: "media"` — o tema responde automaticamente à preferência do sistema operacional (`prefers-color-scheme`), sem toggle manual nem estado de tema salvo em lugar nenhum.
- Cobertura: fundos de tela (`bg-surface` → `dark:bg-gray-900`), cards (`bg-white` → `dark:bg-gray-800`), texto (`text-gray-900`/`text-primary` → `dark:text-white`, `text-muted`/`text-gray-700`/`text-gray-600` → `dark:text-gray-400`/`dark:text-gray-300`) e bordas (`border-border`/`border-gray-200` → `dark:border-gray-700`) têm variante `dark:` em todos os componentes reutilizáveis e telas.
- `bg-primary` (headers verdes) e `text-amber`/`bg-amber` (cor de marca) **não** ganham variante `dark:` — são identidade visual e continuam iguais nos dois temas, igual à tela de onboarding (`app/index.tsx`), que é toda `bg-primary` e não precisa de ajuste.
- Badges com fundo próprio e estático (ex. `bg-golden-pale`/`bg-green-medium` nos cartões de vacina, `bg-blue-100` na linha do tempo) não recebem `dark:` — o texto dentro deles (`text-golden`, `text-primary-dark`, `text-blue-700`) só precisa ter contraste com o fundo do próprio badge, que não muda com o tema.
- ⚠️ Limitação conhecida: `className` do NativeWind não alcança a prop `color` de `Ionicons` nem `placeholderTextColor` de `TextInput` — são props nativas, não estilo via `style`/`className`. Ícones e placeholders continuam com a cor de modo claro (ex. `color="#1E3A2F"`) mesmo no dark mode; o contraste é aceitável na maioria dos casos (tons de cinza médio como `#9E9589`), mas alguns ícones verde-escuro sobre fundo escuro ficam com contraste baixo. Resolver isso exigiria `useColorScheme()` em cada tela/componente para trocar a cor manualmente — não foi feito por enquanto. Ao tocar num ícone com esse problema, aplique o mesmo padrão usado em `(tabs)/_layout.tsx` (tab bar) e `_layout.tsx` raiz (StatusBar): ler `useColorScheme()` do `react-native` e escolher a cor via JS, já que não dá pra usar `dark:` numa prop nativa.
- `StatusBar` (`app/_layout.tsx`) e a tab bar (`(tabs)/_layout.tsx`) usam `useColorScheme()` do `react-native` para trocar de estilo/cores em JS, pelo mesmo motivo acima — são componentes nativos, não `View`/`Text` estilizáveis via `className`.

---

## 5. Componentização — Regras

**Quando criar um componente:**
- Um bloco de UI aparece em mais de uma página → obrigatório extrair.
- Um bloco tem mais de ~40 linhas de JSX → avaliar extração.
- Um bloco tem lógica própria independente da página → extrair.

**Quando NÃO criar um componente:**
- Bloco usado em apenas um lugar sem perspectiva de reuso (ex.: os componentes em `components/perfil/` — são específicos da tela `/perfil` e não precisam ser genéricos).
- Abstração que só move código sem reduzir complexidade.
- Componente tão pequeno que não tem propósito próprio.

**Componentes existentes — usar sempre que aplicável:**

| Componente | Uso |
|---|---|
| `CampoTexto` | Todo campo de texto controlado por `react-hook-form` |
| `CampoSelecao` | Todo campo de seleção em botões (opções mutuamente exclusivas) |
| `BotaoEnviar` | Todo botão de submit fixo no rodapé de um formulário (`isPending` + textos customizáveis) |
| `FormPet` | Campos + botão de qualquer formulário de pet (criar/editar) |
| `SeletorEspecie` | Seleção de espécie do pet (grid de cards com emoji) |
| `EstadoVazio` / `EstadoErro` | Estado vazio / erro genérico em telas com dados remotos |
| `RotaProtegida` | Toda rota que requer sessão ativa |
| `PetsVazio` | Estado vazio/erro da listagem de pets |
| `ToastSucesso` | Feedback de sucesso animado após uma ação (⚠️ corrigir classe `bg-greenMedium` antes de reusar) |
| `CirculosConcentricos` | Decoração exclusiva da tela de onboarding |

**Inconsistências reais encontradas na auditoria (corrigir ao tocar no código, não replicar):**
- `pets.tsx` define sua própria função local `renderizarCartao` para o item da lista (usa `CardPet`). Se uma nova listagem desse tipo aparecer, extraia um `Card*` dedicado em vez de repetir a função — já existe o precedente (`CardPet`, `CardPetResumo`, `CardClinica`).
- `CardClinica.tsx` existe mas **não é usado por nenhuma tela hoje** — `clinica.tsx` virou uma tela estática de "Em breve" porque a API não tem endpoint de clínica (ver seção 6, `clinica.service.ts`). Não é código morto por descuido, é código à espera do backend — não delete, mas também não importe em telas novas até o recurso voltar a existir de verdade.
- `useClinicas`, `useVincularClinica` e `useDesvincularClinica` (`useClinicas.ts`) também não são chamados por nenhuma tela pelo mesmo motivo.
- `ExternalLink.tsx`, `useColorScheme(.web).ts` e `useClientOnlyValue(.web).ts` são sobras do template padrão do Expo Router e não são usados por nenhuma tela real. Não os importe em código novo; podem ser removidos com segurança quando alguém for limpar o projeto.

---

## 6. Responsabilidade Única — Regras por Camada

**Páginas (`src/app/`):**
- Organizam layout e renderizam componentes.
- Não fazem fetch HTTP direto à **API do Afetto** — leitura via `useQuery`, escrita via `useMutation`, ambos por hooks customizados.
- Busca de CEP: `completar-perfil.tsx` não chama HTTP nenhum diretamente — consome `useBuscarCep(cep)`, que por sua vez chama `cepService.buscarPorCep` (`services/cep.service.ts`). O service usa `fetch` direto, não o cliente Axios (`src/api/api.ts`), porque a API pública do ViaCEP não é a API do Afetto e não deve levar `withCredentials`/interceptor de sessão do backend.
- Gerenciam apenas estado local de UI (modais abertos, campo de busca, toggle).

**Hooks (`src/hooks/`):**
- Duas categorias reais no projeto, ambas válidas — documente qual está sendo usada em cada novo hook:
  1. **Hooks de dados** (`usePets.ts`, `useClinicas.ts`, `useAutenticacao.ts`): só `useQuery`/`useMutation` chamando o service, sem estado local próprio. Retornam o objeto do TanStack Query como está (`data`, `isLoading`, `isError`, `refetch`, `mutate`, `isPending`).
  2. **Hooks de tela** (`hooks/perfil/useAlterarSenha.ts`): concentram estado local (`useState`), validação manual e a `useMutation` de um fluxo de UI específico (ex.: o modal de troca de senha), expondo um objeto próprio (`{ senhaAtual, setSenhaAtual, salvandoSenha, alterarSenha, ... }`) em vez do formato padrão do React Query. `hooks/perfil/usePerfil.ts` **não é mais desse tipo** — desde que `/perfil` ganhou modo visualização/edição, ele voltou a ser um hook de dados: expõe `usuario`/`carregando`/`temErro`/`refazer` do `useQuery` e `salvarPerfil`/`salvando` de um `useMutation` padrão (a tela usa `react-hook-form` para o estado dos campos em edição).
- Login, cadastro e completar-perfil usam hooks dedicados em `useAutenticacao.ts` (`useEntrar`, `useCadastrar`, `useCompletarPerfil`) — a tela só monta o `useForm`, passa `onSuccess`/`onError` pro `mutate()` e trata o resultado (`setError`, `entrar()` do `SessaoContext`, navegação). Logout **não** tem hook dedicado: chama `sair()` do `SessaoContext` direto em `perfil.tsx` (ação única, sem payload) — isso é intencional, documentado em `useAutenticacao.ts`.
- Invalidação de cache sempre via `useQueryClient()` dentro do hook — nunca `import { queryClient } from "@/api/queryClient"`.
- Não contêm JSX e não navegam (sem `router.push` dentro de um hook — isso fica na tela, no `onSuccess` do `useMutation`).

**Services (`src/services/`):**
- Contêm as chamadas HTTP e a transformação de payload: limpeza de máscaras (`replace(/\D/g, "")`), conversão de data BR→ISO, normalização de listas paginadas (`extrairLista`).
- ⚠️ Duas convenções de export coexistem hoje: `autenticacao.service.ts` exporta funções nomeadas soltas (`cadastrar`, `autenticar`, ...); `pet.service.ts` e `clinica.service.ts` exportam um objeto com métodos (`petService.listar`, `clinicaService.vincular`). Ambas funcionam e estão em uso — **não** refatore um para o outro "de passagem" ao editar uma feature; se for criar um service para uma **nova entidade**, prefira o padrão objeto (`nomeService.metodo`), que é o mais recente e o que melhor sinaliza autocomplete/agrupamento no editor.
- Podem conter lógica de contorno de limitações reais da API — documente o *porquê* como em `bootstrapUsuarioAposLogin` (a API não devolve `id`/nome no login nem tem `/usuario/me`, então o service varre `GET /usuario` paginado até achar o e-mail). Esse tipo de comentário é obrigatório sempre que o código estiver compensando uma lacuna do backend, não é "só documentação bonita".
- ⚠️ `cep.service.ts` é a única exceção ao cliente Axios: chama a API pública do ViaCEP via `fetch` direto (padrão objeto, `cepService.buscarPorCep`), porque não é a API do Afetto e não deve levar `withCredentials`/interceptor de sessão. Não migre esse service para `api.ts` nem os outros services para `fetch` "de passagem".

**Schemas (`src/schemas/`):**
- Contêm apenas schemas Zod, exportando o tipo inferido junto.
- ⚠️ `usuario.schema.ts` não é importado por nenhum arquivo do projeto hoje (verificado por busca no código) e usa `id: z.number()`, enquanto toda a API real usa `id: string` (UUID). Não use esse schema como referência — é um artefato de uma versão anterior da API. Se for tipar o usuário, use `UsuarioArmazenado`/`UsuarioApi` de `autenticacao.types.ts`/`autenticacao.service.ts`.

**Utils (`src/utils/`):**
- Funções puras, sem hooks, sem I/O: só `mascaras.ts` hoje (`mascararCPF`, `mascararCelular`, `mascararData`, `mascararCEP`).

**Context (`src/context/`):**
- `SessaoContext` é a única fonte de verdade de sessão em uso.
- `AutenticacaoContext.tsx` é código morto: importa `@/lib/firebase`, um caminho que **não existe** no projeto (não há pasta `src/lib`), então qualquer import dele quebra o bundler. Não é montado em nenhum `_layout.tsx`. Não crie nova lógica nele nem o importe — se for necessário migrar para Firebase algum dia, isso é uma decisão de arquitetura a discutir antes, não um contexto "quase pronto" para religar.

---

## 7. Padrões de UI — Estado Real

Documentando os padrões que **de fato** existem hoje, incluindo onde eles divergem entre telas (para convergir ao tocar no código, não para copiar a divergência):

**Header de tela (com tab bar / fora de formulário):**
```tsx
// Padrão majoritário — className, token primary
<View className="bg-primary px-6 pt-14 pb-8">
  <Text className="text-white ...">...</Text>
</View>
```
`pets.tsx` e `PetsVazio.tsx` usam esse padrão via o componente `CabecalhoOla`; `clinica.tsx` e `assistente.tsx` escrevem o header inline (`className="px-5 pt-14 pb-5 bg-primary"`) por serem telas estáticas sem o resto do layout de `CabecalhoOla` (sem avatar/voltar). Ambas as formas são `className`, sem `style` hardcoded — o bug antigo de `style={{ backgroundColor: "#1F3B30" }}` (ver seção 4) já foi corrigido nessas três telas.

**Header de tela de formulário:**
```tsx
<Text className="text-4xl font-bold text-gray-900 leading-tight">
  Título{"\n"}da tela
</Text>
```
Usado em `login.tsx`, `cadastro.tsx`, `completar-perfil.tsx`.

**Estado de loading:**
```tsx
<View className="flex-1 items-center justify-center bg-surface">
  <ActivityIndicator color="#E8A838" size="large" />
</View>
```
Consistente em `RotaProtegida`, `pets.tsx`, `perfil.tsx`, `pet/[id]/*` (fundo `bg-surface`). `index.tsx` raiz (onboarding) usa o mesmo padrão mas com `bg-primary` em vez de `bg-surface`, de propósito — a tela inteira é verde. `clinica.tsx` não tem estado de loading: é uma tela estática sem nenhum hook (ver seção 6), então não há nada para carregar.

**Estado de erro (dados remotos):** use o componente `EstadoErro` (ícone + mensagem + "Tentar novamente" chamando `refetch()`) — usado em `pet/[id]/index.tsx`, `pet/[id]/editar.tsx`, `pet/[id]/historico.tsx`, `perfil.tsx`. Em `pets.tsx` o erro é tratado dentro de `PetsVazio` (prop `erro`) — é um caso legítimo à parte, porque lista vazia e erro de carregamento levam à mesma tela ali.

**Estado vazio:** use o componente `EstadoVazio` (ícone + título + subtítulo + CTA opcional) para casos genéricos; `PetsVazio` é a versão específica da listagem de pets (com seu próprio header).

**Card padrão (item de lista):**
```tsx
<TouchableOpacity activeOpacity={0.85} className="bg-white rounded-2xl p-4 mb-3 shadow-sm">
  <View className="flex-row items-center gap-3">
    {/* avatar circular com ícone/inicial */}
    {/* coluna: título + badges + metadados */}
    <Ionicons name="chevron-forward" size={18} color="#9E9589" />
  </View>
</TouchableOpacity>
```
Extraído em `CardPet` (listagem) e `CardPetResumo` (detalhe do pet, sobrepõe o header). `CardClinica` existe no mesmo padrão mas está sem uso (ver seção 5).

**Botão de submit fixo:** use `BotaoEnviar` (ver seção 5) — não reimplemente o `TouchableOpacity` com `ActivityIndicator` condicional.

**Segurança de área (topo da tela):** o projeto não usa `SafeAreaView`/`useSafeAreaInsets` em nenhum lugar — a convenção real é usar padding fixo (`pt-14`) no topo dos headers para compensar a status bar/notch. Siga esse padrão em telas novas por consistência, a menos que o time decida migrar para `SafeAreaView` intencionalmente.

---

## 8. Formulários — Regras

- Formulários de **criação** (login, cadastro, completar perfil, cadastrar/editar pet, cuidados) usam `useForm` + `zodResolver` + schema Zod em `src/schemas/`.
- Todo campo de texto usa `CampoTexto`; todo campo de seleção em botões usa `CampoSelecao`.
- Formulário de pet (criar e editar) usa o componente `FormPet` — não repita os campos entre `pet/cadastrar.tsx` e `pet/[id]/editar.tsx`, ambos já compartilham o mesmo `FormCadastroPetSchema`/`FormCadastroPet`.
- Validação acontece no schema Zod — nunca inline na tela.
- Botão de submit usa `isPending` do `useMutation` (nunca `isSubmitting` do `react-hook-form`) e, sempre que possível, o componente `BotaoEnviar`.
- Erros de API aparecem via `setError("root", { message })` do `react-hook-form`, renderizado como texto na tela — nunca silenciados.
- `/perfil` (edição de dados pessoais) segue o padrão padrão desde que ganhou modo visualização/edição: `react-hook-form` + `zodResolver(EditarPerfilSchema)`, com `CampoTexto` nos campos e alternância entre `DadosPessoaisCard` (leitura) e `FormDadosPessoais` (edição) controlada por um `editando` local — mesmo padrão de toggle usado em `pet/[id]/index.tsx` → `pet/[id]/editar.tsx`.
- **Exceção que continua real:** o modal de troca de senha (`AlterarSenhaModal` + `useAlterarSenha`) usa inputs controlados manualmente, sem Zod — validação imperativa de senha (tamanho mínimo, confirmação igual). Isso é aceitável por ser um fluxo pequeno e isolado (3 campos, sem máscara, sem reuso de schema).
- Ao adicionar um campo, use as máscaras de `utils/mascaras.ts` via a prop `transformarTexto` do `CampoTexto` (não crie uma máscara nova inline).

---

## 9. Autenticação e Sessão

- Autenticação via **cookie de sessão** (`JSESSIONID`) — `withCredentials: true` no Axios (`src/api/api.ts`). Não há JWT/Bearer no projeto atual.
- `SessaoContext` (`src/context/SessaoContext.tsx`) é a **única** fonte de verdade da sessão. `AutenticacaoContext` é código morto (Firebase, não integrado, importa um arquivo inexistente) — não use.
- Sessão persistida via `AsyncStorage` com a chave **`@afetto:session`** (não `@afetto:token` — o cookie de sessão é gerenciado pelo navegador/WebView, o AsyncStorage guarda só os dados de UI: `id`, `email`, `nome`, `progresso`).
- A API não expõe `GET /usuario/me`: o `id`/nome do usuário logado é descoberto varrendo `GET /usuario` paginado até achar o e-mail (`bootstrapUsuarioAposLogin`, roda uma vez após o login). Depois disso, todo o resto da app usa `buscarUsuarioPorId(id)`.
- Um `401` de qualquer chamada dispara o tratador registrado por `SessaoContext` via `definirTratadorSessaoExpirada` (em `api.ts`), que limpa o AsyncStorage e zera a sessão — o `<RotaProtegida>` reage sozinho e redireciona para `/login`.
- Um `403` **não** é tratado como sessão inválida (pode ser regra de negócio, ex. e-mail em uso) — cada tela trata seu próprio `isError`/`onError`. Não adicione um interceptor global de 403.
- Páginas protegidas usam `<RotaProtegida>` — envolve tanto `(tabs)/_layout.tsx` quanto `(app)/_layout.tsx` (todas as rotas de `/perfil`, `/completar-perfil` e `/pet/*` passam pelo guard e redirecionam pra `/login` sem sessão).
- Logout chama `sair()` do `SessaoContext`, que tenta `POST /logout` (pode não existir no backend ainda) e sempre limpa o AsyncStorage local, independente do resultado.

---

## 10. Navegação

- Toda navegação via `expo-router` (`router.push`, `router.replace`, `router.back`, `<Redirect>`).
- Os grupos `(auth)` e `(app)` **não** aparecem na URL — `(auth)/login.tsx` é `/login`, não `/(auth)/login`. Nunca escreva `/(auth)/...` ou `/(app)/...` num `router.push`.
- Rotas de tabs precisam do prefixo: `/(tabs)/pets`, `/(tabs)/clinica`.
- `login.tsx` navega para `/esqueci-senha` (rota existe, sem cast). A tela só valida o e-mail e mostra "Em breve esta funcionalidade estará disponível" — não há endpoint de recuperação de senha na API ainda.

**Onde criar uma tela nova (telas do Figma):**

| Tipo de tela | Pasta |
|---|---|
| Pré-login (ex.: `/esqueci-senha`, `/verificar-email`) | `src/app/(auth)/` |
| Pós-login, fora das abas, em Stack (ex.: detalhe/edição, agenda de vacina) | `src/app/(app)/` |
| Nova aba fixa | `src/app/(tabs)/` + entrada no `(tabs)/_layout.tsx` |
| Fluxo de pet (cadastrar/detalhe) | `src/app/(app)/pet/` — ex.: `pet/cadastrar.tsx` → `/pet/cadastrar`, `pet/[id].tsx` → `/pet/123` |

---

## 11. Convenções de Nomenclatura

| Tipo | Convenção | Exemplo real |
|---|---|---|
| Arquivos de página | kebab-case português | `completar-perfil.tsx` |
| ⚠️ Exceção | nomes reservados do Expo Router ficam em inglês/como o framework exige | `_layout.tsx`, `+not-found.tsx` |
| Arquivos de componente | PascalCase português | `PetsVazio.tsx`, `CampoTexto.tsx` |
| Arquivos de hook | camelCase com `use` | `usePets.ts`, `useAlterarSenha.ts` |
| Arquivos de service | kebab-case + `.service` | `autenticacao.service.ts` |
| Arquivos de schema | kebab-case + `.schema` | `cadastro.schema.ts` |
| Arquivos de types | kebab-case + `.types` | `autenticacao.types.ts` |
| Funções e variáveis | camelCase português | `calcularIdade`, `mascararCPF` |
| Tipos e interfaces | PascalCase português | `DadosCadastroPet`, `ResultadoAutenticacao` |
| Campos de payload (schemas de formulário) | **inglês**, quando espelham nomes de campo do `react-hook-form`/Figma | `CadastroInput.name`, `.birthDate`, `.phoneCode` — documentado no topo de `autenticacao.types.ts` |

Quando uma função do service tiver o mesmo nome do `mutate`/import local, use alias:
```ts
import { cadastrar as servicoCadastrar } from "@/services/autenticacao.service";
const { mutate: enviarCadastro } = useMutation({
  mutationFn: (data) => servicoCadastrar(data),
});
```

---

## 12. O Que Nunca Fazer

- Nunca fazer fetch HTTP à API do Afetto dentro de uma página — use hooks (`useQuery`/`useMutation`).
- Nunca usar `StyleSheet.create`, exceto para estilos exigidos por `react-native-reanimated` (`useAnimatedStyle`).
- Nunca escrever `style={{ backgroundColor: "#hex" }}` / `color: "#hex"` — sempre uma classe Tailwind.
- Nunca usar uma classe de cor Tailwind sem confirmar que ela existe no `tailwind.config.js` ou na paleta padrão (evita repetir bugs como `bg-greenMedium`/`text-red`).
- Nunca duplicar um bloco de UI que já existe como componente ou como rota (ex.: recriar a tela de sucesso do cadastro dentro de um `Modal`).
- Nunca importar `AutenticacaoContext.tsx` — quebra o build (`@/lib/firebase` não existe).
- Nunca criar um segundo context de autenticação/sessão — `SessaoContext` é o único.
- Nunca usar `any` sem justificativa documentada em comentário (ex.: casts de rota para telas ainda não criadas devem ter um `// TODO` explicando o que falta).
- Nunca instalar biblioteca nova sem discutir com o time.
- Nunca alterar o schema Zod para contornar uma validação — corrigir o dado ou a regra de negócio.
- Nunca navegar para uma rota inexistente sem criá-la primeiro (ou deixar um `TODO` explícito, como já é feito em `login.tsx`).
- Nunca commitar com `npx tsc --noEmit` retornando erros novos.
- Nunca deixar um componente importado sem uso na árvore renderizada — se não for usado, delete o import e, se for redundante, o componente. (Exceção documentada: `CardClinica`, `useClinicas`, `useVincularClinica`, `useDesvincularClinica` — sem uso hoje porque a API não tem endpoint de clínica, não por descuido.)

---

## 13. Checklist Antes de Todo Commit

```
[ ] npx tsc --noEmit sem erros novos
[ ] Nenhum StyleSheet.create novo (fora de reanimated)
[ ] Nenhuma cor hardcoded (style inline ou classe Tailwind inexistente)
[ ] Nenhum fetch HTTP direto à API do Afetto em página
[ ] Componentes existentes reutilizados (CampoTexto, CampoSelecao, BotaoEnviar, RotaProtegida...)
[ ] Nenhum import não utilizado (componente "morto")
[ ] Formulários de criação com useForm + zodResolver; isPending em vez de isSubmitting
[ ] useQueryClient() em vez de import direto do queryClient
[ ] Nomes em português (exceto campos de payload que espelham o formulário/Figma em inglês)
[ ] Props tipadas sem any
[ ] Estado de loading, erro e vazio presentes nas telas com dados remotos
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
  └── Aba "Pets" já existe fixa nas tabs hoje (não há mostrar/escondê-la
      dinamicamente implementado — ver (tabs)/_layout.tsx)
  └── Botão "Seus Pets" aparece na Home
```

⚠️ `(tabs)/index.tsx` (Home) tem um `useState(temPets)` com um `<Switch>` que não está ligado a nenhum dado real (`usePets` já existe e não é usado ali) — é um resquício de mock. Ao tocar nessa tela, ou remova o `Switch` ou ligue-o a `usePets().data.length > 0`.

---

## 📌 Notas Importantes

- O projeto usa **Node 22 LTS**.
- O `app/` fica dentro de `src/` — `tsconfig.json` tem `paths: { "@/*": ["./src/*"] }`.
- O alias `@/` aponta para `src/`.
- O `QueryClient` é importado diretamente apenas no `_layout.tsx` raiz, para o `QueryClientProvider`.
- O `SessaoProvider` deve sempre envolver o `Stack` no `_layout.tsx`.
- Existe um arquivo `FIELDS_MAP.md` na raiz do projeto: ele descreve uma versão **anterior** do app (rotas `register.tsx`/`login.tsx` na raiz, `AuthContext.tsx`, autenticação JWT, telas de pets/clínica mockadas). Isso não reflete mais o código atual — não use esse documento como referência sem revalidar contra o código.
- Telas do Figma serão implementadas progressivamente — sempre verificar o design antes de criar.

---

*Afetto — Challenge FIAP 2026 / CLYVO VET*
*React Native + Expo + TypeScript + NativeWind + TanStack Query*
