"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RegionMap } from "@/components/region-map";
import { InstructorPicker } from "@/components/instructor-picker";
import { COACHING_DURATIONS, getCoachingFee, type CoachingDurationHours } from "@/lib/pricing";

export function CoachingForm() {
  const router = useRouter();
  const [region, setRegion] = useState<string | null>(null);
  const [instructorId, setInstructorId] = useState<string | null>(null);
  const [preferredDate, setPreferredDate] = useState<string | null>(null);
  const [durationHours, setDurationHours] = useState<CoachingDurationHours | null>(null);
  const [curriculum, setCurriculum] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function handleRegionSelect(next: string) {
    setRegion(next);
    setInstructorId(null);
    setPreferredDate(null);
  }

  async function handleSubmit() {
    if (!region || !instructorId || !preferredDate) {
      setError("지역·강사·희망 날짜를 모두 선택해주세요.");
      return;
    }
    if (!durationHours) {
      setError("코칭 시간을 선택해주세요.");
      return;
    }
    if (!curriculum.trim()) {
      setError("배우고 싶은 내용을 입력해주세요.");
      return;
    }

    setSubmitting(true);
    setError("");
    const res = await fetch("/api/coaching", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ region, instructorId, preferredDate, durationHours, curriculum }),
    });
    setSubmitting(false);

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "예약 중 오류가 발생했습니다.");
      return;
    }

    router.push("/mypage");
    router.refresh();
  }

  return (
    <div className="mt-8 space-y-8">
      <div>
        <p className="text-sm text-ink/70">1. 방문 가능한 지역을 선택해주세요</p>
        <div className="mt-3">
          <RegionMap selected={region} onSelect={handleRegionSelect} />
        </div>
      </div>

      {region && (
        <div>
          <p className="text-sm text-ink/70">
            2. <strong>{region}</strong> 지역 강사와 날짜를 선택해주세요
          </p>
          <div className="mt-3">
            <InstructorPicker
              region={region}
              selectedInstructorId={instructorId}
              selectedDate={preferredDate}
              onSelect={(id, date) => {
                setInstructorId(id);
                setPreferredDate(date);
              }}
            />
          </div>
        </div>
      )}

      {instructorId && preferredDate && (
        <div>
          <p className="text-sm text-ink/70">3. 코칭 시간을 선택해주세요</p>
          <div className="mt-3 flex gap-3">
            {COACHING_DURATIONS.map((hours) => {
              const isSelected = durationHours === hours;
              return (
                <button
                  key={hours}
                  type="button"
                  onClick={() => setDurationHours(hours)}
                  className={`flex-1 rounded-sm border px-4 py-3 text-sm ${
                    isSelected
                      ? "border-terracotta bg-terracotta/10 text-ink"
                      : "border-ink/20 text-ink/70 hover:border-ink"
                  }`}
                >
                  <span className="block font-medium">{hours}시간</span>
                  <span className="mt-0.5 block text-xs text-ink/60">
                    {getCoachingFee(hours).toLocaleString()}원
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {instructorId && preferredDate && durationHours && (
        <div>
          <label className="block text-sm">
            <span className="text-ink/70">4. 배우고 싶은 내용 / 상담 요청사항</span>
            <textarea
              rows={4}
              value={curriculum}
              onChange={(e) => setCurriculum(e.target.value)}
              placeholder="예: 수채화 기초, 인물 드로잉 등"
              className="mt-1 w-full rounded-sm border border-ink/20 bg-base px-3 py-2 outline-none focus:border-ink"
            />
          </label>
        </div>
      )}

      {error && <p className="text-sm text-red-700">{error}</p>}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={submitting}
        className="w-full rounded-full bg-terracotta px-8 py-3 text-sm tracking-wide text-base disabled:opacity-60"
      >
        {submitting ? "접수 중..." : "신청 접수"}
      </button>
    </div>
  );
}
