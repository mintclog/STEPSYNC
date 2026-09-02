"use client";

import { useState } from "react";
import type { MusicPreferences } from "@/lib/types";

interface PreferencesStepProps {
  initialPreferences: MusicPreferences;
  onBack: () => void;
  onSubmit: (preferences: MusicPreferences) => void;
}

const GENRES = ["K-pop", "J-pop", "Rock", "Hip-hop", "EDM"];

function parseList(value: string): string[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 20);
}

export function PreferencesStep({ initialPreferences, onBack, onSubmit }: PreferencesStepProps) {
  const [genres, setGenres] = useState(initialPreferences.genres);
  const [excludedGenres, setExcludedGenres] = useState(initialPreferences.excluded_genres);
  const [likedArtists, setLikedArtists] = useState(initialPreferences.liked_artists.join(", "));
  const [excludedArtists, setExcludedArtists] = useState(initialPreferences.excluded_artists.join(", "));

  const toggle = (value: string, list: string[], setList: (next: string[]) => void) => {
    setList(list.includes(value) ? list.filter((item) => item !== value) : [...list, value]);
  };

  const submit = (skip: boolean) => {
    onSubmit(
      skip
        ? { genres: [], liked_artists: [], excluded_genres: [], excluded_artists: [] }
        : {
            genres,
            liked_artists: parseList(likedArtists),
            excluded_genres: excludedGenres,
            excluded_artists: parseList(excludedArtists),
          },
    );
  };

  return (
    <section aria-labelledby="preferences-title">
      <button type="button" onClick={onBack} className="mb-5 min-h-11 text-sm font-bold underline underline-offset-4">
        ← 목표 설정으로
      </button>
      <div className="mb-10 max-w-3xl">
        <p className="mb-3 text-xs font-black uppercase tracking-[0.2em] text-[#6C6C66]">Step 3 · Music taste · Optional</p>
        <h1 id="preferences-title" className="text-3xl font-black tracking-[-0.045em] sm:text-5xl">
          어떤 음악과 달리고 싶나요?
        </h1>
        <p className="mt-4 leading-7 text-[#5C5C56]">선택하지 않아도 러닝 기록과 목표만으로 추천받을 수 있습니다.</p>
      </div>

      <div className="grid gap-8 border-y border-[#D9D9D2] py-8 lg:grid-cols-2 lg:gap-16">
        <fieldset>
          <legend className="font-black">선호 장르</legend>
          <div className="mt-4 flex flex-wrap gap-2">
            {GENRES.map((genre) => (
              <button
                key={genre}
                type="button"
                aria-pressed={genres.includes(genre)}
                onClick={() => toggle(genre, genres, setGenres)}
                className={`min-h-11 rounded-[9px] border px-4 font-bold ${genres.includes(genre) ? "border-[#171717] bg-[#C7F000]" : "border-[#C8C8C0] bg-white"}`}
              >
                {genre}
              </button>
            ))}
          </div>
          <label className="mt-7 block font-black">
            좋아하는 아티스트
            <input
              type="text"
              value={likedArtists}
              onChange={(event) => setLikedArtists(event.target.value)}
              placeholder="예: NewJeans, The Weeknd"
              className="mt-3 min-h-12 w-full rounded-[10px] border border-[#C8C8C0] bg-white px-4 font-normal"
            />
            <span className="mt-2 block text-xs font-normal text-[#6C6C66]">여러 명은 쉼표로 구분</span>
          </label>
        </fieldset>

        <fieldset>
          <legend className="font-black">추천에서 제외</legend>
          <div className="mt-4 flex flex-wrap gap-2">
            {GENRES.map((genre) => (
              <button
                key={genre}
                type="button"
                aria-pressed={excludedGenres.includes(genre)}
                onClick={() => toggle(genre, excludedGenres, setExcludedGenres)}
                className={`min-h-11 rounded-[9px] border px-4 font-bold ${excludedGenres.includes(genre) ? "border-[#171717] bg-[#171717] text-white" : "border-[#C8C8C0] bg-white"}`}
              >
                {genre}
              </button>
            ))}
          </div>
          <label className="mt-7 block font-black">
            제외할 아티스트
            <input
              type="text"
              value={excludedArtists}
              onChange={(event) => setExcludedArtists(event.target.value)}
              placeholder="예: Artist A, Artist B"
              className="mt-3 min-h-12 w-full rounded-[10px] border border-[#C8C8C0] bg-white px-4 font-normal"
            />
            <span className="mt-2 block text-xs font-normal text-[#6C6C66]">여러 명은 쉼표로 구분</span>
          </label>
        </fieldset>
      </div>

      <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button type="button" onClick={() => submit(true)} className="min-h-14 rounded-[10px] border border-[#171717] px-7 font-bold">
          건너뛰기
        </button>
        <button type="button" onClick={() => submit(false)} className="min-h-14 rounded-[10px] bg-[#C7F000] px-8 font-black">
          내 러닝 음악 찾기 →
        </button>
      </div>
    </section>
  );
}
