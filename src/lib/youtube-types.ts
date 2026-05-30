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