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
  return `${date.toLocaleDateString("ko-KR")} (${WEEKDAY_LABEL[code]})`;
}
