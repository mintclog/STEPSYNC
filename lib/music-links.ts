export function buildMusicSearchLinks(title: string, artist: string) {
  const query = encodeURIComponent(`${title} ${artist}`.trim());
  return {
    spotify: `https://open.spotify.com/search/${query}`,
    appleMusic: `https://music.apple.com/us/search?term=${query}`,
    youtubeMusic: `https://music.youtube.com/search?q=${query}`,
  };
}

export function safeHttpsUrl(value: string | null): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}
