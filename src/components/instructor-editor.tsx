"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { REGIONS } from "@/lib/regions";
import { WEEKDAY_LABEL, minutesToTimeString, type WeekdayCode } from "@/lib/schedule";
import {
  WeekdayRangePicker,
  createEmptyWeekdayRangeState,
  type WeekdayRangeState,
} from "@/components/weekday-range-picker";

type Instructor = {
  id: string;
  name: string;
  email: string | null;
  education: string | null;
  exhibitions: string | null;
  awards: string | null;
  regions: { region: string }[];
  availableDays: { weekday: WeekdayCode; startMinute: number | null; endMinute: number | null }[];
};

function toInitialRangeState(instructor: Instructor): WeekdayRangeState {
  const state = createEmptyWeekdayRangeState();
  for (const day of instructor.availableDays) {
    state[day.weekday] = {
      enabled: true,
      start: day.startMinute != null ? minutesToTimeString(day.startMinute) : "09:00",
      end: day.endMinute != null ? minutesToTimeString(day.endMinute) : "18:00",
    };
  }
  return state;
}

export function InstructorEditor({ instructor }: { instructor: Instructor }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [regions, setRegions] = useState<string[]>(instructor.regions.map((r) => r.region));
  const [dayRanges, setDayRanges] = useState<WeekdayRangeState>(toInitialRangeState(instructor));
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function toggleRegion(region: string) {
    setRegions((list) => (list.includes(region) ? list.filter((r) => r !== region) : [...list, region]));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    const formData = new FormData(event.currentTarget);
    const weekdays = Object.entries(dayRanges)
      .filter(([, range]) => range.enabled)
      .map(([weekday, range]) => ({ weekday, startTime: range.start, endTime: range.end }));

    const res = await fetch(`/api/instructors/${instructor.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: formData.get("name"),
        email: formData.get("email"),
        education: formData.get("education"),
        exhibitions: formData.get("exhibitions"),
        awards: formData.get("awards"),
        regions,
        weekdays,
      }),
    });

    setSubmitting(false);

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "수정 중 오류가 발생했습니다.");
      return;
    }

    setEditing(false);
    router.refresh();
  }

  const missingTimeCount = instructor.availableDays.filter((d) => d.startMinute == null).length;

  if (!editing) {
    return (
      <div className="rounded-sm border border-ink/20 p-6">
        <div className="flex items-start justify-between gap-3">
          <p className="font-[var(--font-serif-kr)] text-lg">{instructor.name}</p>
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="shrink-0 text-xs text-ink/50 underline hover:text-ink"
          >
            수정
          </button>
        </div>
        <p className="mt-2 text-sm text-ink/70">
          이메일: {instructor.email ?? <span className="text-terracotta">미설정 — 예약 확정 알림을 받으려면 등록 필요</span>}
        </p>
        <p className="text-sm text-ink/70">
          담당 지역: {instructor.regions.map((r) => r.region).join(", ")}
        </p>
        <p className="text-sm text-ink/70">
          가능 요일:{" "}
          {instructor.availableDays
            .map((d) =>
              d.startMinute != null && d.endMinute != null
                ? `${WEEKDAY_LABEL[d.weekday]}(${minutesToTimeString(d.startMinute)}~${minutesToTimeString(d.endMinute)})`
                : `${WEEKDAY_LABEL[d.weekday]}(시간 미설정)`,
            )
            .join(", ")}
        </p>
        {missingTimeCount > 0 && (
          <p className="mt-1 text-xs text-terracotta">
            {missingTimeCount}개 요일의 시간대가 아직 설정되지 않았습니다. "수정"에서 채워주세요.
          </p>
        )}
        {instructor.education && <p className="mt-1 text-sm text-ink/60">학력: {instructor.education}</p>}
        {instructor.exhibitions && <p className="text-sm text-ink/60">전시: {instructor.exhibitions}</p>}
        {instructor.awards && <p className="text-sm text-ink/60">수상경력: {instructor.awards}</p>}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-sm border border-terracotta p-6">
      <div className="flex items-center justify-between">
        <p className="font-[var(--font-serif-kr)] text-lg">{instructor.name} 정보 수정</p>
        <button
          type="button"
          onClick={() => setEditing(false)}
          className="text-xs text-ink/50 hover:text-ink"
        >
          취소
        </button>
      </div>

      <label className="block text-sm">
        <span className="text-ink/70">강사명</span>
        <input
          name="name"
          defaultValue={instructor.name}
          required
          className="mt-1 w-full rounded-sm border border-ink/20 bg-base px-3 py-2 outline-none focus:border-ink"
        />
      </label>
      <label className="block text-sm">
        <span className="text-ink/70">이메일 (예약 확정 시 알림 발송용)</span>
        <input
          name="email"
          type="email"
          defaultValue={instructor.email ?? ""}
          required
          className="mt-1 w-full rounded-sm border border-ink/20 bg-base px-3 py-2 outline-none focus:border-ink"
        />
      </label>
      <label className="block text-sm">
        <span className="text-ink/70">학력</span>
        <input
          name="education"
          defaultValue={instructor.education ?? ""}
          className="mt-1 w-full rounded-sm border border-ink/20 bg-base px-3 py-2 outline-none focus:border-ink"
        />
      </label>
      <label className="block text-sm">
        <span className="text-ink/70">전시 이력</span>
        <input
          name="exhibitions"
          defaultValue={instructor.exhibitions ?? ""}
          className="mt-1 w-full rounded-sm border border-ink/20 bg-base px-3 py-2 outline-none focus:border-ink"
        />
      </label>
      <label className="block text-sm">
        <span className="text-ink/70">수상 경력</span>
        <input
          name="awards"
          defaultValue={instructor.awards ?? ""}
          className="mt-1 w-full rounded-sm border border-ink/20 bg-base px-3 py-2 outline-none focus:border-ink"
        />
      </label>

      <div className="text-sm">
        <span className="text-ink/70">담당 지역</span>
        <div className="mt-2 flex flex-wrap gap-2">
          {REGIONS.map((region) => (
            <button
              type="button"
              key={region}
              onClick={() => toggleRegion(region)}
              className={`rounded-full border px-3 py-1 text-xs ${
                regions.includes(region) ? "border-ink bg-ink text-base" : "border-ink/20 text-ink/70"
              }`}
            >
              {region}
            </button>
          ))}
        </div>
      </div>

      <div className="text-sm">
        <span className="text-ink/70">가능 요일 및 시간</span>
        <div className="mt-2">
          <WeekdayRangePicker value={dayRanges} onChange={setDayRanges} />
        </div>
      </div>

      {error && <p className="text-sm text-red-700">{error}</p>}
      <button
        type="submit"
        disabled={submitting}
        className="rounded-full bg-terracotta px-6 py-2 text-sm tracking-wide text-base disabled:opacity-60"
      >
        {submitting ? "저장 중..." : "저장"}
      </button>
    </form>
  );
}
