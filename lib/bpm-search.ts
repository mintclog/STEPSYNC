import { z } from "zod";
import type { MusicCandidate, RhythmAnalysis } from "@/lib/types";

export class BpmSearchError extends Error {
  constructor(public readonly missingKey = false) {
    super(missingKey
      ? "GETSONGBPM_API_KEY가 설정되지 않았습니다. .env.local에 GETSONGBPM_API_KEY를 설정하고 서버를 재시작해주세요."
      : "음악 BPM 검색에 실패했습니다. GetSongBPM 키와 사용 한도를 확인한 후 다시 시도해주세요.");
  }
}

const songSchema = z.object({
  song_title: z.string().trim().min(1),
  song_uri: z.string().url(),
  tempo: z.union([z.number(), z.string().regex(/^\d+(\.\d+)?$/)])
    .transform(Number).pipe(z.number().min(40).max(220)),
  artist: z.object({
    name: z.string().trim().min(1),
    genres: z.array(z.string()).nullish(),
  }),
});

export function normalizeBpmSongs(value: unknown, bpm: number): MusicCandidate[] {
  const envelope = z.object({ tempo: z.array(z.unknown()) }).safeParse(Array.isArray(value) ? { tempo: value } : value);
  if (!envelope.success) throw new BpmSearchError();
  return envelope.data.tempo.flatMap((item) => {
    const parsed = songSchema.safeParse(item);
    if (!parsed.success || parsed.data.tempo !== bpm) return [];
    const song = parsed.data;
    const url = new URL(song.song_uri);
    if (url.protocol !== "https:" || url.hostname !== "getsongbpm.com" || !url.pathname.startsWith("/song/")) return [];
    return [{
      title: song.song_title,
      artist: song.artist.name,
      bpm: song.tempo,
      // A single provider does not constitute independent cross-verification.
      bpm_confidence: "medium" as const,
      genres: song.artist.genres ?? [],
      // Tempo responses do not provide measured energy or artwork.
      energy_profile: "balanced" as const,
      album_art_url: null,
      verification_sources: [{ title: "GetSongBPM", url: url.toString() }],
    }];
  });
}

export function searchTempos(profile: RhythmAnalysis["music_profile"]): number[] {
  const values = new Set<number>();
  for (const [minimum, maximum] of [
    [profile.primary_bpm_min, profile.primary_bpm_max],
    [profile.half_time_bpm_min, profile.half_time_bpm_max],
  ]) {
    for (let bpm = Math.max(40, Math.ceil(minimum)); bpm <= Math.min(220, Math.floor(maximum)); bpm++) values.add(bpm);
  }
  return [...values];
}

// Bounded process-local metadata cache; no user records or credentials stored.
const cache = new Map<number, { expires: number; songs: MusicCandidate[] }>();

export async function searchBpmCandidates(profile: RhythmAnalysis["music_profile"]): Promise<MusicCandidate[]> {
  const key = process.env.GETSONGBPM_API_KEY?.trim();
  if (!key) throw new BpmSearchError(true);
  const candidates: MusicCandidate[] = [];
  const deadline = AbortSignal.timeout(30_000);
  for (const bpm of searchTempos(profile)) {
    const cached = cache.get(bpm);
    if (cached && cached.expires > Date.now()) {
      candidates.push(...cached.songs);
      continue;
    }
    try {
      const url = new URL("https://api.getsong.co/tempo/");
      url.searchParams.set("bpm", String(bpm));
      url.searchParams.set("limit", "250");
      const response = await fetch(url, {
        headers: { "X-API-KEY": key },
        signal: AbortSignal.any([deadline, AbortSignal.timeout(10_000)]),
        cache: "no-store",
        redirect: "error",
      });
      if (!response.ok) throw new BpmSearchError();
      const songs = normalizeBpmSongs(await response.json(), bpm);
      if (cache.size >= 200) cache.delete(cache.keys().next().value!);
      cache.set(bpm, { expires: Date.now() + 60 * 60 * 1000, songs });
      candidates.push(...songs);
    } catch {
      // Never expose upstream errors, request headers, or credentials.
      throw new BpmSearchError();
    }
  }
  return candidates;
}
