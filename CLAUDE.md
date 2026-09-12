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
│   ├── (auth)/                 ← telas PRÉ-login (grupo não aparece na URL)
│   │   ├── _layout.tsx
│   │   ├── login.tsx                → /login
│   │   ├── cadastro.tsx              → /cadastro
│   │   └── cadastro-sucesso.tsx      → /cadastro-sucesso (modal transparente)
│   ├── (app)/                  ← telas PÓS-login fora das tabs (Stack)
│   │   ├── _layout.tsx
│   │   ├── completar-perfil.tsx     → /completar-perfil
│   │   ├── perfil.tsx                → /perfil
│   │   └── pet/
│   │       └── cadastrar.tsx          → /pet/cadastrar
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
│   │   ├── BotaoSalvar.tsx          ← ⚠️ duplica BotaoEnviar; importado em perfil.tsx mas não usado — ver seção 5
│   │   └── ToastSucesso.tsx         ← toast animado de sucesso (usa classe Tailwind inválida — ver seção 4)
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
│   ├── useColorScheme.ts(.web.ts) ← ⚠️ boilerplate do template, não usado (app não tem dark mode)
│   └── useClientOnlyValue.ts(.web.ts) ← ⚠️ boilerplate do template, não usado
├── context/
│   ├── SessaoContext.tsx          ← ÚNICA fonte de verdade de sessão (ver seção 9)
│   └── AutenticacaoContext.tsx    ← ⚠️ código morto — importa `@/lib/firebase`, que NÃO EXISTE no projeto. Nunca importe este arquivo.
├── hooks/
│   ├── usePets.ts             ← usePets, usePet, useCriarPet, useAtualizarPet, useRemoverPet
│   ├── useClinicas.ts         ← useClinicas, useVincularClinica, useDesvincularClinica
│   ├── useAutenticacao.ts     ← useCadastrar (login/logout ficam inline — ver seção 8)
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
│   ├── pet.service.ts           ← petService.{listar,buscarPorId,criar,atualizar,remover} (objeto)
│   └── clinica.service.ts       ← clinicaService.{listar,buscarPorId,vincular,desvincular} (objeto) — endpoints ainda não existem na API real, ver comentário no arquivo
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
- Nunca use `StyleSheet.create` — exceção documentada hoje: animações com `react-native-reanimated` (`useAnimatedStyle` exige objeto de estilo, não `className`). Fora isso, `StyleSheet.create` não deve aparecer em código novo (`cadastro.tsx` ainda tem um `StyleSheet.create` para o modal de sucesso — é dívida técnica a remover, não um padrão a seguir).
- Nunca passe cor via `style={{ backgroundColor: "#hex" }}` / `style={{ color: "#hex" }}`. **Isso já aconteceu no projeto** (`pets.tsx`, `clinica.tsx`, `PetsVazio.tsx` usam `style={{ backgroundColor: "#1F3B30" }}` em vez de `className="bg-primary"`) e criou um bug visual real: `#1F3B30` é ligeiramente diferente do token `primary` (`#1E3A2F`) — duas cores "verde escuro" quase iguais convivendo na mesma UI. Ao tocar em qualquer tela com esse padrão, migre para a classe Tailwind equivalente.
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
- `clinica.tsx` tem um `style={{ fontFamily: "Fraunces" }}` isolado que não tem efeito nenhum, pois a fonte nunca foi registrada.
- Se/quando Fraunces (títulos) e DM Sans (interface) forem adicionadas ao design, isso exige: baixar os `.ttf`, registrar em `useFonts` no `_layout.tsx`, e estender `theme.fontFamily` no `tailwind.config.js` — só então usar `className="font-fraunces"` / `font-dmsans`. Não escreva `style={{ fontFamily: ... }}` solto em telas.

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
| `RotaProtegida` | Toda rota que requer sessão ativa |
| `PetsVazio` | Estado vazio/erro da listagem de pets |
| `ToastSucesso` | Feedback de sucesso animado após uma ação (⚠️ corrigir classe `bg-greenMedium` antes de reusar) |
| `CirculosConcentricos` | Decoração exclusiva da tela de onboarding |

**Inconsistências reais encontradas na auditoria (corrigir ao tocar no código, não replicar):**
- `BotaoSalvar` duplica `BotaoEnviar` (mesmo layout, texto fixo em vez de props) e está **importado em `perfil.tsx` mas nunca renderizado** — a tela usa `BotaoEnviar` no lugar. É código morto. Ao encontrar esse tipo de duplicação, delete o componente redundante em vez de manter os dois.
- `completar-perfil.tsx` e `pet/cadastrar.tsx` **não usam `BotaoEnviar`** — reimplementam o mesmo `TouchableOpacity` + `ActivityIndicator` manualmente. Novos formulários devem usar `BotaoEnviar`; ao editar essas duas telas, migre para o componente.
- `cadastro.tsx` duplica inteiramente a UI de sucesso que já existe como rota própria (`cadastro-sucesso.tsx`): mostra um `Modal` com o mesmo cartão, mesmo texto, mesma animação, em vez de navegar para `/cadastro-sucesso`. Isso também é a origem do único `StyleSheet.create` "novo" do projeto. Ao tocar em `cadastro.tsx`, prefira `router.replace("/cadastro-sucesso")` e remova o modal local.
- `pets.tsx` e `clinica.tsx` cada um define sua própria função local `renderizarCartao` para o item da lista, com JSX quase idêntico em estrutura (avatar circular + nome + badges). Não há `CardPet`/`CardClinica` extraídos ainda — se uma terceira listagem desse tipo aparecer (ex. vacinas, consultas), extraia o padrão em vez de copiar a função de novo.
- Não existe um componente `EstadoErro`/`EstadoVazio` genérico: `PetsVazio` cobre só a tela de pets, e `clinica.tsx` tem sua própria UI de erro inline (ícone + texto + "tentar novamente"), com estrutura quase igual à de `PetsVazio`. Se uma terceira tela precisar de estado de erro/vazio, extraia um componente genérico em vez de copiar o padrão.
- `ExternalLink.tsx`, `useColorScheme(.web).ts` e `useClientOnlyValue(.web).ts` são sobras do template padrão do Expo Router e não são usados por nenhuma tela real. Não os importe em código novo; podem ser removidos com segurança quando alguém for limpar o projeto.

---

## 6. Responsabilidade Única — Regras por Camada

**Páginas (`src/app/`):**
- Organizam layout e renderizam componentes.
- Não fazem fetch HTTP direto à **API do Afetto** — leitura via `useQuery`, escrita via `useMutation`, ambos por hooks customizados.
- ⚠️ Exceção real hoje: `completar-perfil.tsx` faz `fetch()` direto para a API pública do ViaCEP (`buscarCep`) dentro da tela. Como não é a API do Afetto (não passa pelo cliente Axios/sessão), é tolerável como está, mas é a única chamada HTTP direta do projeto — se crescer (retry, cache, tratamento de erro mais robusto), extraia para um `services/cep.service.ts`.
- Gerenciam apenas estado local de UI (modais abertos, campo de busca, toggle).

**Hooks (`src/hooks/`):**
- Duas categorias reais no projeto, ambas válidas — documente qual está sendo usada em cada novo hook:
  1. **Hooks de dados** (`usePets.ts`, `useClinicas.ts`, `useAutenticacao.ts`): só `useQuery`/`useMutation` chamando o service, sem estado local próprio. Retornam o objeto do TanStack Query como está (`data`, `isLoading`, `isError`, `refetch`, `mutate`, `isPending`).
  2. **Hooks de tela** (`hooks/perfil/useAlterarSenha.ts`): concentram estado local (`useState`), validação manual e a `useMutation` de um fluxo de UI específico (ex.: o modal de troca de senha), expondo um objeto próprio (`{ senhaAtual, setSenhaAtual, salvandoSenha, alterarSenha, ... }`) em vez do formato padrão do React Query. `hooks/perfil/usePerfil.ts` **não é mais desse tipo** — desde que `/perfil` ganhou modo visualização/edição, ele voltou a ser um hook de dados: expõe `usuario`/`carregando`/`temErro`/`refazer` do `useQuery` e `salvarPerfil`/`salvando` de um `useMutation` padrão (a tela usa `react-hook-form` para o estado dos campos em edição).
- Login e logout **não** têm hook de mutation dedicado: login fica inline em `login.tsx` (precisa chamar `setError` do formulário e `entrar()` do `SessaoContext` no `onSuccess`) e logout chama `sair()` do `SessaoContext` direto em `perfil.tsx`. Isso é intencional e está documentado em `useAutenticacao.ts` — não crie `useLogin`/`useLogout` só para "completar a simetria".
- Invalidação de cache sempre via `useQueryClient()` dentro do hook — nunca `import { queryClient } from "@/api/queryClient"`.
- Não contêm JSX e não navegam (sem `router.push` dentro de um hook — isso fica na tela, no `onSuccess` do `useMutation`).

**Services (`src/services/`):**
- Contêm as chamadas HTTP e a transformação de payload: limpeza de máscaras (`replace(/\D/g, "")`), conversão de data BR→ISO, normalização de listas paginadas (`extrairLista`).
- ⚠️ Duas convenções de export coexistem hoje: `autenticacao.service.ts` exporta funções nomeadas soltas (`cadastrar`, `autenticar`, ...); `pet.service.ts` e `clinica.service.ts` exportam um objeto com métodos (`petService.listar`, `clinicaService.vincular`). Ambas funcionam e estão em uso — **não** refatore um para o outro "de passagem" ao editar uma feature; se for criar um service para uma **nova entidade**, prefira o padrão objeto (`nomeService.metodo`), que é o mais recente e o que melhor sinaliza autocomplete/agrupamento no editor.
- Podem conter lógica de contorno de limitações reais da API — documente o *porquê* como em `bootstrapUsuarioAposLogin` (a API não devolve `id`/nome no login nem tem `/usuario/me`, então o service varre `GET /usuario` paginado até achar o e-mail). Esse tipo de comentário é obrigatório sempre que o código estiver compensando uma lacuna do backend, não é "só documentação bonita".

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
⚠️ `pets.tsx`, `clinica.tsx` e `PetsVazio.tsx` usam em vez disso `style={{ backgroundColor: "#1F3B30" }} className="px-5 pt-14 pb-5"` — mesma estrutura, cor levemente diferente e via `style` em vez de `className`. Ao editar essas telas, migre para `className="bg-primary"`.

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
Consistente em `RotaProtegida`, `index.tsx` raiz, `pets.tsx`, `clinica.tsx`.

**Estado de erro (lista):**
```tsx
<View className="flex-1 items-center justify-center bg-surface gap-3 px-8">
  <Ionicons name="cloud-offline-outline" size={48} color="#9A9585" />
  <Text className="text-muted text-sm text-center">Erro ao carregar ... Tente novamente.</Text>
  <TouchableOpacity onPress={() => refetch()}>
    <Text className="text-amber font-semibold">Tentar novamente</Text>
  </TouchableOpacity>
</View>
```
Esse padrão está hoje só em `clinica.tsx`; em `pets.tsx` o erro é tratado dentro de `PetsVazio` (prop `erro`). São dois componentes fazendo a mesma coisa de formas diferentes — ver seção 5.

**Estado vazio:** ver componente `PetsVazio` — header + ícone + texto + CTA de ação.

**Card padrão (item de lista):**
```tsx
<TouchableOpacity activeOpacity={0.85} className="bg-white rounded-2xl p-4 mb-3 shadow-sm">
  <View className="flex-row items-center gap-3">
    {/* avatar circular com ícone/inicial */}
    {/* coluna: título + badges + metadados */}
    <Ionicons name="chevron-forward" size={18} color="#9A9585" />
  </View>
</TouchableOpacity>
```
Replicado (com pequenas variações de cor inline) em `pets.tsx` e `clinica.tsx`.

**Botão de submit fixo:** use `BotaoEnviar` (ver seção 5) — não reimplemente o `TouchableOpacity` com `ActivityIndicator` condicional.

**Segurança de área (topo da tela):** o projeto não usa `SafeAreaView`/`useSafeAreaInsets` em nenhum lugar — a convenção real é usar padding fixo (`pt-14`) no topo dos headers para compensar a status bar/notch. Siga esse padrão em telas novas por consistência, a menos que o time decida migrar para `SafeAreaView` intencionalmente.

---

## 8. Formulários — Regras

- Formulários de **criação** (login, cadastro, completar perfil, cadastrar pet) usam `useForm` + `zodResolver` + schema Zod em `src/schemas/`.
- Todo campo de texto usa `CampoTexto`; todo campo de seleção em botões usa `CampoSelecao`.
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
- Páginas protegidas usam `<RotaProtegida>` (hoje só envolvendo o `(tabs)/_layout.tsx` — as rotas `(app)` como `/perfil` e `/completar-perfil` confiam em serem acessadas só a partir de telas já protegidas, não têm guard próprio).
- Logout chama `sair()` do `SessaoContext`, que tenta `POST /logout` (pode não existir no backend ainda) e sempre limpa o AsyncStorage local, independente do resultado.

---

## 10. Navegação

- Toda navegação via `expo-router` (`router.push`, `router.replace`, `router.back`, `<Redirect>`).
- Os grupos `(auth)` e `(app)` **não** aparecem na URL — `(auth)/login.tsx` é `/login`, não `/(auth)/login`. Nunca escreva `/(auth)/...` ou `/(app)/...` num `router.push`.
- Rotas de tabs precisam do prefixo: `/(tabs)/pets`, `/(tabs)/clinica`.
- ⚠️ `login.tsx` navega para `/esqueci-senha` (com `as any` e um `TODO` no código) — essa rota **não existe ainda**. Crie `src/app/(auth)/esqueci-senha.tsx` antes de considerar esse link funcional, e remova o cast `as any` nesse ponto quando a rota existir.

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
- Nunca deixar um componente importado sem uso na árvore renderizada (ex.: `BotaoSalvar` em `perfil.tsx`) — se não for usado, delete o import e, se for redundante, o componente.

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
