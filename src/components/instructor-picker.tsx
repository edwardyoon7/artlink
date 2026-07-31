"use client";

import { useEffect, useState } from "react";
import { getUpcomingDates, formatDateWithWeekday, WEEKDAY_LABEL, type WeekdayCode } from "@/lib/schedule";

type Instructor = {
  id: string;
  name: string;
  education: string | null;
  exhibitions: string | null;
  awards: string | null;
  regions: { region: string }[];
  availableDays: { weekday: WeekdayCode }[];
};

export function InstructorPicker({
  region,
  selectedInstructorId,
  selectedDate,
  onSelect,
}: {
  region: string;
  selectedInstructorId: string | null;
  selectedDate: string | null;
  onSelect: (instructorId: string, date: string) => void;
}) {
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/instructors?region=${encodeURIComponent(region)}`)
      .then((res) => res.json())
      .then((data) => setInstructors(data.instructors ?? []))
      .finally(() => setLoading(false));
  }, [region]);

  if (loading) return <p className="text-sm text-ink/60">강사 목록을 불러오는 중...</p>;

  if (instructors.length === 0) {
    return <p className="text-sm text-ink/60">"{region}"에서 가능한 강사가 아직 없습니다.</p>;
  }

  return (
    <div className="space-y-4">
      {instructors.map((instructor) => {
        const weekdays = instructor.availableDays.map((d) => d.weekday);
        const upcoming = getUpcomingDates(weekdays, 4);
        const isSelected = selectedInstructorId === instructor.id;

        return (
          <div
            key={instructor.id}
            className={`rounded-sm border p-4 ${isSelected ? "border-terracotta" : "border-ink/20"}`}
          >
            <p className="font-[var(--font-serif-kr)] text-lg">{instructor.name}</p>
            <p className="mt-1 text-xs text-ink/60">
              가능 요일: {weekdays.map((w) => WEEKDAY_LABEL[w]).join(", ")}
            </p>
            {instructor.education && <p className="mt-1 text-sm text-ink/70">학력: {instructor.education}</p>}
            {instructor.exhibitions && <p className="text-sm text-ink/70">전시: {instructor.exhibitions}</p>}
            {instructor.awards && <p className="text-sm text-ink/70">수상경력: {instructor.awards}</p>}

            <div className="mt-3 flex flex-wrap gap-2">
              {upcoming.slice(0, 8).map((date) => {
                const iso = date.toISOString();
                const isDateSelected = isSelected && selectedDate === iso;
                return (
                  <button
                    key={iso}
                    type="button"
                    onClick={() => onSelect(instructor.id, iso)}
                    className={`rounded-full border px-3 py-1 text-xs ${
                      isDateSelected
                        ? "border-terracotta bg-terracotta text-base"
                        : "border-ink/20 text-ink/70 hover:border-ink"
                    }`}
                  >
                    {formatDateWithWeekday(date)}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
