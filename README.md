# Cockpit YouTube

Interface web para visualizar estatísticas de vídeos do YouTube em tempo real. Cole uma URL de vídeo e obtenha um snapshot instantâneo com views, likes, comentários e metadados.

## O que faz

O Cockpit YouTube é uma aplicação web de página única que permite consultar estatísticas de qualquer vídeo público do YouTube. Ao colar uma URL válida, o app retorna:

- **Thumbnail** do vídeo
- **Título** e **canal** do vídeo
- **Data de publicação**
- **Views**, **Likes** e **Comentários** formatados (ex: 1.2M, 45K)
- Link direto para assistir no YouTube

A consulta é feita sob demanda (snapshot manual) — não há histórico, cache ou banco de dados.

## Funcionalidades

- Validação de URLs do YouTube (suporta `youtube.com/watch?v=`, `youtu.be/`, `shorts/`, `embed/`, `live/`)
- Integração com MCP Bancos para obter dados do vídeo
- Interface responsiva com estados de loading (skeleton) e tratamento de erros
- Formatação numérica adaptada para português brasileiro

## Stack Tecnológica

- **Framework**: [TanStack Start](https://tanstack.com/start) com React 19
- **Roteamento**: TanStack Router
- **Estado do servidor**: TanStack Query
- **Estilização**: Tailwind CSS 4
- **Componentes UI**: shadcn/ui (Radix UI primitives)
- **Validação**: Zod
- **Runtime**: Vite 7 + Nitro (SSR)
- **Linguagem**: TypeScript

## Estrutura de Pastas

```
src/
├── components/
│   ├── ui/              # Componentes shadcn/ui (Button, Card, Input, etc.)
│   └── VideoStatsCard.tsx  # Card de exibição das estatísticas do vídeo
├── hooks/
│   └── use-mobile.tsx   # Hook para detecção de dispositivo móvel
├── lib/
│   ├── api/             # Server functions de exemplo
│   ├── mcp-bancos.server.ts  # Cliente MCP para consultar estatísticas
│   ├── youtube.functions.ts  # Server function getVideoStats
│   ├── youtube-types.ts      # Tipos TypeScript para VideoStats
│   ├── config.server.ts      # Configuração server-side
│   └── utils.ts              # Utilitários (cn para classes)
├── routes/
│   ├── __root.tsx       # Layout raiz da aplicação
│   └── index.tsx        # Página principal (Cockpit)
├── router.tsx           # Configuração do TanStack Router
├── server.ts            # Entry point do servidor SSR
├── start.ts             # Bootstrap da aplicação
└── styles.css           # Estilos globais (Tailwind)
```

## Instalação

```bash
# Instalar dependências (recomendado: bun)
bun install

# Ou com npm
npm install
```

## Executando

```bash
# Desenvolvimento
bun run dev
# ou
npm run dev

# Build de produção
bun run build
# ou
npm run build

# Preview do build
bun run preview
# ou
npm run preview
```

## Variáveis de Ambiente

O app requer as seguintes variáveis de ambiente para se conectar ao MCP Bancos:

- `MCP_BANCOS_URL` — URL do servidor MCP Bancos (HTTP)
- `MCP_BANCOS_TOKEN` — Token de autenticação do MCP Bancos

Crie um arquivo `.env` na raiz do projeto:

```env
MCP_BANCOS_URL=https://seu-servidor-mcp.exemplo.com
MCP_BANCOS_TOKEN=seu-token-aqui
```

> **Nota**: Sem essas variáveis configuradas, o app não conseguirá buscar estatísticas de vídeos.

## Lint e Formatação

```bash
# Verificar lint
bun run lint
# ou
npm run lint

# Formatar código
bun run format
# ou
npm run format
```
