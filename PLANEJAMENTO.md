# Planejamento – Extensão Clockify

## 1. Objetivo do app

Construir um app em **Next.js (App Router)** que funcione como extensão ao Clockify, com as seguintes características principais:

- **Autenticação via OAuth2** usando **NextAuth** com um provider OAuth personalizado para o Clockify.
- **Listagem de time entries diretamente do Clockify** (Clockify é sempre a fonte de verdade).
- **Visualização das tarefas por dia**, com filtros básicos.
- **Exportação para um formato compatível com Excel**, usando TAB (`\t`) como separador entre colunas.
- **Persistência mínima de dados locais**, apenas para configurações como mapeamento de projetos (de/para), preferencialmente em IndexedDB e por trás de uma abstração de repositório.

---

## 2. Requisitos funcionais

1. **Autenticação (NextAuth + Clockify)**
   - Login via OAuth2, sem digitar API key manual.
   - Uso do **NextAuth** em `/api/auth/[...nextauth]/route.ts`.
   - Provider customizado para o Clockify, configurando:
     - endpoints de autorização, token e userinfo do Clockify;
     - `clientId`, `clientSecret`, `redirectUri` via variáveis de ambiente.
   - Estratégia de sessão **JWT** (sem banco de dados), para guardar apenas o necessário dos tokens.
   - Logout via NextAuth (`signOut`).

2. **Visualização de time entries por dia**
   - Filtro de **data** (date picker), default para o dia atual.
   - Consulta de **todas as time entries do dia diretamente na API do Clockify**.
   - Exibição em tabela com, no mínimo:
     - Descrição (ex.: `Task 101493: [...]` ou `Daily`).
     - Projeto (nome vindo do Clockify).
     - Projeto mapeado (valor de/para, se existir).
     - Duração em formato `H:MM` (ex.: `7:45`, `0:15`).
   - Possibilidade futura de filtros adicionais (workspace, cliente, tags).

3. **Exportação para Excel**
   - Botão **“Copiar formato Excel”**.
   - Geração de um texto onde cada linha representa uma time entry, por exemplo:
     - `Task 101493: [GDF-4020] [...] TREINAMENTO DO MODELO - Parte 4\tGEO ANA DOC\t\t\t\t\t7:45`
     - `Daily\tGEO ANA DOC\t\t\t\t\t0:15`
   - Uso de `navigator.clipboard.writeText` para copiar para a área de transferência.
   - Opcional: pré-visualização do texto gerado antes de copiar.

4. **De/para de projeto (mapeamento)**
   - Tela para configurar mapeamentos:
     - `Projeto Clockify` → `Valor para Excel`.
   - Aplicação do mapeamento no momento de gerar a tabela e o texto para Excel:
     - Se houver mapeamento para o projeto da entry, usar o valor mapeado.
     - Caso contrário, usar o nome original do projeto.

5. **Mínima persistência de dados**
   - **Não persistir time entries localmente**: sempre buscar direto do Clockify.
   - **Não armazenar tokens sensíveis em IndexedDB** ou localStorage.
   - Persistir somente dados de configuração local (p. ex. mapeamentos de projeto) no lado do cliente (IndexedDB) atrás de uma camada de abstração.

---

## 3. Requisitos não funcionais

- **Segurança**
  - Tokens de acesso/refresh tratados apenas no servidor, via NextAuth.
  - Uso de cookies HTTP-only/secure gerenciados pelo próprio NextAuth.
  - Nenhum token sensível armazenado em APIs públicas ou no front-end.

- **Simplicidade / Clean Code**
  - Camadas claras (domínio, aplicação, infraestrutura, UI).
  - Código preparado para troca futura de backend de dados sem grandes refactors.

- **Extensibilidade**
  - Facilitar futura troca de IndexedDB por banco server-side (Postgres, etc.).
  - Facilitar inclusão de novos tipos de mapeamentos ou preferências de usuário.

- **Experiência visual / Tema**
  - Interface simples, focada em legibilidade e poucos elementos em tela.
  - Tema escuro como base, com cores neon (por exemplo ciano, magenta, verde) para estados ativos, botões principais e destaques.
  - Garantir contraste adequado para não cansar a visão mesmo com cores neon.

---

## 4. Arquitetura proposta

### 4.1. Visão geral de pastas (conceitual)

- `app/`
  - `page.tsx` – dashboard principal (login, seleção de data, tabela de time entries, botão exportar).
  - `settings/projects/page.tsx` – tela de configuração de mapeamento de projetos.
  - `api/`
    - `auth/[...nextauth]/route.ts` – NextAuth (provider Clockify).
    - `clockify/time-entries/route.ts` – rota protegida que chama a API do Clockify para buscar time entries por dia.

- `src/domain/`
  - `project-mapping.ts` – tipos/entidades e interface de repositório para mapeamentos.

- `src/application/`
  - `project-mappings-service.ts` – orquestra as operações de mapeamento usando o repositório.

- `src/infra/db/indexeddb/`
  - `indexeddb-client.ts` – funções utilitárias para abrir DB, criar object stores, etc.
  - `project-mapping-indexeddb-repository.ts` – implementação concreta do repositório de mapeamento usando IndexedDB.

- `src/ui/components/`
  - `DatePicker.tsx`
  - `TimeEntriesTable.tsx`
  - `ExportButton.tsx`
  - `ProjectMappingForm.tsx`

> Observação: os nomes de arquivos/pastas são sugestões; podem ser ajustados ao padrão que já estiver usando.

---

### 4.2. Autenticação com NextAuth + Clockify

- Criar um provider personalizado do NextAuth para o Clockify em `authOptions`.
- Configurações principais:
  - `authorization: { url: CLOCKIFY_AUTH_URL, params: { scope, response_type: "code" } }`.
  - `token` endpoint para trocar `code` por `access_token` e `refresh_token`.
  - `userinfo` endpoint para obter dados básicos do usuário Clockify.
- Utilizar `session: { strategy: "jwt" }` para evitar DB adicional.
- Guardar no JWT apenas o mínimo:
  - `accessToken` (com expiração).
  - `refreshToken` (se disponível, e se for necessário para renovar).
  - `clockifyUserId` / `email`.
- Em `callbacks` do NextAuth, injetar `accessToken` no `token` e na `session` para uso nas rotas server-side.

---

### 4.3. Acesso ao Clockify (time entries)

- Criar route handler em `app/api/clockify/time-entries/route.ts`.
- Responsabilidades dessa rota:
  - Validar sessão NextAuth (`getServerSession`).
  - Obter `accessToken` do usuário autenticado.
  - Montar request para o endpoint de time entries do Clockify, filtrando por:
    - `workspaceId` (pode vir do usuário/tenant Clockify).
    - `date` (dia selecionado na interface).
  - Tratar paginação, se necessário, para garantir que todas as entries do dia sejam retornadas.
  - Normalizar o formato de resposta (DTO) para o front-end.

> Importante: **time entries não são armazenadas localmente**; sempre são carregadas do Clockify quando o usuário escolhe uma data.

---

## 5. Persistência local mínima (IndexedDB)

### 5.1. O que vai para IndexedDB

Apenas dados que não são sensíveis e que melhoram a experiência local do usuário, por exemplo:

- Mapeamentos de projeto (`ProjectMapping`):
  - `id`
  - `clockifyProjectId`
  - `clockifyProjectName`
  - `excelValue`

Opcionalmente, no futuro:

- Preferências de UI (última data consultada, colunas visíveis, etc.).

### 5.2. Interface de repositório (domínio)

Exemplo conceitual de interface `ProjectMappingRepository` no domínio:

- `listAll(): Promise<ProjectMapping[]>`
- `upsert(mapping: ProjectMapping): Promise<void>`
- `delete(id: string): Promise<void>`
- `findByClockifyProjectId(id: string): Promise<ProjectMapping | undefined>`

A UI e a camada de aplicação **não sabem** se a implementação é IndexedDB, arquivo, ou banco server-side: elas falam apenas com essa interface.

### 5.3. Implementação IndexedDB (infraestrutura)

- Criar um pequeno wrapper de IndexedDB (`indexeddb-client.ts`) com utilitários para:
  - Abrir o banco (ex.: nome `clockify-extension` e versão inicial).
  - Criar object store (ex.: `projectMappings`, chave `id`).
  - `getAll`, `put`, `delete`, `get` por chave.
- Implementar `ProjectMappingIndexedDbRepository` que usa esse wrapper e implementa a interface `ProjectMappingRepository`.
- Como IndexedDB só existe no browser, esse repositório será utilizado via componentes client-side ou hooks (ex.: `useProjectMappings`).

Quando for desejado trocar de tecnologia (por ex. migrar para Postgres/Prisma no servidor), basta:

- Criar uma nova implementação `ProjectMappingServerRepository`.
- Ajustar o codebase para injetar essa nova implementação no service.
- UI continua a falar apenas com o service do domínio/aplicação.

---

## 6. Telas e experiência do usuário

### 6.1. Home (`/`)

- **Estado não autenticado**:
  - Mensagem de boas-vindas.
  - Botão **“Conectar com Clockify”** (usando `signIn` do NextAuth com provider Clockify).

- **Estado autenticado**:
  - Cabeçalho com identificação básica do usuário e botão **Logout**.
  - Filtro de **data** (date picker) com default hoje.
  - Botão **“Carregar do Clockify”** ou carregamento automático ao mudar a data.
  - Tabela de time entries do dia com colunas:
    - Descrição.
    - Projeto (Clockify).
    - Projeto (mapeado).
    - Duração.
  - Botão **“Copiar formato Excel”** que gera e copia o texto com `\t` entre as colunas.
  - (Opcional) Pré-visualização do texto a ser colado no Excel.

### 6.2. Configuração de projetos (`/settings/projects`)

- Lista de projetos conhecidos (podem ser:
  - obtidos dinamicamente das time entries carregadas recentemente;
  - ou, em uma evolução futura, de um endpoint de projetos do Clockify).
- Para cada projeto:
  - Campo para definir `excelValue` (valor que será usado na exportação para Excel).
- Botão **Salvar** que chama o service de mapeamento, que por sua vez persiste no repositório (IndexedDB).

---

## 7. Geração do texto para Excel

- Função utilitária (lado do front-end) que recebe as time entries do dia e o mapa de mapeamentos de projeto.
- Para cada time entry:
  - Determinar `projetoExcel`:
    - Se houver mapeamento para `clockifyProjectId`, usar `excelValue`.
    - Senão, usar o nome original do projeto.
  - Converter a duração (em minutos ou segundos) para string `H:MM`.
  - Montar linha no formato:
    - `descricao\tprojetoExcel\t\t\t\t\tduracaoFormatada`.
- Unir todas as linhas com `\n` ao final.
- Copiar para clipboard usando API do navegador.

---

## 8. Roadmap de implementação (MVP)

1. **Limpar UI inicial**
   - Substituir conteúdo padrão de `app/page.tsx` por uma tela simples de login com Clockify (via NextAuth) e placeholder da tabela.

2. **Configurar NextAuth**
   - Criar `/app/api/auth/[...nextauth]/route.ts` com provider Clockify.
   - Adicionar variáveis de ambiente: `CLOCKIFY_CLIENT_ID`, `CLOCKIFY_CLIENT_SECRET`, `CLOCKIFY_REDIRECT_URI`, etc.
   - Testar fluxo de login/logout.

3. **Implementar rota de time entries**
   - `app/api/clockify/time-entries/route.ts` consumindo sessão NextAuth.
   - Chamar endpoint de time entries do Clockify filtrando por data.

4. **Montar tabela de time entries por dia**
   - Date picker + chamada à rota de time entries.
   - Exibir lista básica em tabela.

5. **Camada de persistência local (IndexedDB)**
   - Definir `ProjectMapping` no domínio.
   - Criar interface `ProjectMappingRepository`.
   - Implementar `ProjectMappingIndexedDbRepository`.

6. **Tela de configuração de projetos**
   - Página `/settings/projects` para listar/editar mapeamentos.
   - Integração com o repositório IndexedDB via service.

7. **Exportação para Excel**
   - Implementar utilitário de formatação de linhas.
   - Botão **“Copiar formato Excel”** e feedback visual de sucesso.

8. **Ajustes e refinamentos**
   - Mensagens de erro/estado vazio.
   - Pequenas melhorias de UX (loaders, toasts, etc.).

---

Este documento serve como guia de alto nível para o desenvolvimento da extensão Clockify, garantindo:

- Uso de **NextAuth** para OAuth2 com Clockify.
- **Time entries sempre vindas da API do Clockify**, sem replicação local.
- **Persistência mínima** (apenas configurações) em IndexedDB, atrás de uma camada de repositório, facilitando futuras mudanças de banco de dados.
