"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { REGIONS } from "@/lib/regions";
import { WEEKDAYS, WEEKDAY_LABEL } from "@/lib/schedule";

export function InstructorForm() {
  const router = useRouter();
  const [regions, setRegions] = useState<string[]>([]);
  const [weekdays, setWeekdays] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function toggle(list: string[], setList: (v: string[]) => void, value: string) {
    setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    const formData = new FormData(event.currentTarget);
    const res = await fetch("/api/instructors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: formData.get("name"),
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
      setError(body.error ?? "등록 중 오류가 발생했습니다.");
      return;
    }

    setRegions([]);
    setWeekdays([]);
    (event.target as HTMLFormElement).reset();
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
      <label className="block text-sm">
        <span className="text-ink/70">강사명</span>
        <input
          name="name"
          required
          className="mt-1 w-full rounded-sm border border-ink/20 bg-base px-3 py-2 outline-none focus:border-ink"
        />
      </label>
      <label className="block text-sm">
        <span className="text-ink/70">학력</span>
        <input
          name="education"
          className="mt-1 w-full rounded-sm border border-ink/20 bg-base px-3 py-2 outline-none focus:border-ink"
        />
      </label>
      <label className="block text-sm">
        <span className="text-ink/70">전시 이력</span>
        <input
          name="exhibitions"
          className="mt-1 w-full rounded-sm border border-ink/20 bg-base px-3 py-2 outline-none focus:border-ink"
        />
      </label>
      <label className="block text-sm">
        <span className="text-ink/70">수상 경력</span>
        <input
          name="awards"
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
              onClick={() => toggle(regions, setRegions, region)}
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
        <span className="text-ink/70">가능 요일</span>
        <div className="mt-2 flex flex-wrap gap-2">
          {WEEKDAYS.map((day) => (
            <button
              type="button"
              key={day}
              onClick={() => toggle(weekdays, setWeekdays, day)}
              className={`rounded-full border px-3 py-1 text-xs ${
                weekdays.includes(day) ? "border-terracotta bg-terracotta text-base" : "border-ink/20 text-ink/70"
              }`}
            >
              {WEEKDAY_LABEL[day]}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="text-sm text-red-700">{error}</p>}
      <button
        type="submit"
        disabled={submitting}
        className="rounded-full bg-ink px-6 py-2 text-sm tracking-wide text-base disabled:opacity-60"
      >
        {submitting ? "등록 중..." : "강사 등록"}
      </button>
    </form>
  );
}
