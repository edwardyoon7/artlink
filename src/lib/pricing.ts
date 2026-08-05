export const LISTING_FEE = 3_000; // 위탁판매 등록비 (작품 1점당, 1회)
export const COACHING_FEE = 100_000; // 코칭 서비스 비용 (세션 1회당)
export const COMMISSION_RATE = 0.3; // 위탁판매 수수료율 (판매가의 30%)

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

export function calcSettlement(price: number) {
  const commission = Math.round(price * COMMISSION_RATE);
  return { commission, settlement: price - commission };
}

export function getBankInfo() {
  return {
    bankName: process.env.BANK_NAME ?? "(미설정)",
    accountNumber: process.env.BANK_ACCOUNT_NUMBER ?? "(미설정)",
    accountHolder: process.env.BANK_ACCOUNT_HOLDER ?? "(미설정)",
  };
}
