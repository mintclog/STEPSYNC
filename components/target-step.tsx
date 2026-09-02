"use client";

import { useMemo, useState } from "react";
import { calculateDuration, formatDuration } from "@/lib/pace";
import type { TargetRun } from "@/lib/types";
import { validateTargetDistance, validateTargetPace } from "@/lib/validation";

interface TargetStepProps {
  initialTarget: TargetRun | null;
  onBack: () => void;
  onContinue: (target: TargetRun) => void;
}

const QUICK_DISTANCES = [
  { label: "3 km", value: 3 },
  { label: "5 km", value: 5 },
  { label: "10 km", value: 10 },
  { label: "Half", value: 21.0975 },
];

export function TargetStep({ initialTarget, onBack, onContinue }: TargetStepProps) {
  const [distance, setDistance] = useState(initialTarget?.distance_km ?? 10);
  const [paceMinutes, setPaceMinutes] = useState(
    initialTarget ? Math.floor(initialTarget.pace_sec_per_km / 60).toString() : "5",
  );
  const [paceSeconds, setPaceSeconds] = useState(
    initialTarget ? String(initialTarget.pace_sec_per_km % 60).padStart(2, "0") : "30",
  );
  const [error, setError] = useState("");
  const pace = Number(paceMinutes) * 60 + Number(paceSeconds);
  const duration = useMemo(() => calculateDuration(distance, pace), [distance, pace]);

  const submit = () => {
    if (!validateTargetDistance(distance)) {
      setError("목표 거리는 0.5~200km 사이로 입력해주세요.");
      return;
    }
    if (!validateTargetPace(pace)) {
      setError("목표 페이스는 2:00~20:00 /km 사이로 입력해주세요.");
      return;
    }
    if (Number(paceSeconds) < 0 || Number(paceSeconds) > 59 || duration === null) {
      setError("페이스의 초는 0~59 사이로 입력해주세요.");
      return;
    }
    setError("");
    onContinue({ distance_km: distance, pace_sec_per_km: pace, estimated_duration_seconds: duration });
  };

  return (
    <section aria-labelledby="target-title">
      <button type="button" onClick={onBack} className="mb-5 min-h-11 text-sm font-bold underline underline-offset-4">
        ← 러닝 기록으로
      </button>
      <div className="mb-10 max-w-3xl">
        <p className="mb-3 text-xs font-black uppercase tracking-[0.2em] text-[#6C6C66]">Step 2 · Your target</p>
        <h1 id="target-title" className="text-3xl font-black tracking-[-0.045em] sm:text-5xl">
          이번에는 얼마나, 어떤 페이스로 달리나요?
        </h1>
      </div>

      <div className="grid gap-10 border-y border-[#D9D9D2] py-8 lg:grid-cols-2 lg:gap-16 lg:py-12">
        <div>
          <h2 className="text-sm font-black uppercase tracking-[0.16em]">목표 거리</h2>
          <label className="mt-5 block">
            <span className="sr-only">목표 거리(km)</span>
            <span className="flex items-end border-b-2 border-[#171717] pb-3">
              <input
                type="number"
                inputMode="decimal"
                min="0.5"
                max="200"
                step="0.1"
                value={distance}
                onChange={(event) => setDistance(Number(event.target.value))}
                className="number-face min-w-0 flex-1 bg-transparent text-6xl font-black outline-none sm:text-8xl"
              />
              <span className="pb-2 text-xl font-bold text-[#6C6C66]">km</span>
            </span>
          </label>
          <div className="mt-5 grid grid-cols-4 gap-2">
            {QUICK_DISTANCES.map((option) => (
              <button
                key={option.label}
                type="button"
                onClick={() => setDistance(option.value)}
                className={`min-h-11 rounded-[9px] border px-2 text-sm font-bold ${distance === option.value ? "border-[#171717] bg-[#C7F000]" : "border-[#C8C8C0] bg-white"}`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-sm font-black uppercase tracking-[0.16em]">목표 페이스</h2>
          <div className="mt-5 flex items-end border-b-2 border-[#171717] pb-3">
            <label className="min-w-0 flex-1">
              <span className="sr-only">목표 페이스 분</span>
              <input
                type="number"
                inputMode="numeric"
                min="2"
                max="20"
                value={paceMinutes}
                onChange={(event) => setPaceMinutes(event.target.value)}
                className="number-face w-full bg-transparent text-right text-6xl font-black outline-none sm:text-8xl"
              />
            </label>
            <span className="number-face px-2 pb-1 text-5xl font-black sm:text-7xl">:</span>
            <label className="min-w-0 flex-1">
              <span className="sr-only">목표 페이스 초</span>
              <input
                type="number"
                inputMode="numeric"
                min="0"
                max="59"
                value={paceSeconds}
                onChange={(event) => setPaceSeconds(event.target.value)}
                onBlur={() => setPaceSeconds(String(Math.max(0, Number(paceSeconds) || 0)).padStart(2, "0"))}
                className="number-face w-full bg-transparent text-6xl font-black outline-none sm:text-8xl"
              />
            </label>
            <span className="pb-2 text-xl font-bold text-[#6C6C66]">/km</span>
          </div>
          <p className="mt-4 text-sm leading-6 text-[#6C6C66]">분과 초를 각각 입력하세요. 예상 시간은 코드에서 바로 계산합니다.</p>
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-6 bg-[#171717] p-6 text-white sm:flex-row sm:items-end sm:justify-between sm:p-8">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#B7B7AF]">Estimated duration</p>
          <p className="number-face mt-3 text-5xl font-black sm:text-7xl">{formatDuration(duration)}</p>
        </div>
        <div className="text-sm font-bold text-[#DADAD2] sm:text-right">
          <p>{Number.isFinite(distance) ? `${Number(distance.toFixed(2))} km` : "—"}</p>
          <p>{paceMinutes || "—"}:{paceSeconds || "—"} /km</p>
        </div>
      </div>

      {error ? <p className="mt-5 border-l-4 border-[#A83224] bg-white p-4 text-sm font-semibold text-[#7E251B]" role="alert">{error}</p> : null}

      <div className="mt-8 flex justify-end">
        <button type="button" onClick={submit} className="min-h-14 w-full rounded-[10px] bg-[#C7F000] px-8 font-black sm:w-auto">
          음악 취향 선택하기 →
        </button>
      </div>
    </section>
  );
}
