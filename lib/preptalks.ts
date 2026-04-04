export type PrepTalk = {
  id?: string;
  title: string;
  youtubeUrl: string;
  weekDate: string; // "YYYY-MM-DD"
  description?: string | null;
  likes?: number;
  dislikes?: number;
  createdAt?: string;
};

export function extractYoutubeId(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
  );
  return match ? match[1] : null;
}
