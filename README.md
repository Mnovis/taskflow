# TaskFlow

Aplicativo colaborativo de gestão de tarefas, estilo Trello simplificado, com quadros (boards), colunas, cards com drag-and-drop e atualizações em tempo real entre usuários.

Projeto construído para portfólio, com foco em arquitetura em camadas, tipagem ponta a ponta e boas práticas de um app fullstack em produção (autenticação com rotação de token, validação compartilhada com Zod, testes de integração e de componente).

<!--
  📸 PLACEHOLDER: adicionar aqui um GIF ou prints do app em uso.
  Sugestão de cena: login → dashboard com boards → arrastar um card
  entre colunas → abrir em duas abas lado a lado mostrando o update
  em tempo real na segunda aba.

  ![Demo do TaskFlow](./docs/demo.gif)
-->

## Índice

- [Funcionalidades](#funcionalidades)
- [Stack e decisões técnicas](#stack-e-decisões-técnicas)
- [Arquitetura](#arquitetura)
- [Como rodar localmente](#como-rodar-localmente)
- [Variáveis de ambiente](#variáveis-de-ambiente)
- [Testes](#testes)
- [Estrutura de pastas](#estrutura-de-pastas)

## Funcionalidades

- Registro e login com senha hasheada (bcrypt) e sessão via JWT (access token curto + refresh token em cookie `httpOnly`, com rotação automática)
- Criar, editar e excluir boards
- Colunas e cards dentro de cada board, com drag-and-drop entre colunas (`dnd-kit`)
- Cards com título, descrição, responsável, data de entrega e prioridade (baixa/média/alta)
- Convite de colaboradores por e-mail (adiciona um usuário já cadastrado ao board)
- Atualizações em tempo real via WebSocket: quando alguém move ou edita um card, todo mundo conectado ao mesmo board vê a mudança instantaneamente, sem recarregar a página

## Stack e decisões técnicas

| Camada | Tecnologia | Por quê |
|---|---|---|
| Frontend | React + Vite + TypeScript | Build rápido, HMR instantâneo, tipagem estática ponta a ponta |
| Estilo | Tailwind CSS | Consistência visual sem CSS solto, produtividade em componentes pequenos |
| Estado de servidor | React Query | Cache, revalidação e updates otimistas "de graça" — evita reinventar loading/error state a mão |
| Estado de cliente | Zustand | Sessão do usuário é o único estado global real do app; dispensa a verbosidade do Redux |
| Drag-and-drop | dnd-kit | Acessível (suporte a teclado), sem dependência de HTML5 Drag and Drop API (que tem comportamento inconsistente entre navegadores) |
| Backend | Node.js + Express + TypeScript | Ecossistema maduro, fácil de justificar em entrevista técnica, integra bem com Socket.io |
| Banco | PostgreSQL + Prisma | Relacional é a escolha certa pro domínio (boards → colunas → cards, tudo com FKs claras); Prisma dá migrations versionadas e client tipado a partir do schema |
| Autenticação | JWT (access + refresh) | Access token curto em memória (nunca em localStorage, mitiga XSS); refresh token em cookie `httpOnly` com rotação a cada uso |
| Realtime | Socket.io | Fallback automático de transporte, salas (rooms) nativas por board, e autenticação de handshake fácil de integrar com o mesmo JWT do REST |
| Validação | Zod (nos dois lados) | Um único formato de schema, usado tanto pro middleware de validação do Express quanto pros formulários do React — evita mismatch entre o que o front manda e o que o back espera |
| Testes | Jest + Supertest (backend), Vitest + Testing Library (frontend) | Testes de integração batendo nas rotas reais (com banco de teste), e testes de componente focados em comportamento do usuário, não em detalhes de implementação |

## Arquitetura

**Backend** em camadas estritas, cada uma com uma única responsabilidade:

```
routes → controllers → services → repositories → Prisma → PostgreSQL
```

- **routes**: só definem o caminho HTTP e encadeiam middlewares (auth, validação)
- **controllers**: extraem dados do `req`, chamam a service, formatam a resposta — nunca contêm regra de negócio
- **services**: regra de negócio e autorização (ex: "só o dono do board pode convidar alguém")
- **repositories**: única camada que importa o `PrismaClient` — se um dia trocar de ORM, só essa camada muda

Erros são tratados por um middleware central único (`error.middleware.ts`), e toda entrada de rota passa por validação Zod antes de chegar ao controller.

**Frontend** organizado por responsabilidade, não por tipo de arquivo:

- **hooks/**: toda lógica reutilizável de estado e efeitos colaterais vive aqui — os componentes de página ficam finos, só orquestrando UI
- **services/**: camada HTTP pura (axios), sem nenhuma lógica de estado
- **components/ui**: peças puramente visuais, sem acoplamento com a API
- **components/board**: componentes específicos do domínio (Card, Column, etc.)

## Estrutura de pastas

```
taskflow/
├── backend/    # API REST + Socket.io (Express, Prisma, TypeScript)
└── frontend/   # SPA (React, Vite, TypeScript, Tailwind)
```

Ver a árvore completa de cada workspace em `backend/src` e `frontend/src`.
