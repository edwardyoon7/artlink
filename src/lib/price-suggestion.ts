import { prisma } from "@/lib/prisma";

/**
 * 추천 가격대 계산 공식 (1차 버전, 데이터가 쌓이면 재조정 필요):
 * 1) 이 작가의 최근 판매완료(SOLD) 작품 최대 5건을 최신순으로 가져와,
 *    최근 것일수록 가중치를 높게(1, 0.8, 0.6, 0.4, 0.2) 두어 가중평균을 낸다.
 * 2) 승인된 프로 신청서의 전시 횟수만큼 가중평균을 소폭 상향 보정한다 (전시 1회당 +2%, 최대 +30%).
 * 3) 보정된 값의 -10% ~ +15% 구간을 참고 가격대로 제시한다.
 *
 * 판매 이력이 전혀 없으면 근거 없는 추측을 하지 않기 위해 추천값을 내지 않는다.
 */
const RECENCY_WEIGHTS = [1, 0.8, 0.6, 0.4, 0.2];
const EXHIBITION_BONUS_PER_COUNT = 0.02;
const EXHIBITION_BONUS_CAP = 0.3;
const RANGE_LOWER = 0.9;
const RANGE_UPPER = 1.15;

export type PriceSuggestion = {
  min: number;
  max: number;
  basis: string;
};

export async function getPriceSuggestion(artistId: string): Promise<PriceSuggestion | null> {
  const soldArtworks = await prisma.artwork.findMany({
    where: { artistId, status: "SOLD" },
    orderBy: { updatedAt: "desc" },
    take: RECENCY_WEIGHTS.length,
  });

  if (soldArtworks.length === 0) {
    return null;
  }

  const weights = RECENCY_WEIGHTS.slice(0, soldArtworks.length);
  const weightSum = weights.reduce((a, b) => a + b, 0);
  const weightedAvg =
    soldArtworks.reduce((sum, artwork, i) => sum + artwork.price * weights[i], 0) / weightSum;

  const application = await prisma.application.findFirst({
    where: { userId: artistId, type: "PRO", status: "APPROVED" },
    orderBy: { createdAt: "desc" },
  });
  const exhibitionCount = application?.exhibitionCount ?? 0;
  const exhibitionBonus = Math.min(exhibitionCount * EXHIBITION_BONUS_PER_COUNT, EXHIBITION_BONUS_CAP);
  const adjusted = weightedAvg * (1 + exhibitionBonus);

  return {
    min: Math.round(adjusted * RANGE_LOWER),
    max: Math.round(adjusted * RANGE_UPPER),
    basis: `최근 판매 ${soldArtworks.length}건 평균가와 전시 ${exhibitionCount}회 이력을 반영한 참고 가격대입니다.`,
  };
}
