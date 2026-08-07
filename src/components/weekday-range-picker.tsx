"use client";

import { WEEKDAYS, WEEKDAY_LABEL, type WeekdayCode } from "@/lib/schedule";

export type WeekdayRangeState = Record<
  WeekdayCode,
  { enabled: boolean; start: string; end: string }
>;

export function createEmptyWeekdayRangeState(): WeekdayRangeState {
  return WEEKDAYS.reduce((acc, day) => {
    acc[day] = { enabled: false, start: "09:00", end: "18:00" };
    return acc;
  }, {} as WeekdayRangeState);
}

// 요일별로 켜고 끄면서, 켜진 요일은 시작~종료 시간을 입력하는 UI. 강사 등록/수정 양쪽에서 공용으로 쓴다.
export function WeekdayRangePicker({
  value,
  onChange,
}: {
  value: WeekdayRangeState;
  onChange: (next: WeekdayRangeState) => void;
}) {
  function toggle(day: WeekdayCode) {
    onChange({ ...value, [day]: { ...value[day], enabled: !value[day].enabled } });
  }

  function setTime(day: WeekdayCode, field: "start" | "end", time: string) {
    onChange({ ...value, [day]: { ...value[day], [field]: time } });
  }

  return (
    <div className="space-y-2">
      {WEEKDAYS.map((day) => {
        const range = value[day];
        return (
          <div key={day} className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => toggle(day)}
              className={`w-14 shrink-0 rounded-full border px-3 py-1 text-xs ${
                range.enabled
                  ? "border-terracotta bg-terracotta text-base"
                  : "border-ink/20 text-ink/70"
              }`}
            >
              {WEEKDAY_LABEL[day]}
            </button>
            {range.enabled ? (
              <div className="flex items-center gap-2 text-sm text-ink/70">
                <input
                  type="time"
                  value={range.start}
                  onChange={(e) => setTime(day, "start", e.target.value)}
                  className="rounded-sm border border-ink/20 bg-base px-2 py-1 outline-none focus:border-ink"
                />
                <span>~</span>
                <input
                  type="time"
                  value={range.end}
                  onChange={(e) => setTime(day, "end", e.target.value)}
                  className="rounded-sm border border-ink/20 bg-base px-2 py-1 outline-none focus:border-ink"
                />
              </div>
            ) : (
              <span className="text-xs text-ink/40">휴무</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
