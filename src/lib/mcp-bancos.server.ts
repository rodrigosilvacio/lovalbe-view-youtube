import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

export type VideoStats = {
  videoId: string;
  title: string;
  channel: string;
  channelUrl?: string;
  publishedAt?: string;
  thumbnail?: string;
  views: number | null;
  likes: number | null;
  comments: number | null;
  durationSeconds?: number | null;
  url: string;
};

function toNumber(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const cleaned = value.replace(/[^\d]/g, "");
    if (!cleaned) return null;
    const n = Number(cleaned);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function pickString(obj: Record<string, unknown> | undefined, keys: string[]): string | undefined {
  if (!obj) return undefined;
  for (const k of keys) {
    const v = obj[k];
    if (typeof v === "string" && v.length > 0) return v;
  }
  return undefined;
}

function pickNumberLike(
  obj: Record<string, unknown> | undefined,
  keys: string[],
): number | null {
  if (!obj) return null;
  for (const k of keys) {
    const n = toNumber(obj[k]);
    if (n !== null) return n;
  }
  return null;
}

function extractJsonFromToolResult(result: unknown): unknown {
  // MCP tool result has { content: [{ type: "text", text: "..." }, ...] }
  const content = (result as { content?: Array<{ type?: string; text?: string }> })?.content;
  if (!Array.isArray(content)) return result;
  for (const part of content) {
    if (part?.type === "text" && typeof part.text === "string") {
      try {
        return JSON.parse(part.text);
      } catch {
        // fall through; some tools return prose
      }
    }
  }
  return result;
}

async function callTool(client: Client, name: string, args: Record<string, unknown>) {
  const res = await client.callTool({ name, arguments: args });
  return extractJsonFromToolResult(res);
}

function digFirst(
  obj: unknown,
  keys: string[],
): Record<string, unknown> | undefined {
  if (!obj || typeof obj !== "object") return undefined;
  const rec = obj as Record<string, unknown>;
  for (const k of keys) {
    const v = rec[k];
    if (v && typeof v === "object") return v as Record<string, unknown>;
  }
  return undefined;
}

export async function fetchVideoStatsViaMcp(rawUrl: string): Promise<VideoStats> {
  const baseUrl = process.env.MCP_BANCOS_URL;
  const token = process.env.MCP_BANCOS_TOKEN;
  if (!baseUrl) throw new Error("MCP_BANCOS_URL is not configured");
  if (!token) throw new Error("MCP_BANCOS_TOKEN is not configured");

  const transport = new StreamableHTTPClientTransport(new URL(baseUrl), {
    requestInit: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });

  const client = new Client({ name: "youtube-cockpit", version: "1.0.0" });

  try {
    await client.connect(transport);

    // Step 1: resolve URL -> videoId
    const resolved = await callTool(client, "youtube_resolve_url", { url: rawUrl });
    const resolvedData =
      digFirst(resolved, ["data", "result"]) ?? (resolved as Record<string, unknown>);
    const videoId =
      pickString(resolvedData, ["videoId", "video_id", "id"]) ??
      pickString(resolved as Record<string, unknown>, ["videoId", "video_id", "id"]);
    if (!videoId) {
      throw new Error("Não foi possível extrair o videoId da URL informada.");
    }

    // Step 2: download metadata (formats + stats)
    const downloaded = await callTool(client, "youtube_download", { id: videoId });

    const root = (downloaded ?? {}) as Record<string, unknown>;
    const data =
      digFirst(root, ["data", "result", "video", "videoDetails"]) ?? root;
    const details =
      digFirst(data, ["videoDetails", "video", "details", "meta", "metadata"]) ?? data;
    const stats =
      digFirst(data, ["stats", "statistics"]) ??
      digFirst(details, ["stats", "statistics"]) ??
      details;
    const channelObj =
      digFirst(data, ["channel", "author", "owner"]) ??
      digFirst(details, ["channel", "author", "owner"]);
    const thumbsContainer =
      digFirst(details, ["thumbnail", "thumbnails"]) ??
      digFirst(data, ["thumbnail", "thumbnails"]);
    let thumbnail: string | undefined;
    if (thumbsContainer) {
      const arr = (thumbsContainer as { thumbnails?: unknown }).thumbnails;
      if (Array.isArray(arr) && arr.length > 0) {
        const last = arr[arr.length - 1] as { url?: string };
        thumbnail = last?.url;
      } else {
        thumbnail = pickString(thumbsContainer, ["url"]);
      }
    }
    if (!thumbnail) {
      thumbnail = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
    }

    const title =
      pickString(details, ["title", "name"]) ??
      pickString(data, ["title"]) ??
      "Vídeo do YouTube";
    const channel =
      pickString(channelObj, ["name", "title", "author"]) ??
      pickString(details, ["author", "channelTitle", "ownerChannelName"]) ??
      "Canal desconhecido";
    const channelUrl =
      pickString(channelObj, ["url", "channelUrl", "canonicalBaseUrl"]) ?? undefined;
    const publishedAt =
      pickString(details, ["publishedAt", "published_at", "publishDate", "uploadDate", "datePublished"]) ??
      pickString(data, ["publishedAt", "publishDate", "uploadDate"]);

    const views = pickNumberLike(stats, ["viewCount", "views", "view_count"]);
    const likes = pickNumberLike(stats, ["likeCount", "likes", "like_count"]);
    const comments = pickNumberLike(stats, [
      "commentCount",
      "comments",
      "comment_count",
    ]);
    const durationSeconds = pickNumberLike(details, [
      "lengthSeconds",
      "duration",
      "durationSeconds",
    ]);

    return {
      videoId,
      title,
      channel,
      channelUrl,
      publishedAt,
      thumbnail,
      views,
      likes,
      comments,
      durationSeconds,
      url: `https://www.youtube.com/watch?v=${videoId}`,
    };
  } finally {
    try {
      await client.close();
    } catch {
      // ignore
    }
  }
}