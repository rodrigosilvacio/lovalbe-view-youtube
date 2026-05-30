import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { Youtube, Loader2, AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { VideoStatsCard } from "@/components/VideoStatsCard";
import { getVideoStats } from "@/lib/youtube.functions";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Cockpit YouTube — Estatísticas de vídeo" },
      {
        name: "description",
        content:
          "Cole a URL de um vídeo do YouTube e veja views, likes, comentários e metadados ao vivo.",
      },
      { property: "og:title", content: "Cockpit YouTube" },
      {
        property: "og:description",
        content: "Snapshot ao vivo das estatísticas de qualquer vídeo do YouTube.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const fetchStats = useServerFn(getVideoStats);
  const [url, setUrl] = useState("");

  const mutation = useMutation({
    mutationFn: (input: string) => fetchStats({ data: { url: input } }),
  });

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = url.trim();
    if (!trimmed) return;
    mutation.mutate(trimmed);
  };

  const result = mutation.data;
  const errorMessage =
    mutation.error instanceof Error
      ? mutation.error.message
      : result && !result.ok
        ? result.error
        : null;

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:py-16">
        <header className="mb-8 space-y-3 text-center">
          <div className="inline-flex items-center justify-center rounded-full bg-primary/10 p-3 text-primary">
            <Youtube className="h-6 w-6" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Cockpit YouTube
          </h1>
          <p className="mx-auto max-w-xl text-sm text-muted-foreground sm:text-base">
            Cole a URL de um vídeo e veja views, likes, comentários e metadados em tempo real.
          </p>
        </header>

        <Card className="mb-6">
          <CardContent className="p-4 sm:p-6">
            <form onSubmit={onSubmit} className="flex flex-col gap-3 sm:flex-row">
              <Input
                type="url"
                inputMode="url"
                placeholder="https://www.youtube.com/watch?v=..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
                maxLength={500}
                className="flex-1"
                disabled={mutation.isPending}
              />
              <Button
                type="submit"
                disabled={mutation.isPending || !url.trim()}
                className="sm:min-w-32"
              >
                {mutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Analisando...
                  </>
                ) : (
                  "Analisar"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {mutation.isPending ? (
          <Card className="overflow-hidden">
            <Skeleton className="aspect-video w-full" />
            <CardContent className="space-y-4 p-6">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <div className="grid grid-cols-3 gap-3">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
            </CardContent>
          </Card>
        ) : null}

        {!mutation.isPending && errorMessage ? (
          <Card className="border-destructive/40 bg-destructive/5">
            <CardContent className="flex items-start gap-3 p-4 text-sm text-destructive">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <div>
                <p className="font-medium">Não consegui buscar este vídeo</p>
                <p className="mt-1 text-destructive/80">{errorMessage}</p>
              </div>
            </CardContent>
          </Card>
        ) : null}

        {!mutation.isPending && result?.ok ? (
          <VideoStatsCard stats={result.stats} />
        ) : null}
      </div>
    </main>
  );
}
