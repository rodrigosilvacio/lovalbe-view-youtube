
# Cockpit YouTube — Snapshot via MCP Bancos

Interface única onde você cola a URL de um vídeo do YouTube e o app retorna views, likes, comentários e metadados (título, canal, thumbnail, data de publicação). Sem histórico nem banco de dados — apenas snapshot ao vivo.

## Como o MCP entra no app rodando

As ferramentas do MCP Bancos (`youtube_*`) só são executáveis por mim, o agente, durante o build. Para o app publicado consultar o mesmo backend, criamos um **cliente MCP no servidor do app** que conecta no MCP Bancos via HTTP e chama `youtube_resolve_url` + `youtube_download` (que traz metadados/estatísticas do vídeo). Assim a fonte de dados é literalmente o mesmo MCP.

Para isso preciso de dois segredos do MCP Bancos (configurados depois que você aprovar o plano):
- `MCP_BANCOS_URL` — URL HTTP do servidor MCP Bancos
- `MCP_BANCOS_TOKEN` — token de acesso (o mesmo gerado pelo `authenticate`)

Sem esses, o app não consegue falar com o MCP em runtime. Se você não tiver/quiser expor esses dados, a alternativa honesta é YouTube Data API v3 (chave gratuita do Google Cloud).

## Telas

- `/` — Cockpit
  - Campo de input para colar a URL do vídeo
  - Botão "Analisar"
  - Card de resultado: thumbnail grande, título, canal, data de publicação, e 3 KPIs em destaque (Views, Likes, Comentários) com ícones e formatação numérica (1.2M, 45K)
  - Estado de loading com skeleton
  - Tratamento de erro (URL inválida, vídeo privado, MCP fora do ar)
  - Link "Ver no YouTube"

Mantenho o design system atual do projeto (não altero `src/styles.css`), uso componentes shadcn já instalados (Card, Input, Button, Skeleton).

## Arquivos

- `src/routes/index.tsx` — substitui placeholder pelo cockpit
- `src/components/VideoStatsCard.tsx` — card com KPIs e metadados
- `src/lib/youtube.functions.ts` — `createServerFn` `getVideoStats({ url })`
- `src/lib/mcp-bancos.server.ts` — cliente MCP (AI SDK `@ai-sdk/mcp` HTTP transport) que chama `youtube_resolve_url` e `youtube_download`, normaliza a resposta para `{ videoId, title, channel, publishedAt, thumbnail, views, likes, comments }`

## Detalhes técnicos

- Validação da URL com Zod no server function (aceita `youtube.com/watch?v=`, `youtu.be/`, `shorts/`)
- Server function chama o MCP, fecha o cliente no `finally`
- Erros do MCP retornam mensagem amigável ao cliente (sem vazar token)
- Sem cache — toda chamada é fresh, conforme escopo "snapshot manual"

## Fora do escopo

- Histórico, gráfico de evolução, lista de vídeos salvos, auto-refresh, autenticação — você optou por snapshot manual.
