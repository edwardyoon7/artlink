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

export const JS_DAY_TO_CODE: WeekdayCode[] = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const KST_OFFSET_MS = 9 * 60 * 60 * 1000;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

export type KstDate = { year: number; month: number; day: number; weekday: WeekdayCode };

// 서버 시스템 시간대가 UTC라도(=Lightsail 기본값) "오늘"을 한국시간 달력 기준으로 정확히
// 구하기 위한 헬퍼들. src/lib/home-rotation.ts의 todayIndexKst와 같은 원리 — KST_OFFSET_MS를
// 더한 뒤 UTC getter로 읽으면 그게 곧 한국시간 기준 날짜 필드가 된다.
function getKstToday(now: Date): { year: number; month: number; day: number } {
  const shifted = new Date(now.getTime() + KST_OFFSET_MS);
  return { year: shifted.getUTCFullYear(), month: shifted.getUTCMonth(), day: shifted.getUTCDate() };
}

/**
 * 오늘(한국시간 기준)로부터 향후 weeksAhead주 안에서, 주어진 요일들에 해당하는 날짜 목록.
 * 반환값은 실제 시각이 아니라 순수 달력 날짜(연/월/일/요일)라 시간대 혼동 없이 다룰 수 있다 —
 * 실제 예약 시각을 만들 땐 kstDateTimeToUtc와 함께 쓸 것.
 */
export function getUpcomingKstDates(weekdays: WeekdayCode[], weeksAhead = 4, now: Date = new Date()): KstDate[] {
  const targetCodes = new Set(weekdays);
  const today = getKstToday(now);
  // 캘린더 날짜 연산은 UTC 필드로 해도 안전하다(한국은 DST가 없어 하루가 항상 정확히 86400000ms).
  const baseMs = Date.UTC(today.year, today.month, today.day);
  const dates: KstDate[] = [];
  for (let i = 1; i <= weeksAhead * 7; i++) {
    const candidate = new Date(baseMs + i * MS_PER_DAY);
    const weekday = JS_DAY_TO_CODE[candidate.getUTCDay()];
    if (targetCodes.has(weekday)) {
      dates.push({
        year: candidate.getUTCFullYear(),
        month: candidate.getUTCMonth(),
        day: candidate.getUTCDate(),
        weekday,
      });
    }
  }
  return dates;
}

/** 한국시간 기준 연/월/일 + 자정부터의 분(minutesSinceMidnight)을 실제 UTC 인스턴트로 변환. */
export function kstDateTimeToUtc(year: number, month: number, day: number, minutesSinceMidnight: number): Date {
  const kstMidnightUtcMs = Date.UTC(year, month, day) - KST_OFFSET_MS;
  return new Date(kstMidnightUtcMs + minutesSinceMidnight * 60_000);
}

/** 실제 인스턴트(UTC 타임스탬프)를 한국시간 기준 자정부터의 분으로 변환. */
export function utcToKstMinutesSinceMidnight(instant: Date): number {
  const shifted = new Date(instant.getTime() + KST_OFFSET_MS);
  return shifted.getUTCHours() * 60 + shifted.getUTCMinutes();
}

export function formatKstDate(date: KstDate): string {
  return `${date.year}. ${date.month + 1}. ${date.day}.`;
}

export function formatKstDateWithWeekday(date: KstDate): string {
  return `${formatKstDate(date)} (${WEEKDAY_LABEL[date.weekday]})`;
}

export function kstDateToKey(date: KstDate): string {
  return `${date.year}-${String(date.month + 1).padStart(2, "0")}-${String(date.day).padStart(2, "0")}`;
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
