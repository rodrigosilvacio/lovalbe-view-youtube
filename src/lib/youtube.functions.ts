import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { fetchVideoStatsViaMcp, type VideoStats } from "./mcp-bancos.server";

const inputSchema = z.object({
  url: z
    .string()
    .trim()
    .min(1, "Informe uma URL")
    .max(500, "URL muito longa")
    .refine((v) => /youtu\.?be/i.test(v), {
      message: "Cole uma URL do YouTube válida",
    }),
});

export type GetVideoStatsResult =
  | { ok: true; stats: VideoStats }
  | { ok: false; error: string };

export const getVideoStats = createServerFn({ method: "POST" })
  .inputValidator((input) => inputSchema.parse(input))
  .handler(async ({ data }): Promise<GetVideoStatsResult> => {
    try {
      const stats = await fetchVideoStatsViaMcp(data.url);
      return { ok: true, stats };
    } catch (err) {
      console.error("getVideoStats failed", err);
      const message =
        err instanceof Error ? err.message : "Falha ao consultar o MCP Bancos";
      return { ok: false, error: message };
    }
  });