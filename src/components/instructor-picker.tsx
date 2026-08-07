"use client";

import { useEffect, useState } from "react";
import {
  getUpcomingKstDates,
  formatKstDateWithWeekday,
  kstDateToKey,
  WEEKDAY_LABEL,
  type WeekdayCode,
  type KstDate,
} from "@/lib/schedule";

type Instructor = {
  id: string;
  name: string;
  education: string | null;
  exhibitions: string | null;
  awards: string | null;
  regions: { region: string }[];
  availableDays: { weekday: WeekdayCode; startMinute: number | null; endMinute: number | null }[];
};

type Slot = { startMinute: number; endMinute: number; durationHours: number; fee: number; startAt: string };

export type SelectedSlot = { instructorId: string; startAt: string; durationHours: number; fee: number };

function minuteToLabel(minute: number): string {
  const h = Math.floor(minute / 60);
  const m = minute % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function InstructorPicker({
  region,
  selected,
  onSelect,
}: {
  region: string;
  selected: SelectedSlot | null;
  onSelect: (slot: SelectedSlot) => void;
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
      {instructors.map((instructor) => (
        <InstructorRow
          key={instructor.id}
          instructor={instructor}
          selected={selected?.instructorId === instructor.id ? selected : null}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}

function InstructorRow({
  instructor,
  selected,
  onSelect,
}: {
  instructor: Instructor;
  selected: SelectedSlot | null;
  onSelect: (slot: SelectedSlot) => void;
}) {
  const scheduledWeekdays = instructor.availableDays.filter(
    (d): d is { weekday: WeekdayCode; startMinute: number; endMinute: number } =>
      d.startMinute != null && d.endMinute != null,
  );
  const upcoming = getUpcomingKstDates(
    scheduledWeekdays.map((d) => d.weekday),
    4,
  );

  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  function handleDateClick(date: KstDate) {
    const key = kstDateToKey(date);
    setSelectedDateKey(key);
    setSlots([]);
    setLoadingSlots(true);
    fetch(`/api/instructors/${instructor.id}/slots?date=${key}`)
      .then((res) => res.json())
      .then((data) => setSlots(data.slots ?? []))
      .finally(() => setLoadingSlots(false));
  }

  const isThisInstructorSelected = selected != null;

  return (
    <div
      className={`rounded-sm border p-4 ${isThisInstructorSelected ? "border-terracotta" : "border-ink/20"}`}
    >
      <p className="font-[var(--font-serif-kr)] text-lg">{instructor.name}</p>
      <p className="mt-1 text-xs text-ink/60">
        가능 요일: {scheduledWeekdays.map((d) => `${WEEKDAY_LABEL[d.weekday]}(${minuteToLabel(d.startMinute)}~${minuteToLabel(d.endMinute)})`).join(", ")}
      </p>
      {instructor.education && <p className="mt-1 text-sm text-ink/70">학력: {instructor.education}</p>}
      {instructor.exhibitions && <p className="text-sm text-ink/70">전시: {instructor.exhibitions}</p>}
      {instructor.awards && <p className="text-sm text-ink/70">수상경력: {instructor.awards}</p>}

      {scheduledWeekdays.length === 0 ? (
        <p className="mt-3 text-xs text-terracotta">아직 가능 시간대가 설정되지 않은 강사입니다.</p>
      ) : (
        <>
          <div className="mt-3 flex flex-wrap gap-2">
            {upcoming.map((date) => {
              const key = kstDateToKey(date);
              const isDateSelected = selectedDateKey === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleDateClick(date)}
                  className={`rounded-full border px-3 py-1 text-xs ${
                    isDateSelected
                      ? "border-terracotta bg-terracotta text-base"
                      : "border-ink/20 text-ink/70 hover:border-ink"
                  }`}
                >
                  {formatKstDateWithWeekday(date)}
                </button>
              );
            })}
          </div>

          {selectedDateKey && (
            <div className="mt-4 border-t border-ink/10 pt-3">
              <p className="text-xs text-ink/50">가능한 시간대</p>
              {loadingSlots && <p className="mt-2 text-sm text-ink/60">불러오는 중...</p>}
              {!loadingSlots && slots.length === 0 && (
                <p className="mt-2 text-sm text-ink/60">이 날짜엔 예약 가능한 시간대가 없습니다.</p>
              )}
              {!loadingSlots && slots.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {slots.map((slot) => {
                    const isSlotSelected = selected?.startAt === slot.startAt && selected?.durationHours === slot.durationHours;
                    return (
                      <button
                        key={`${slot.startAt}-${slot.durationHours}`}
                        type="button"
                        onClick={() =>
                          onSelect({
                            instructorId: instructor.id,
                            startAt: slot.startAt,
                            durationHours: slot.durationHours,
                            fee: slot.fee,
                          })
                        }
                        className={`rounded-sm border px-3 py-2 text-xs ${
                          isSlotSelected
                            ? "border-terracotta bg-terracotta/10 text-ink"
                            : "border-ink/20 text-ink/70 hover:border-ink"
                        }`}
                      >
                        <span className="block font-medium">
                          {minuteToLabel(slot.startMinute)}~{minuteToLabel(slot.endMinute)}
                        </span>
                        <span className="mt-0.5 block text-ink/50">
                          {slot.durationHours}시간 · {slot.fee.toLocaleString()}원
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
