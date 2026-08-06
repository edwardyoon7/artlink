// 서버(Lightsail) 시스템 시간대가 UTC라, Date를 timeZone 지정 없이 toLocaleString/
// toLocaleDateString으로 포맷하면 한국시간보다 9시간 이른 값이 표시된다. 날짜/시각을
// 사람에게 보여줄 때는 항상 이 헬퍼를 통해 Asia/Seoul로 고정할 것.
const KST = "Asia/Seoul";

export function formatDateTimeKST(date: Date | string): string {
  return new Date(date).toLocaleString("ko-KR", { timeZone: KST });
}

export function formatDateKST(
  date: Date | string,
  options?: Intl.DateTimeFormatOptions,
): string {
  return new Date(date).toLocaleDateString("ko-KR", { timeZone: KST, ...options });
}
