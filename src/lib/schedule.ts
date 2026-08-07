import { formatDateKST } from "@/lib/format-date";

export const WEEKDAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"] as const;
export type WeekdayCode = (typeof WEEKDAYS)[number];

export const WEEKDAY_LABEL: Record<WeekdayCode, string> = {
  MON: "월",
  TUE: "화",
  WED: "수",
  THU: "목",
  FRI: "금",
  SAT: "토",
  SUN: "일",
};

const JS_DAY_TO_CODE: WeekdayCode[] = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

/** 오늘로부터 향후 weeksAhead주 안에서, 주어진 요일들에 해당하는 다가오는 날짜 목록을 반환합니다. */
export function getUpcomingDates(weekdays: WeekdayCode[], weeksAhead = 4): Date[] {
  const targetCodes = new Set(weekdays);
  const dates: Date[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 1; i <= weeksAhead * 7; i++) {
    const candidate = new Date(today);
    candidate.setDate(today.getDate() + i);
    if (targetCodes.has(JS_DAY_TO_CODE[candidate.getDay()])) {
      dates.push(candidate);
    }
  }
  return dates;
}

export function formatDateWithWeekday(date: Date): string {
  const code = JS_DAY_TO_CODE[date.getDay()];
  return `${formatDateKST(date)} (${WEEKDAY_LABEL[code]})`;
}

/** "HH:mm" 문자열을 자정 기준 분으로 변환. 형식이 잘못되면 null. */
export function timeStringToMinutes(time: string): number | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(time);
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;
  return hours * 60 + minutes;
}

/** 자정 기준 분을 "HH:mm" 문자열로 변환. */
export function minutesToTimeString(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}
