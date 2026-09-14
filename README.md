# 🐾 Afetto

> "Não é um app de lembretes. É o sistema operacional do relacionamento contínuo entre clínica, tutor e pet."

## 📋 Sobre o Projeto

O **Afetto** é uma plataforma digital que acompanha a jornada contínua de saúde do pet, criando uma experiência proativa e personalizada para o tutor — via app mobile e integrado ao WhatsApp.

Desenvolvido como parte do **Challenge FIAP 2026** em parceria com a **CLYVO VET**, o projeto busca transformar a jornada de saúde animal de um modelo episódico e reativo para uma experiência contínua, preventiva, inteligente e integrada.

---

## 👥 Equipe

| Nome | RM |
|---|---|
| Gustavo Souto de Melo | RM 558595 |
| Iago Liziero Pereira | RM 564063 |
| Ícaro José Dos Santos | RM 562403 |
| Leonardo Barbosa Santos | RM 558230 |

---


## 🚀 Tecnologias Utilizadas

### Mobile
- [React Native](https://reactnative.dev/) + [Expo](https://expo.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [NativeWind](https://www.nativewind.dev/) — Tailwind CSS para React Native
- [Expo Router](https://expo.github.io/router/) — navegação baseada em rotas
- [TanStack Query](https://tanstack.com/query) — data fetching e cache
- [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) — formulários e validação
- [Axios](https://axios-http.com/) — cliente HTTP com sessão por cookie
- [AsyncStorage](https://react-native-async-storage.github.io/async-storage/) — persistência local

### Backend
- Java Spring Boot (desenvolvido na disciplina de Back-End)
- API REST em produção: `https://java-afetto-fork.onrender.com`
- Autenticação via sessão por cookie (JSESSIONID)

---

## 📱 Funcionalidades Implementadas

- ✅ Cadastro e login de usuário com autenticação real
- ✅ Persistência de sessão — usuário não precisa logar novamente ao reabrir o app
- ✅ Proteção de rotas — telas internas bloqueadas sem autenticação
- ✅ Logout com encerramento imediato da sessão
- ✅ CRUD completo de pets (criar, visualizar, editar, excluir)
- ✅ CRUD completo de vacinas por pet (criar, visualizar, editar, excluir)
- ✅ Histórico de vacinas ordenado por data
- ✅ Próximos cuidados calculados automaticamente
- ✅ Atualização automática da interface após cada operação

---

## 🏗️ Arquitetura do Projeto

```
src/
├── api/          # Instância Axios configurada (baseURL, withCredentials)
├── app/          # Rotas e telas (Expo Router)
│   └── (tabs)/   # Telas com barra de navegação
├── components/   # Componentes reutilizáveis (MeuInput, CardPet, etc.)
├── context/      # SessionContext — autenticação e sessão
├── hooks/        # Hooks TanStack Query (usePets, useVacinas, etc.)
├── schemas/      # Schemas de validação Zod
├── services/     # Funções de chamada HTTP
├── types/        # Interfaces e tipos TypeScript
└── utils/        # Helpers (máscaras, formatação de data, etc.)
```

---

## ⚙️ Como Executar o Projeto

### Pré-requisitos

- [Node.js](https://nodejs.org/) 22 LTS
- [Expo Go](https://expo.dev/client) instalado no celular **ou** emulador Android/iOS configurado

### Instalação

```bash
# Clone o repositório
git clone URL_DO_REPOSITORIO
cd afetto

# Instale as dependências
npm install

# Inicie o projeto
npx expo start
```

### Rodando no dispositivo

**Celular físico:**
Abra o Expo Go e escaneie o QR code exibido no terminal.

**Emulador Android:**
```bash
# Com o emulador aberto no Android Studio
npm run android
```

**Simulador iOS (apenas Mac):**
```bash
npm run ios
```

---

## 🔗 Links

- 🌐 API em produção: [https://java-afetto-fork.onrender.com](https://java-afetto-fork.onrender.com)
- 🎥 Vídeo de apresentação: [YouTube](https://youtu.be/KR2jA5o1Qxk?is=KUvByIYq8Iwi6upV)
---

## 📄 Licença

Projeto acadêmico desenvolvido para o Challenge FIAP 2026.
