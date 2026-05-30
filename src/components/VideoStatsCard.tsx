import { Eye, ThumbsUp, MessageSquare, ExternalLink, Calendar, User } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import type { VideoStats } from "@/lib/mcp-bancos.server";

function formatNumber(n: number | null): string {
  if (n === null) return "—";
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString("pt-BR");
}

function formatDate(iso?: string): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

type Props = { stats: VideoStats };

export function VideoStatsCard({ stats }: Props) {
  const published = formatDate(stats.publishedAt);

  const kpis = [
    { label: "Views", value: stats.views, Icon: Eye },
    { label: "Likes", value: stats.likes, Icon: ThumbsUp },
    { label: "Comentários", value: stats.comments, Icon: MessageSquare },
  ];

  return (
    <Card className="overflow-hidden">
      <div className="aspect-video w-full overflow-hidden bg-muted">
        {stats.thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={stats.thumbnail}
            alt={stats.title}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : null}
      </div>
      <CardContent className="space-y-5 p-6">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold leading-tight text-foreground">
            {stats.title}
          </h2>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <User className="h-4 w-4" />
              {stats.channel}
            </span>
            {published ? (
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                {published}
              </span>
            ) : null}
            <a
              href={stats.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-primary hover:underline"
            >
              <ExternalLink className="h-4 w-4" />
              Ver no YouTube
            </a>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {kpis.map(({ label, value, Icon }) => (
            <div
              key={label}
              className="rounded-lg border bg-card p-4 text-center"
            >
              <Icon className="mx-auto mb-2 h-5 w-5 text-muted-foreground" />
              <div className="text-2xl font-bold tabular-nums text-foreground">
                {formatNumber(value)}
              </div>
              <div className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">
                {label}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}