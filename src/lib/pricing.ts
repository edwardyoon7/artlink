export const LISTING_FEE = 50_000; // 위탁판매 등록비 (작품 1점당, 1회)
export const COACHING_FEE = 100_000; // 코칭 서비스 비용 (세션 1회당)
export const COMMISSION_RATE = 0.3; // 위탁판매 수수료율 (판매가의 30%)

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
