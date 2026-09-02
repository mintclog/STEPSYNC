"use client";

import { useRef, useState } from "react";
import { BeatLoader } from "@/components/beat-loader";
import { RunRecordForm } from "@/components/run-record-form";
import type { ApiErrorBody, RunSource, RunningRecord } from "@/lib/types";
import { validateRuns } from "@/lib/validation";

interface RunsStepProps {
  runs: RunningRecord[];
  source: RunSource;
  onRunsChange: (runs: RunningRecord[]) => void;
  onSourceChange: (source: RunSource) => void;
  onContinue: () => void;
}

type Mode = "choose" | "manual" | "screenshot" | "review";

export function createEmptyRun(index: number): RunningRecord {
  return {
    id: `manual-${Date.now()}-${index}`,
    date: null,
    distance_km: null,
    duration_seconds: null,
    average_pace_sec_per_km: null,
    average_cadence: null,
    average_heart_rate: null,
    elevation_gain_m: null,
    run_type: null,
    splits: [],
  };
}

export function RunsStep({ runs, source, onRunsChange, onSourceChange, onContinue }: RunsStepProps) {
  const [mode, setMode] = useState<Mode>(source === "screenshot" && runs[0]?.distance_km ? "review" : "choose");
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);

  const setManual = () => {
    onSourceChange("manual");
    if (runs.length < 3 || source !== "manual") onRunsChange([0, 1, 2].map(createEmptyRun));
    setError("");
    setMode("manual");
  };

  const addFiles = (incoming: FileList | File[]) => {
    const images = Array.from(incoming).filter((file) => ["image/jpeg", "image/png", "image/webp"].includes(file.type));
    const next = [...files, ...images].slice(0, 5);
    setFiles(next);
    setError(images.length === Array.from(incoming).length ? "" : "JPG, PNG, WebP 이미지만 선택할 수 있습니다.");
  };

  const analyzeScreenshots = async () => {
    if (files.length < 3 || files.length > 5) {
      setError("최근 러닝 스크린샷을 3~5개 선택해주세요.");
      return;
    }
    setIsAnalyzing(true);
    setError("");
    try {
      const formData = new FormData();
      files.forEach((file) => formData.append("images", file));
      const response = await fetch("/api/extract-runs", { method: "POST", body: formData });
      const body: unknown = await response.json();
      if (!response.ok) {
        const apiError = body as ApiErrorBody;
        throw new Error(apiError.error?.message || "이미지 분석에 실패했습니다.");
      }
      const extracted = body as { runs: RunningRecord[] };
      onRunsChange(extracted.runs);
      onSourceChange("screenshot");
      setMode("review");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "이미지 분석에 실패했습니다.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const continueWithRuns = () => {
    const validation = validateRuns(runs);
    if (!validation.success) {
      setError("각 기록에 거리와 운동 시간 또는 평균 페이스를 입력해주세요. 최근 기록은 3~5회여야 합니다.");
      return;
    }
    setError("");
    onContinue();
  };

  const updateRun = (index: number, next: RunningRecord) => {
    onRunsChange(runs.map((run, runIndex) => (runIndex === index ? next : run)));
  };

  if (isAnalyzing) {
    return <BeatLoader label="스크린샷에서 러닝 기록을 읽고 있습니다" />;
  }

  return (
    <section aria-labelledby="runs-title">
      <div className="mb-10 max-w-2xl">
        <p className="mb-3 text-xs font-black uppercase tracking-[0.2em] text-[#6C6C66]">Step 1 · Your runs</p>
        <h1 id="runs-title" className="text-3xl font-black tracking-[-0.045em] sm:text-5xl">
          최근 3~5회 러닝을 알려주세요.
        </h1>
        <p className="mt-4 leading-7 text-[#5C5C56]">기록이 풍부할수록 개인화된 리듬 범위를 더 정확하게 설명할 수 있습니다.</p>
      </div>

      {mode === "choose" ? (
        <div className="grid gap-4 md:grid-cols-3">
          <article className="rounded-xl border border-[#D9D9D2] bg-[#EFEFEA] p-6 text-[#6C6C66]">
            <p className="text-xs font-black uppercase tracking-[0.18em]">Integration</p>
            <h2 className="mt-8 text-xl font-bold">러닝 앱 연동</h2>
            <p className="mt-2 min-h-12 text-sm leading-6">지원 서비스 준비 중입니다. 가짜 OAuth는 제공하지 않습니다.</p>
            <button type="button" disabled className="mt-6 min-h-12 w-full cursor-not-allowed rounded-[10px] border border-[#C8C8C0] font-bold opacity-60">
              준비 중
            </button>
          </article>

          <button
            type="button"
            onClick={() => setMode("screenshot")}
            className="min-h-64 rounded-xl border-2 border-[#171717] bg-white p-6 text-left transition-transform hover:-translate-y-1"
          >
            <span className="text-xs font-black uppercase tracking-[0.18em]">Screenshot</span>
            <span className="mt-8 block text-xl font-bold">기록 화면 올리기</span>
            <span className="mt-2 block text-sm leading-6 text-[#5C5C56]">Samsung Health, Garmin, Strava 화면 3~5장을 AI로 읽습니다.</span>
            <span className="mt-6 block font-black">업로드하기 →</span>
          </button>

          <button
            type="button"
            onClick={setManual}
            className="min-h-64 rounded-xl border border-[#D9D9D2] bg-white p-6 text-left transition-transform hover:-translate-y-1"
          >
            <span className="text-xs font-black uppercase tracking-[0.18em]">Manual</span>
            <span className="mt-8 block text-xl font-bold">직접 입력할게요</span>
            <span className="mt-2 block text-sm leading-6 text-[#5C5C56]">거리와 시간 또는 페이스만 있어도 시작할 수 있습니다.</span>
            <span className="mt-6 block font-black">입력하기 →</span>
          </button>
        </div>
      ) : null}

      {mode === "screenshot" ? (
        <div className="max-w-3xl">
          <button type="button" onClick={() => setMode("choose")} className="mb-4 min-h-11 text-sm font-bold underline underline-offset-4">
            ← 입력 방식 다시 선택
          </button>
          <div
            className={`rounded-xl border-2 border-dashed p-7 text-center sm:p-12 ${isDragging ? "border-[#171717] bg-[#C7F000]/20" : "border-[#A8A8A0] bg-white"}`}
            onDragEnter={(event) => {
              event.preventDefault();
              setIsDragging(true);
            }}
            onDragOver={(event) => event.preventDefault()}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(event) => {
              event.preventDefault();
              setIsDragging(false);
              addFiles(event.dataTransfer.files);
            }}
          >
            <p className="text-xl font-bold">러닝 기록 스크린샷 3~5장</p>
            <p className="mt-2 text-sm leading-6 text-[#6C6C66]">한 러닝당 대표 화면 1장 · JPG, PNG, WebP · 장당 최대 8MB</p>
            <input
              ref={fileInput}
              className="sr-only"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={(event) => event.target.files && addFiles(event.target.files)}
            />
            <button
              type="button"
              onClick={() => fileInput.current?.click()}
              className="mt-6 min-h-12 rounded-[10px] bg-[#171717] px-6 font-bold text-white"
            >
              사진 또는 파일 선택
            </button>
          </div>
          {files.length > 0 ? (
            <ul className="mt-5 divide-y divide-[#D9D9D2] border-y border-[#D9D9D2]">
              {files.map((file, index) => (
                <li key={`${file.name}-${file.lastModified}`} className="flex min-h-14 items-center justify-between gap-3 py-2 text-sm">
                  <span className="min-w-0 truncate">{String(index + 1).padStart(2, "0")} · {file.name}</span>
                  <button
                    type="button"
                    onClick={() => setFiles(files.filter((_, fileIndex) => fileIndex !== index))}
                    className="min-h-11 shrink-0 px-2 font-bold underline underline-offset-4"
                  >
                    제거
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
          <button
            type="button"
            onClick={analyzeScreenshots}
            disabled={files.length < 3}
            className="mt-7 min-h-14 w-full rounded-[10px] bg-[#C7F000] px-6 text-base font-black text-[#171717] disabled:cursor-not-allowed disabled:opacity-45"
          >
            {files.length < 3 ? `${3 - files.length}장 더 선택해주세요` : `${files.length}개 기록 분석하기 →`}
          </button>
        </div>
      ) : null}

      {mode === "manual" || mode === "review" ? (
        <div>
          {mode === "review" ? (
            <div className="mb-6 border-l-4 border-[#C7F000] bg-white p-5" role="status">
              <p className="font-black">AI가 다음 기록을 찾았습니다.</p>
              <p className="mt-1 text-sm leading-6 text-[#5C5C56]">화면에 없던 값은 비워두었습니다. 각 값을 확인하거나 바로 수정해주세요.</p>
            </div>
          ) : (
            <button type="button" onClick={() => setMode("choose")} className="mb-4 min-h-11 text-sm font-bold underline underline-offset-4">
              ← 입력 방식 다시 선택
            </button>
          )}
          <div className="grid gap-4">
            {runs.map((run, index) => (
              <RunRecordForm
                key={run.id}
                run={run}
                index={index}
                canRemove={runs.length > 3}
                onChange={(next) => updateRun(index, next)}
                onRemove={() => onRunsChange(runs.filter((_, runIndex) => runIndex !== index))}
              />
            ))}
          </div>
          {runs.length < 5 ? (
            <button
              type="button"
              onClick={() => onRunsChange([...runs, createEmptyRun(runs.length)])}
              className="mt-4 min-h-12 w-full rounded-[10px] border border-[#171717] bg-transparent font-bold"
            >
              + 기록 추가 ({runs.length}/5)
            </button>
          ) : null}
          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-end">
            {mode === "review" ? (
              <button type="button" onClick={() => setMode("manual")} className="min-h-14 rounded-[10px] border border-[#171717] px-6 font-bold">
                수정하기
              </button>
            ) : null}
            <button type="button" onClick={continueWithRuns} className="min-h-14 rounded-[10px] bg-[#C7F000] px-8 font-black">
              {mode === "review" ? "맞아요 →" : "목표 설정하기 →"}
            </button>
          </div>
        </div>
      ) : null}

      {error ? (
        <div className="mt-5 border-l-4 border-[#A83224] bg-white p-4 text-sm font-semibold text-[#7E251B]" role="alert">
          {error}
        </div>
      ) : null}
    </section>
  );
}
