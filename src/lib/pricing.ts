// 위탁판매 등록비 — 작가당 처음 FREE_ARTWORK_COUNT개는 무료, 그 이후 등록분부터 작품 1점당
// LISTING_FEE 부과 (2026-08-06, 경쟁 플랫폼 대부분이 등록 자체는 무료이고 판매 시 수수료만
// 받는 구조라는 걸 확인하고 신규 작가 진입장벽을 낮추기 위해 3,000원 균일 부과에서 변경).
export const FREE_ARTWORK_COUNT = 3;
export const LISTING_FEE = 2_000;
export const COMMISSION_RATE = 0.3; // 위탁판매 정상 수수료율 (판매가의 30%)

// 판매 수수료 프로모션 — 2026년 한 해, 신규 작가 유치를 위해 30%→25%로 5%p 인하
// (2026-08-08 결정). 2026-12-31(KST)까지 "판매완료 처리(soldAt)"된 건에만 적용되고,
// 2027-01-01부터는 정상 요율(30%)로 자동 복귀한다. 컬렉터가 지불하는 가격(price/finalPrice)
// 에는 영향이 없고, 작가에게 돌아가는 정산액에만 영향을 준다 — 즉 "가격 할인"이 아니라
// "작가 수익 우대" 프로모션.
export const COMMISSION_PROMO_RATE = 0.25;
export const COMMISSION_PROMO_DEADLINE = new Date("2026-12-31T23:59:59+09:00");

export function isCommissionPromoActive(now: Date = new Date()) {
  return now.getTime() <= COMMISSION_PROMO_DEADLINE.getTime();
}

export function getCommissionRate(now: Date = new Date()): number {
  return isCommissionPromoActive(now) ? COMMISSION_PROMO_RATE : COMMISSION_RATE;
}

// existingArtworkCount: 이번에 등록하는 작품을 제외한, 이 작가가 이미 등록한 작품 수
export function getListingFee(existingArtworkCount: number) {
  return existingArtworkCount < FREE_ARTWORK_COUNT ? 0 : LISTING_FEE;
}

// 코칭 서비스 비용 — 2026-08-07부터 시간대별 요금제로 개편(주 2회 진행 기준).
// 1주 최대 3회까지 예약 가능(안내 문구, 시스템상 강제하지는 않음).
export const COACHING_DURATIONS = [2, 4] as const;
export type CoachingDurationHours = (typeof COACHING_DURATIONS)[number];

const COACHING_FEE_BY_DURATION: Record<CoachingDurationHours, number> = {
  2: 60_000,
  4: 100_000,
};

export function isCoachingDurationHours(value: unknown): value is CoachingDurationHours {
  return typeof value === "number" && COACHING_DURATIONS.includes(value as CoachingDurationHours);
}

export function getCoachingFee(durationHours: CoachingDurationHours): number {
  return COACHING_FEE_BY_DURATION[durationHours];
}

// 프로 작가 프로필 노출 프리미엄 서비스 — 정가 20,000원, 프로모션 기간(~2026-11-30 KST)에는 50% 할인.
// 신청 시점의 날짜로 금액이 확정되며(스냅샷), 이후 운영자 확인이 늦어져도 그 사이 프로모션이
// 끝났다고 해서 금액이 소급 변경되지 않는다.
export const PROFILE_FEE = 20_000;
export const PROFILE_FEE_PROMO = 10_000;
export const PROFILE_FEE_PROMO_DEADLINE = new Date("2026-11-30T23:59:59+09:00");

export function getProfileFee(now: Date = new Date()) {
  return now.getTime() <= PROFILE_FEE_PROMO_DEADLINE.getTime() ? PROFILE_FEE_PROMO : PROFILE_FEE;
}

export function isProfileFeePromoActive(now: Date = new Date()) {
  return now.getTime() <= PROFILE_FEE_PROMO_DEADLINE.getTime();
}

// now: 수수료율을 어느 시점 기준으로 적용할지 — 이미 판매완료된 건은 그 작품의 soldAt을,
// 아직 판매 전인 건(미리보기)은 기본값(현재 시각)을 넘겨서 쓴다.
export function calcSettlement(price: number, now: Date = new Date()) {
  const rate = getCommissionRate(now);
  const commission = Math.round(price * rate);
  return { commission, settlement: price - commission, rate };
}

export function getBankInfo() {
  return {
    bankName: process.env.BANK_NAME ?? "(미설정)",
    accountNumber: process.env.BANK_ACCOUNT_NUMBER ?? "(미설정)",
    accountHolder: process.env.BANK_ACCOUNT_HOLDER ?? "(미설정)",
  };
}
