"use client";

import { calculateDuration, calculatePace, formatDuration, formatPace, parseDuration, parsePace } from "@/lib/pace";
import type { RunningRecord } from "@/lib/types";

interface RunRecordFormProps {
  run: RunningRecord;
  index: number;
  canRemove: boolean;
  onChange: (run: RunningRecord) => void;
  onRemove: () => void;
}

const inputClass =
  "mt-2 min-h-11 w-full rounded-[10px] border border-[#C8C8C0] bg-white px-3 text-base text-[#171717] placeholder:text-[#999991] focus:border-[#171717] focus:outline-none";

function numberOrNull(value: string): number | null {
  if (!value.trim()) return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

export function RunRecordForm({ run, index, canRemove, onChange, onRemove }: RunRecordFormProps) {
  const updateDistance = (value: string) => {
    const distance = numberOrNull(value);
    const next = { ...run, distance_km: distance };
    if (distance && run.duration_seconds) {
      next.average_pace_sec_per_km = calculatePace(distance, run.duration_seconds);
    } else if (distance && run.average_pace_sec_per_km) {
      next.duration_seconds = calculateDuration(distance, run.average_pace_sec_per_km);
    }
    onChange(next);
  };

  const updateDuration = (value: string) => {
    const duration = value.trim() ? parseDuration(value) : null;
    onChange({
      ...run,
      duration_seconds: duration,
      average_pace_sec_per_km:
        duration && run.distance_km ? calculatePace(run.distance_km, duration) : run.average_pace_sec_per_km,
    });
  };

  const updatePace = (value: string) => {
    const pace = value.trim() ? parsePace(value) : null;
    onChange({
      ...run,
      average_pace_sec_per_km: pace,
      duration_seconds: pace && run.distance_km ? calculateDuration(run.distance_km, pace) : run.duration_seconds,
    });
  };

  return (
    <article className="rounded-xl border border-[#D9D9D2] bg-white p-4 sm:p-5">
      <div className="mb-5 flex items-center justify-between gap-3 border-b border-[#E5E5DF] pb-3">
        <h3 className="font-bold">RUN {String(index + 1).padStart(2, "0")}</h3>
        {canRemove ? (
          <button type="button" onClick={onRemove} className="min-h-11 px-2 text-sm font-semibold underline underline-offset-4">
            기록 삭제
          </button>
        ) : null}
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <label className="text-sm font-semibold">
          거리 <span className="text-[#A83224]">*</span>
          <span className="relative block">
            <input
              className={`${inputClass} pr-11`}
              type="number"
              inputMode="decimal"
              min="0.1"
              max="200"
              step="0.01"
              value={run.distance_km ?? ""}
              onChange={(event) => updateDistance(event.target.value)}
              aria-label={`${index + 1}번째 러닝 거리(km)`}
            />
            <span className="pointer-events-none absolute right-3 top-[22px] text-sm text-[#6C6C66]">km</span>
          </span>
        </label>

        <label className="text-sm font-semibold">
          운동 시간 <span className="text-[#A83224]">*</span>
          <input
            key={`duration-${run.id}-${run.duration_seconds}`}
            className={inputClass}
            type="text"
            inputMode="numeric"
            placeholder="29:23"
            defaultValue={run.duration_seconds ? formatDuration(run.duration_seconds) : ""}
            onBlur={(event) => updateDuration(event.target.value)}
            aria-describedby={`${run.id}-time-help`}
          />
          <span id={`${run.id}-time-help`} className="mt-1 block text-xs font-normal text-[#6C6C66]">
            mm:ss 또는 h:mm:ss
          </span>
        </label>

        <label className="text-sm font-semibold">
          평균 페이스 <span className="text-[#A83224]">*</span>
          <input
            key={`pace-${run.id}-${run.average_pace_sec_per_km}`}
            className={inputClass}
            type="text"
            inputMode="numeric"
            placeholder="5:49"
            defaultValue={run.average_pace_sec_per_km ? formatPace(run.average_pace_sec_per_km) : ""}
            onBlur={(event) => updatePace(event.target.value)}
            aria-describedby={`${run.id}-pace-help`}
          />
          <span id={`${run.id}-pace-help`} className="mt-1 block text-xs font-normal text-[#6C6C66]">
            /km · 시간과 자동 계산
          </span>
        </label>

        <label className="text-sm font-semibold">
          평균 케이던스
          <span className="relative block">
            <input
              className={`${inputClass} pr-12`}
              type="number"
              inputMode="numeric"
              min="80"
              max="250"
              value={run.average_cadence ?? ""}
              onChange={(event) => onChange({ ...run, average_cadence: numberOrNull(event.target.value) })}
            />
            <span className="pointer-events-none absolute right-3 top-[22px] text-sm text-[#6C6C66]">spm</span>
          </span>
        </label>

        <label className="text-sm font-semibold">
          평균 심박
          <span className="relative block">
            <input
              className={`${inputClass} pr-12`}
              type="number"
              inputMode="numeric"
              min="30"
              max="240"
              value={run.average_heart_rate ?? ""}
              onChange={(event) => onChange({ ...run, average_heart_rate: numberOrNull(event.target.value) })}
            />
            <span className="pointer-events-none absolute right-3 top-[22px] text-sm text-[#6C6C66]">bpm</span>
          </span>
        </label>

        <label className="text-sm font-semibold">
          날짜
          <input
            className={inputClass}
            type="date"
            value={run.date ?? ""}
            onChange={(event) => onChange({ ...run, date: event.target.value || null })}
          />
        </label>

        <label className="text-sm font-semibold">
          상승 고도
          <span className="relative block">
            <input
              className={`${inputClass} pr-9`}
              type="number"
              inputMode="decimal"
              min="0"
              max="20000"
              value={run.elevation_gain_m ?? ""}
              onChange={(event) => onChange({ ...run, elevation_gain_m: numberOrNull(event.target.value) })}
            />
            <span className="pointer-events-none absolute right-3 top-[22px] text-sm text-[#6C6C66]">m</span>
          </span>
        </label>

        <label className="text-sm font-semibold">
          러닝 유형
          <select
            className={inputClass}
            value={run.run_type ?? ""}
            onChange={(event) => onChange({ ...run, run_type: event.target.value || null })}
          >
            <option value="">선택 안 함</option>
            <option value="easy">Easy</option>
            <option value="tempo">Tempo</option>
            <option value="interval">Interval</option>
            <option value="long">Long run</option>
            <option value="race">Race</option>
          </select>
        </label>
      </div>
    </article>
  );
}
