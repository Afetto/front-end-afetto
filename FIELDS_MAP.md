# Afetto — Mapeamento de Campos por Entidade

> Documento gerado a partir da leitura de `src/schemas/`, `src/services/`, `src/app/`, `src/types/`, `src/context/`, `src/hooks/` e `src/utils/`.
>
> Legenda:
> - ⚠️ campo mockado ou marcado como TODO no código
> - ❓ campo cuja origem não está clara no código
> - 🔀 campo com nome diferente entre front (schema/form) e service/API

---

## 1. Usuário (auth / perfil)

### Cadastro (Register)

Tela: [src/app/register.tsx](src/app/register.tsx) · Schema: [src/schemas/register.schema.ts](src/schemas/register.schema.ts) · Service: [register()](src/services/auth.service.ts)

| Campo (front) | Campo (API / service) | Tipo | Obrigatório | Validação | Origem |
|---|---|---|---|---|---|
| `name` | `nome` 🔀 | string | ✅ | mín. 1 ("obrigatório") + mín. 3 chars + `trim()` | usuário digita |
| `cpf` | `cpf` | string (com máscara `000.000.000-00`) | ✅ | obrigatório + algoritmo de validação de CPF (`isValidCPF`) | usuário digita (`maskCPF`) |
| `email` | `email` | string | ✅ | obrigatório + formato e-mail + `toLowerCase()` + `trim()` | usuário digita |
| `phoneCode` | — (concatenado em `telefone`) 🔀 | string | ✅ | obrigatório | usuário digita (default `+55`) |
| `phone` | — (concatenado em `telefone`) 🔀 | string (máscara `99999-9999`) | ✅ | obrigatório + mín. 9 dígitos numéricos | usuário digita (`maskPhone`) |
| — | `telefone` | string | ✅ | montado como `` `${phoneCode} ${phone}` `` | derivado no service |
| `birthDate` | `dataNascimento` 🔀 | string `DD/MM/AAAA` | ✅ | obrigatório + regex `DD/MM/AAAA` + data válida e no passado (`isValidDate`) | usuário digita (`maskDate`) |
| `password` | `senha` 🔀 | string | ✅ | obrigatório + mín. 6 chars | usuário digita |

Endpoint: `POST /usuarios`. Trata `409` → `email_taken`; demais erros → `unknown`. Não retorna corpo usado (apenas `{ ok: true }`).

### Login

Tela: [src/app/login.tsx](src/app/login.tsx) · Schema: [src/schemas/login.schema.ts](src/schemas/login.schema.ts) · Service: [authenticate()](src/services/auth.service.ts)

| Campo (front) | Campo (API) | Tipo | Obrigatório | Validação | Origem |
|---|---|---|---|---|---|
| `email` | `email` | string | ✅ | obrigatório + formato e-mail + `toLowerCase()` + `trim()` | usuário digita |
| `password` | `senha` 🔀 | string | ✅ | obrigatório + mín. 6 chars | usuário digita |

Endpoint: `POST /auth/login`. Retorna `{ token, usuario }`. O `token` é setado em `api.defaults.headers.common["Authorization"]`.

⚠️ Em [login.tsx:44](src/app/login.tsx#L44) a tela chama `login(result.user.email, result.user.name)` — passa **o nome no lugar da senha** para `useSession().login`. O `SessionContext.login` por sua vez re-chama `authenticate(email, name)` ([SessionContext.tsx:48-61](src/context/SessionContext.tsx#L48-L61)). Fluxo de sessão inconsistente / a corrigir.

### Completar Perfil (Complete Profile)

Tela: [src/app/complete-profile.tsx](src/app/complete-profile.tsx) · Schema: [src/schemas/complete.profile.schema.ts](src/schemas/complete.profile.schema.ts)

| Campo (front) | Tipo | Obrigatório | Validação | Origem |
|---|---|---|---|---|
| `birthDate` | string | ✅ | mín. 10 chars ("Data inválida") | ❓ campo existe no schema mas **não há input na tela** para ele (default `""`) |
| `tipoMoradia` | enum `"casa" \| "apartamento"` | ✅ | enum obrigatório | usuário seleciona (`SelectField`) |
| `telaTroteção` | enum `"sim" \| "nao"` | ✅ | enum obrigatório | usuário seleciona (`SelectField`) — ⚠️ nome com typo, deveria ser `telaProtecao` |
| `quantidadePets` | string | ✅ | mín. 1 char + `Number(v) >= 1` | usuário digita (numérico) |
| `cep` | string | ✅ | exatamente 9 chars (`00000-000`) | usuário digita (`maskCEP`) |
| `logradouro` | string | ✅ | mín. 3 chars | usuário digita **ou** preenchido via ViaCEP |
| `numero` | string | ✅ | mín. 1 char | usuário digita |
| `complemento` | string | ❌ | `optional()` | usuário digita |
| `bairro` | string | ✅ | mín. 2 chars | usuário digita **ou** ViaCEP |
| `cidade` | string | ✅ | mín. 2 chars | usuário digita **ou** ViaCEP (`localidade`) |
| `estado` | string | ✅ | exatamente 2 chars | usuário digita **ou** ViaCEP (`uf`) |

⚠️ **Nada disso é enviado à API.** A `mutationFn` chama `updateUser("", { name: undefined, email: undefined })` ([complete-profile.tsx:81-86](src/app/complete-profile.tsx#L81-L86)) — todos os dados de moradia/endereço/quantidade de pets são descartados. Em caso de sucesso apenas marca `completeStep("profileCompleted")`.

### Editar Perfil (Profile)

Tela: [src/app/profile.tsx](src/app/profile.tsx) · Services: [getUserByEmail()](src/services/auth.service.ts), [updateUser()](src/services/auth.service.ts), [updatePassword()](src/services/auth.service.ts)

| Campo (front) | Campo (API) | Tipo | Obrigatório | Validação (na tela) | Origem |
|---|---|---|---|---|---|
| `name` | `nome` 🔀 | string | ✅ | não pode ser vazio após `trim()` | usuário edita |
| `email` | `email` | string | ✅ | não pode ser vazio após `trim().toLowerCase()` | usuário edita |
| `phone` | `telefone` 🔀 | string | ❌ | `trim()` | usuário edita |
| `cpf` | `cpf` | string | — | **somente leitura** ("CPF • não editável") | vem de `GET /usuarios/me` |
| `whatsappNotif` | ❓ | boolean | — | sem validação | ⚠️ estado local (`useState(true)`), **não persiste em lugar nenhum** |
| `currentPwd` | `senhaAtual` 🔀 | string | ✅ | preenchido | usuário digita (modal) |
| `newPwd` | `novaSenha` 🔀 | string | ✅ | mín. 6 chars | usuário digita (modal) |
| `confirmPwd` | — (só validação local) | string | ✅ | igual a `newPwd` | usuário digita (modal) |

Endpoints: `GET /usuarios/me`, `PUT /usuarios/me` (comentário do código diz `PUT /usuarios/{id}`, mas a chamada real é `api.put("/usuarios/me")`), `POST /usuarios/me/senha`.
`updateUser` envia `nome`, `email`, `telefone` (`` `${phoneCode ?? "+55"} ${phone}` ``). Trata `409` → `email_taken`, `404` → `not_found`.
`updatePassword` envia `{ senhaAtual, novaSenha }`. Trata `401` → `wrong_password`.

### Sessão (SessionContext)

Arquivo: [src/context/SessionContext.tsx](src/context/SessionContext.tsx) · Persistência: `AsyncStorage` chave `@afetto:session`

| Campo | Tipo | Descrição |
|---|---|---|
| `session.email` | string | e-mail do usuário logado |
| `session.name` | string | nome do usuário logado |
| `session.setup.profileCompleted` | boolean | passo "completar perfil" concluído |
| `session.setup.petRegistered` | boolean | passo "cadastrar pet" concluído — libera a aba **Pets** e o botão "Seus Pets" na Home |
| `session.setup.clinicLinked` | boolean | passo "vincular clínica" concluído (opcional) |
| `isLoading` | boolean | carregando sessão do AsyncStorage |

⚠️ `setup` é **inteiramente local** — sempre inicia em `DEFAULT_SETUP` (tudo `false`) no login e só é alterado por `completeStep()`. Não há leitura desse progresso a partir da API.
⚠️ `token` **não é armazenado** — o `TODO` em [SessionContext.tsx:49](src/context/SessionContext.tsx#L49) confirma que a intenção é salvar o token quando a API existir. O interceptor em [api.ts:23-28](src/api/api.ts#L23-L28) tem o código de anexar o token JWT **comentado**.

### AuthContext (Firebase) — paralelo / não integrado

Arquivo: [src/context/AuthContext.tsx](src/context/AuthContext.tsx)

| Campo | Tipo | Descrição |
|---|---|---|
| `user` | `firebase/auth` `User \| null` | usuário do Firebase Auth |
| `isLoading` | boolean | carregando estado de auth |

⚠️ `signIn` e `signOut` são **stubs vazios**; só `signUp` chama `createUserWithEmailAndPassword`. Este contexto coexiste com `SessionContext` e não está claro qual é a fonte de verdade. ❓

---

## 2. Pet

### Schema / Service (não usados nas telas ainda)

Schema: [src/schemas/pet.schema.ts](src/schemas/pet.schema.ts) · Service: [src/services/pet.service.ts](src/services/pet.service.ts) · Hook: [src/hooks/usePets.ts](src/hooks/usePets.ts)

| Campo | Tipo | Obrigatório | Validação | Origem |
|---|---|---|---|---|
| `id` | number | ✅ (só em `PetSchema`, omitido em `CreatePetSchema`) | — | API |
| `nome` | string | ✅ | mín. 2 chars | usuário digita |
| `especie` | enum `"Cachorro" \| "Gato" \| "Coelho" \| "Pássaro" \| "Réptil" \| "Outro"` | ✅ | enum | usuário seleciona |
| `raca` | string | ✅ | mín. 2 chars | usuário digita |
| `sexo` | enum `"M" \| "F"` | ✅ | enum | usuário seleciona |
| `peso` | string | ✅ | mín. 1 char | usuário digita |
| `dataNascimento` | string | ✅ | mín. 1 char | usuário digita |

Endpoints (service): `GET /pets`, `GET /pets/:id`, `POST /pets` (envia o objeto `CreatePetInput` cru), `PUT /pets/:id`, `DELETE /pets/:id`.

### Tela de Pets (real, mockada)

Tela: [src/app/(tabs)/pets.tsx](src/app/(tabs)/pets.tsx)

⚠️ A tela **não usa** `usePets` / `useCreatePet` nem o `PetSchema`. Usa um tipo `Pet` local e `PETS_MOCK` (array **vazio**, com exemplos comentados). O tipo local diverge do schema:

| Campo (tela) | Campo (schema) | Observação |
|---|---|---|
| `id` | `id` | — |
| `nome` | `nome` | — |
| `especie` | `especie` | tela usa `string`, schema usa enum |
| `raca` | `raca` | — |
| `idade` (ex: `"3 anos"`) | ❌ não existe no schema | ⚠️ schema tem `dataNascimento`, tela tem `idade` já formatada 🔀 |
| `peso` (ex: `"28kg"`) | `peso` | — |
| `sexo` | `sexo` | — |
| `saudavel` | ❌ não existe no schema | ⚠️❓ flag de "Em dia / Atenção" — origem indefinida |

⚠️ Botões "Adicionar novo pet" e "Concluir": o "Adicionar" não tem `onPress`; "Concluir" só chama `completeStep("petRegistered")`. Não há tela/form de cadastro de pet implementada.

---

## 3. Clínica

### Schema / Service (não usados nas telas ainda)

Schema: [src/schemas/clinica.schema.ts](src/schemas/clinica.schema.ts) · Service: [src/services/clinica.service.ts](src/services/clinica.service.ts) · Hook: [src/hooks/useClinicas.ts](src/hooks/useClinicas.ts)

| Campo | Tipo | Obrigatório | Validação | Origem |
|---|---|---|---|---|
| `id` | number | ✅ | — | API |
| `nome` | string | ✅ | mín. 2 chars | API |
| `bairro` | string | ✅ | — | API |
| `cidade` | string | ✅ | — | API |
| `especialidade` | string | ✅ | — | API |
| `vinculada` | boolean | ✅ | — | API (estado do vínculo com o usuário atual) |

### Vínculo de Clínica

Schema: `VincularClinicaSchema`

| Campo | Tipo | Obrigatório | Validação | Origem |
|---|---|---|---|---|
| `clinicaId` | number | ✅ | — | seleção do usuário |
| `usuarioId` | number | ✅ | — | ❓ sessão não guarda `id` numérico do usuário (só `email`/`name`) — de onde vem? |

Endpoints (service): `GET /clinicas`, `GET /clinicas/:id`, `POST /clinicas/vincular` (envia `{ clinicaId, usuarioId }`), `DELETE /clinicas/vincular/:clinicaId`.

### Tela de Clínica (real, mockada)

Tela: [src/app/(tabs)/clinica.tsx](src/app/(tabs)/clinica.tsx)

⚠️ A tela **não usa** `useClinicas` / `useVincularClinica`. Usa tipo `Clinica` local (idêntico ao schema, sem validação) e `CLINICAS_MOCK` (5 clínicas hardcoded). "Vincular" só altera o estado local (`setClinicas`), não chama API e **não** chama `completeStep("clinicLinked")`.

---

## 4. Endereço

Só existe dentro do schema de **Completar Perfil** ([src/schemas/complete.profile.schema.ts](src/schemas/complete.profile.schema.ts)). Não há entidade/service/tipo de endereço separado.

| Campo (front) | Campo ViaCEP | Tipo | Obrigatório | Validação | Origem |
|---|---|---|---|---|---|
| `cep` | — | string `00000-000` | ✅ | exatamente 9 chars | usuário digita (`maskCEP`); dispara `buscarCep` no `onBlur` |
| `logradouro` | `logradouro` | string | ✅ | mín. 3 chars | ViaCEP ou usuário |
| `numero` | — | string | ✅ | mín. 1 char | usuário digita |
| `complemento` | — | string | ❌ | opcional | usuário digita |
| `bairro` | `bairro` | string | ✅ | mín. 2 chars | ViaCEP ou usuário |
| `cidade` | `localidade` 🔀 | string | ✅ | mín. 2 chars | ViaCEP ou usuário |
| `estado` | `uf` 🔀 | string | ✅ | exatamente 2 chars | ViaCEP ou usuário |

⚠️ Busca via `https://viacep.com.br/ws/{cep}/json/` diretamente na tela ([complete-profile.tsx:55-78](src/app/complete-profile.tsx#L55-L78)) — não passa por hook/service. Trata `data.erro`.
⚠️ Nenhum campo de endereço é persistido (ver seção 1 — Completar Perfil).

---

## 5. Campos que vêm da API (somente leitura)

Campos retornados pela API e **não digitados** pelo usuário:

| Entidade | Campo | Endpoint | Observação |
|---|---|---|---|
| Auth | `token` (JWT) | `POST /auth/login` | setado no header Axios; ⚠️ não persistido |
| Usuário | `usuario.id` / `u.id` | `POST /auth/login`, `GET /usuarios/me` | mapeado para `StoredUser.id` |
| Usuário | `usuario.nome` → `name` | login / me | 🔀 |
| Usuário | `usuario.email` → `email` | login / me | — |
| Usuário | `usuario.cpf` → `cpf` | login / me | somente leitura na tela de perfil |
| Usuário | `usuario.telefone` → `phone` | login / me | 🔀; `phoneCode` é **hardcoded `"+55"`** no service (não vem da API) ⚠️ |
| Usuário | `usuario.dataNascimento` → `birthDate` | login / me | 🔀 |
| Usuário | `response.data.email` → `newEmail` | `PUT /usuarios/me` | fallback para o e-mail atual se ausente |
| Pet | `id` | `GET /pets`, `POST /pets` | — |
| Clínica | `id`, `nome`, `bairro`, `cidade`, `especialidade`, `vinculada` | `GET /clinicas` | lista inteira vem da API |

`phoneCode`: ⚠️ o service sempre devolve `"+55"` fixo em `authenticate` e `getUserByEmail`; o número real da API (`telefone`) já vem concatenado com DDI no cadastro. Não há separação DDI/número no backend.

---

## 6. Campos pendentes / TODO

| Local | Campo / item | Status |
|---|---|---|
| [SessionContext.tsx:49](src/context/SessionContext.tsx#L49) | `token` da sessão | ⚠️ TODO — "quando API existir, salvar token em vez da senha" |
| [api.ts:24-27](src/api/api.ts#L24-L27) | injeção do `Authorization: Bearer <token>` no request | ⚠️ código comentado — depende de `AsyncStorage.getItem("@afetto:token")` |
| [api.ts:34-36](src/api/api.ts#L34-L36) | tratamento de `401` (token expirado → redirect login) | ⚠️ bloco vazio |
| [login.tsx:98](src/app/login.tsx#L98) | rota `/forgot-password` ("Esqueci minha senha") | ⚠️ TODO — "Alterar rota de esquecer senha"; rota não existe |
| [complete-profile.tsx:81-86](src/app/complete-profile.tsx#L81-L86) | envio de `tipoMoradia`, `telaTroteção`, `quantidadePets`, `cep`, `logradouro`, `numero`, `complemento`, `bairro`, `cidade`, `estado`, `birthDate` | ⚠️ mockado — `updateUser` chamado com tudo `undefined`; nenhum endpoint recebe endereço/moradia |
| [complete.profile.schema.ts:9](src/schemas/complete.profile.schema.ts#L9) | `telaTroteção` | ⚠️ typo no nome do campo (esperado `telaProtecao`) |
| [complete-profile.tsx](src/app/complete-profile.tsx) | input para `birthDate` | ❓ campo no schema sem UI correspondente |
| [pets.tsx:34-38](src/app/(tabs)/pets.tsx#L34-L38) | lista de pets (`PETS_MOCK`) | ⚠️ mockado (array vazio); tela não usa `usePets` |
| [pets.tsx](src/app/(tabs)/pets.tsx) | formulário de cadastro de pet | ⚠️ inexistente; botão "Adicionar novo pet" sem ação |
| [pets.tsx:19](src/app/(tabs)/pets.tsx#L19) | `idade` (string formatada) vs `dataNascimento` do schema | ⚠️🔀 divergência a resolver |
| [pets.tsx:22](src/app/(tabs)/pets.tsx#L22) | `saudavel` (boolean "Em dia/Atenção") | ⚠️❓ não existe no schema/API |
| [clinica.tsx:20-26](src/app/(tabs)/clinica.tsx#L20-L26) | lista de clínicas (`CLINICAS_MOCK`) | ⚠️ mockado; tela não usa `useClinicas` |
| [clinica.tsx:43-47](src/app/(tabs)/clinica.tsx#L43-L47) | ação "Vincular" | ⚠️ só estado local; não chama `POST /clinicas/vincular` nem `completeStep("clinicLinked")` |
| [clinica.schema.ts:14](src/schemas/clinica.schema.ts#L14) | `usuarioId` em `VincularClinicaInput` | ❓ sessão não expõe id numérico do usuário |
| [profile.tsx:66](src/app/profile.tsx#L66) | `whatsappNotif` (toggle notificações WhatsApp) | ⚠️ estado local, sem persistência/endpoint |
| [(tabs)/assistente.tsx](src/app/(tabs)/assistente.tsx) | tela do Assistente | ⚠️ placeholder "Em breve" |
| [register.tsx](src/app/register.tsx) & [useAuth.ts](src/hooks/useAuth.ts) | duplicação: `register.tsx` tem `useMutation` inline em vez de `useRegister()`; `login.tsx` idem vs `useLogin()` | organização a alinhar com CLAUDE.md |
| [usuario.schema.ts](src/schemas/usuario.schema.ts) | `UsuarioSchema` / `UpdateUsuarioSchema` (`nome`, `email`, `telefone`, `cpf` length 14) | ❓ definido mas não referenciado por nenhuma tela/hook/service |
| [AuthContext.tsx](src/context/AuthContext.tsx) | `signIn`, `signOut` Firebase | ⚠️ stubs vazios |

---

## 7. Resumo para o Backend

> Nomenclatura da API observada no código: **português** (`nome`, `senha`, `telefone`, `dataNascimento`). Datas em string `DD/MM/AAAA`. Autenticação por **JWT Bearer**.

### POST /usuarios (cadastro)
**Recebe:**
```json
{
  "nome": "string (>=3)",
  "email": "string email (lowercase)",
  "cpf": "string 000.000.000-00 (CPF válido)",
  "telefone": "string  ex: '+55 99999-9999'",
  "dataNascimento": "string DD/MM/AAAA",
  "senha": "string (>=6)"
}
```
**Retorna:** irrelevante para o front hoje (só usa status). Deve retornar `201`. `409` se e-mail já cadastrado.
⚠️ Backend precisa decidir se `telefone` chega como string única (DDI + número) ou separado — hoje o front concatena.

### POST /auth/login
**Recebe:**
```json
{ "email": "string email", "senha": "string" }
```
**Retorna:**
```json
{
  "token": "JWT string",
  "usuario": {
    "id": "number",
    "nome": "string",
    "email": "string",
    "cpf": "string",
    "telefone": "string",
    "dataNascimento": "string DD/MM/AAAA"
  }
}
```
`401` em credenciais inválidas.
⚠️ O front hoje **não** guarda o `token` nem o `id` de forma persistente (ver seção 6). Idealmente retornar também o progresso de onboarding (`profileCompleted`, `petRegistered`, `clinicLinked`).

### GET /usuarios/me
**Retorna:** mesmo objeto `usuario` do login:
```json
{
  "id": "number",
  "nome": "string",
  "email": "string",
  "cpf": "string",
  "telefone": "string",
  "dataNascimento": "string"
}
```
Requer `Authorization: Bearer <token>`. `401` se token inválido/expirado.

### PUT /usuarios/me
**Recebe** (campos parciais):
```json
{ "nome": "string?", "email": "string?", "telefone": "string?" }
```
**Retorna:**
```json
{ "email": "string (novo e-mail efetivo)" }
```
`409` → e-mail em uso · `404` → usuário não encontrado.

### POST /usuarios/me/senha
**Recebe:**
```json
{ "senhaAtual": "string", "novaSenha": "string (>=6)" }
```
**Retorna:** status apenas. `401` → senha atual incorreta.

### (SUGERIDO) PUT /usuarios/me/perfil-completo — endereço + moradia
⚠️ Não existe no código; hoje descartado. Se implementado, receberia:
```json
{
  "tipoMoradia": "casa | apartamento",
  "telaProtecao": "sim | nao",
  "quantidadePets": "number (>=1)",
  "endereco": {
    "cep": "00000-000",
    "logradouro": "string",
    "numero": "string",
    "complemento": "string?",
    "bairro": "string",
    "cidade": "string",
    "estado": "string (UF, 2 chars)"
  }
}
```
**Retorna:** status de sucesso → front marca `profileCompleted`.

### POST /pets
**Recebe** (`CreatePetInput`, enviado cru):
```json
{
  "nome": "string (>=2)",
  "especie": "Cachorro | Gato | Coelho | Pássaro | Réptil | Outro",
  "raca": "string (>=2)",
  "sexo": "M | F",
  "peso": "string",
  "dataNascimento": "string"
}
```
**Retorna:** o `Pet` criado, incluindo `id: number` (mesma shape + `id`).
⚠️ Front hoje mostra `idade` e `saudavel` — backend precisa definir se `idade` é calculada de `dataNascimento` e o que determina `saudavel` (status de vacinas/consultas?).

### GET /pets
**Retorna:** array de `Pet`:
```json
[{ "id": 1, "nome": "...", "especie": "...", "raca": "...", "sexo": "M", "peso": "...", "dataNascimento": "..." }]
```
(Também: `GET /pets/:id`, `PUT /pets/:id` parcial, `DELETE /pets/:id`.)

### GET /clinicas
**Retorna:** array de `Clinica`:
```json
[{
  "id": 1,
  "nome": "string",
  "bairro": "string",
  "cidade": "string",
  "especialidade": "string",
  "vinculada": "boolean (relativo ao usuário autenticado)"
}]
```
(Também: `GET /clinicas/:id`.)

### POST /clinicas/vincular
**Recebe:**
```json
{ "clinicaId": "number", "usuarioId": "number" }
```
**Retorna:** status de sucesso → front invalida `["clinicas"]` (e deveria marcar `clinicLinked`).
⚠️ `usuarioId` deveria vir do token no backend, não do payload (o front não tem o id do usuário na sessão).

### DELETE /clinicas/vincular/:clinicaId
**Recebe:** `clinicaId` na URL. **Retorna:** status de sucesso.
