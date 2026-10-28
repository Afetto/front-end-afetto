# 🐾 Afetto

> "Não é um app de lembretes. É o sistema operacional do relacionamento contínuo entre clínica, tutor e pet."

Aplicativo mobile (React Native + Expo) do **Challenge FIAP 2026**, em parceria com a **CLYVO VET**.

| | |
|---|---|
| 📱 App publicado | Firebase App Distribution (o professor recebe o convite de tester por e-mail) |
| 🌐 API em produção | [https://java-afetto.onrender.com](https://java-afetto.onrender.com) · [Swagger](https://java-afetto.onrender.com/swagger-ui/index.html) |
| ☕ Repositório da API | [github.com/iagoliziero/java-afetto](https://github.com/iagoliziero/java-afetto) |
| 🎥 Vídeo da Sprint 4 | _(link do YouTube — adicionar antes da entrega)_ |
| 🎥 Vídeo da Sprint 3 | [YouTube](https://youtu.be/KR2jA5o1Qxk?is=KUvByIYq8Iwi6upV) |

---

## 👥 Equipe

| Nome | RM |
|---|---|
| Gustavo Souto de Melo | RM 558595 |
| Iago Liziero Pereira | RM 564063 |
| Ícaro José dos Santos | RM 562403 |
| Leonardo Barbosa Santos | RM 558230 |

---

## 📋 O problema e a solução

**O problema.** A saúde do pet costuma ser cuidada de forma episódica: o tutor só lembra da clínica quando algo dá errado. As datas de vacina e de próxima dose ficam em carteirinhas de papel, os remédios em uso são controlados de cabeça e o histórico se perde entre consultas. A clínica, por sua vez, não acompanha o pet entre uma visita e outra.

**A solução.** O Afetto reúne em um só lugar a vida de saúde do pet e transforma isso em cuidado contínuo e preventivo:

- **Histórico completo** de vacinas, remédios e consultas de cada pet, com calendário mês a mês.
- **Lembretes** no próprio celular de vacinas, remédios e consultas, na véspera de cada cuidado.
- **Clínicas parceiras** perto do tutor, com avaliações, favoritas e **agendamento** em horários livres de verdade.
- **Assistente** que responde, com os dados reais do pet, perguntas como "quando é a próxima vacina?" ou "tem remédio para dar hoje?".

---

## 📱 Funcionalidades

### Conta e sessão
- Cadastro com validação (CPF, data, e-mail) que **já entra no app**, sem precisar fazer login depois.
- Login com mensagem clara para senha errada; sessão por cookie que dura **7 dias** (fechar e abrir o app não pede login).
- **Esqueci a senha** sem e-mail: o tutor confirma e-mail, CPF e data de nascimento e define a senha nova.
- Rotas protegidas: sem sessão, o app volta para o login; se a sessão cair (API reiniciada), também.

### Início
- Checklist de primeiros passos com barra de progresso, calculado pela API: **finalizar cadastro**, **cadastrar pet** e **vincular clínica** (opcional, concluído ao favoritar uma clínica).
- Com o cadastro pronto: atalhos, compromissos dos próximos 14 dias de todos os pets e remédios em tratamento hoje.

### Pets e cuidados
- Cadastro, edição e exclusão de pets, com detalhe e **próximos cuidados**.
- **Vacinas, remédios e consultas** (registrar, editar, cancelar consulta agendada, excluir).
- **Histórico** em linha do tempo com filtros (todos, vacinas, consultas, remédios).
- **Calendário** do pet, mês a mês, com os cuidados de cada dia.

### Clínicas parceiras
- Lista com a **mais perto primeiro** (pelo endereço do "Finalizar cadastro"), busca por nome e filtro de favoritas.
- Detalhe com contato, endereço, horário de funcionamento, equipe e **avaliações** (nota de 1 a 5 e comentário).
- **Agendamento**: escolhe o pet, o dia e um horário livre da clínica; a consulta vai para o histórico do pet.

### Assistente
- Perguntas prontas respondidas com os dados reais do pet: próxima vacina, remédios de hoje, próxima consulta e se a vacinação está em dia.
- Cada resposta leva para a tela relacionada (histórico, registrar vacina, adicionar remédio, agendar). Não usa IA nem serviço pago.

### Perfil
- Dados pessoais, moradia e endereço (com busca de CEP), alterar senha (confere a senha atual) e sair.
- **Tema claro, escuro ou do sistema**.
- **Sobre o App**: versão, número do build, ambiente e **hash do commit** da versão instalada.

---

## 🔔 Notificações locais: lembretes de cuidados

| | |
|---|---|
| **Evento que dispara** | Salvar um cuidado com data futura: **vacina** (aplicação agendada ou próxima dose), **remédio** (dia em que o tratamento começa) ou **consulta** (registrada no pet ou agendada numa clínica parceira). Editar reagenda; excluir o cuidado, cancelar a consulta ou excluir o pet cancela. |
| **Quando aparece** | Na hora, a confirmação **"Lembrete agendado"** com o dia do aviso. Depois, o lembrete na véspera do cuidado, às 9h. Se a véspera já passou, no dia, às 9h; se já passou das 9h do dia, na hora. |
| **Ao tocar** | Abre o **histórico do pet** (com o app aberto, em segundo plano ou fechado). |
| **Permissão** | Pedida na primeira vez que há um lembrete para agendar. Se negada, o cuidado é salvo normalmente. |
| **Sem lembrete** | Cuidado sem data futura é só registro: vacina aplicada hoje ou antes sem próxima dose, remédio que já começou, consulta que já passou ou foi cancelada. |

Feita com `expo-notifications`, agendada no próprio aparelho (não depende de servidor de push).

---

## 🚀 Tecnologias

| Área | Bibliotecas |
|---|---|
| Base | React Native 0.81, Expo 54, TypeScript |
| Navegação | Expo Router (rotas por arquivo, **rotas tipadas**) |
| Estilo | NativeWind (Tailwind CSS) com tema claro/escuro |
| Dados da API | TanStack Query (cache e atualização), Axios (sessão por cookie) |
| Formulários | React Hook Form + Zod |
| Notificações | expo-notifications (locais) |
| Armazenamento local | AsyncStorage (dados da sessão e tema) |
| Versão instalada | expo-application (número do build do APK) e expo-constants |
| Testes | Jest (jest-expo) + React Native Testing Library |

---

## 🏗️ Arquitetura

```
src/
├── app/          # Telas (Expo Router): (auth) antes do login, (tabs) abas, (app) telas internas
├── components/   # Componentes reutilizáveis (cards, estados de vazio/erro, formulários compartilhados)
├── hooks/        # Hooks de dados (TanStack Query) e hooks de tela (formulários)
├── services/     # Chamadas HTTP e conversão formulário ⇄ API (datas DD/MM/AAAA ⇄ YYYY-MM-DD)
├── schemas/      # Schemas Zod e tipos
├── context/      # Sessão (SessaoContext) e tema (TemaContext)
├── api/          # Cliente Axios (endereço da API, tempo limite, sessão expirada)
├── utils/        # Funções puras: datas, máscaras, lembrete, onboarding, respostas do Assistente
└── __tests__/    # Testes
```

- **Telas não fazem HTTP:** leitura com `useQuery` e escrita com `useMutation`, sempre por hooks; os hooks chamam os services.
- **Regras de negócio em funções puras e testadas** (`utils/`): quando lembrar de uma vacina, progresso do onboarding, respostas do Assistente.
- **Formulários de cuidado sem repetição:** vacina, remédio e consulta usam o mesmo hook (`useFormularioCuidado`) e o mesmo componente (`FormularioCuidado`); cada tela só declara os campos.
- O `CLAUDE.md` na raiz descreve as convenções do projeto em detalhe.

---

## ⚙️ Como executar

### Pré-requisitos
- [Node.js](https://nodejs.org/) 22 LTS
- [Expo Go](https://expo.dev/go) no celular **ou** um emulador Android

### Instalação

```bash
git clone https://github.com/Afetto/front-end-afetto.git
cd front-end-afetto
npm install
```

### Escolha a API (arquivo `.env`)

Copie o `.env.example` para `.env` e deixe **uma** das opções:

| Onde o app roda | Qual API | O que pôr no `.env` |
|---|---|---|
| Celular ou emulador | **API no Render** (mais simples) | `EXPO_PUBLIC_API_URL=https://java-afetto.onrender.com` |
| Emulador Android | API local (no seu PC) | `EXPO_PUBLIC_API_URL=http://10.0.2.2:8080` |
| Celular com Expo Go (mesma rede Wi-Fi) | API local | nada — o app usa sozinho o IP do PC que roda o Expo |
| Navegador | API local | nada — usa `localhost:8080` |

Para rodar a API local, veja o README do [repositório da API](https://github.com/iagoliziero/java-afetto) (porta 8080). No celular com a API local, o Windows pode bloquear a porta 8080: se o app não conectar, libere-a no Firewall do Windows.

### Rodar

```bash
npx expo start -c
```

Escaneie o QR code com o Expo Go ou tecle `a` para abrir no emulador Android. O `-c` limpa o cache — necessário sempre que mudar o `.env`.

### ⚠️ Sobre a API no Render

- **Primeiro acesso lento:** no plano gratuito, a API "dorme" depois de 15 minutos sem uso e leva cerca de 1 minuto para acordar. O app espera até 90 segundos e mostra **"Conectando ao servidor…"** nesse tempo.
- **Dados temporários:** a API usa banco **H2 em memória**. Quando ela reinicia (depois de dormir ou de um deploy), as contas e os dados cadastrados são apagados — as clínicas parceiras voltam sozinhas. Para avaliar, **crie uma conta e faça o teste na mesma sessão**; se o login passar a dizer "E-mail ou senha incorretos", a API reiniciou: é só cadastrar de novo.

---

## 🧪 Testes

```bash
npx jest          # 35 suítes, 217 testes (HTTP mockado; services, hooks e telas rodam de verdade)
npx tsc --noEmit  # checagem de tipos, incluindo as rotas
```

As rotas tipadas são geradas pelo Expo em `.expo/types`: num clone novo, rode `npx expo start` uma vez antes do `tsc`.

---

## 📦 Publicação e versão

O app instalável (APK Android, pacote `br.fiap.mad.afetto`) é gerado pelo **EAS Build** e distribuído pelo **Firebase App Distribution**, com o e-mail institucional do professor cadastrado como tester. Só para o App Distribution, o app não precisa do SDK do Firebase.

```bash
npx eas-cli@latest login
npx eas-cli@latest whoami                                       # confere a conta Expo usada
npx eas-cli@latest build:configure                              # 1ª vez: vincula o projeto ao EAS (o eas.json já existe)
npx eas-cli@latest build --platform android --profile preview   # gera o APK a partir do último commit
```

- **Perfil `preview`** (`eas.json`): APK de distribuição interna, que roda sem o Metro. Já leva `EXPO_PUBLIC_API_URL=https://java-afetto.onrender.com` e `EXPO_PUBLIC_APP_ENV=preview`. Sem a URL da API em `https`, o build para com um aviso (`app.config.ts`), para não gerar um app que não acha a API.
- **Número do build:** o EAS controla o `versionCode` (`appVersionSource: "remote"`) e aumenta a cada build do `preview` (`autoIncrement`). A versão visível é o `version` do `app.json`.
- **No Firebase:** app Android com o mesmo pacote `br.fiap.mad.afetto` → **App Distribution** → envio do APK, notas da versão (o que testar e o hash do commit) e o professor em **Testers & Groups**. O tester aceita o convite com a conta Google e instala pelo Firebase App Tester.
- **Perfil → Sobre o App** mostra a versão, o **número do build** (lido do APK com `expo-application`), o **ambiente** (`preview`) e o **hash do commit** de onde o APK foi gerado (lido no build, nunca escrito à mão). O hash deve ser igual ao último commit deste repositório (`git log -1`): é assim que se confere que o app publicado é o mesmo código.

---

## 📄 Licença

Projeto acadêmico desenvolvido para o Challenge FIAP 2026.
