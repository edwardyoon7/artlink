export const GOODS_STAGE_LABELS: Record<string, string> = {
  REQUESTED: "아이디어 접수",
  CONSULTING: "컨설팅 진행 중",
  COMMISSIONED: "제작 의뢰 중",
  SAMPLE_REVIEW: "샘플 검토 중",
  APPROVED: "샘플 승인 완료",
  LISTED: "판매 중",
  SOLD_OUT: "품절",
};

export const GOODS_STAGE_CLASSES: Record<string, string> = {
  REQUESTED: "bg-ink/10 text-ink",
  CONSULTING: "bg-terracotta/15 text-terracotta",
  COMMISSIONED: "bg-terracotta/15 text-terracotta",
  SAMPLE_REVIEW: "bg-terracotta/15 text-terracotta",
  APPROVED: "bg-ink text-base",
  LISTED: "bg-ink text-base",
  SOLD_OUT: "bg-red-100 text-red-800",
};

import type { PaymentType, GoodsStage } from "@/generated/prisma/client";

// 현재 stage → 관리자가 다음에 청구해야 할 결제 타입 (null이면 청구할 것 없음)
export const NEXT_INVOICE_TYPE: Record<string, PaymentType | null> = {
  REQUESTED: "GOODS_IDEA_FEE",
  CONSULTING: "GOODS_PRODUCTION_FEE",
  COMMISSIONED: "GOODS_SAMPLE_FEE",
  SAMPLE_REVIEW: null,
  APPROVED: null,
  LISTED: null,
  SOLD_OUT: null,
};

// 결제 타입이 CONFIRMED되면 굿즈가 넘어갈 다음 stage
export const PAYMENT_TYPE_TO_NEXT_STAGE: Record<string, GoodsStage> = {
  GOODS_IDEA_FEE: "CONSULTING",
  GOODS_PRODUCTION_FEE: "COMMISSIONED",
  GOODS_SAMPLE_FEE: "SAMPLE_REVIEW",
};

export const GOODS_FEE_TYPE_LABELS: Record<string, string> = {
  GOODS_IDEA_FEE: "아이디어/디자인 컨설팅 비용",
  GOODS_PRODUCTION_FEE: "제작 의뢰 비용",
  GOODS_SAMPLE_FEE: "샘플 검토 비용",
};
