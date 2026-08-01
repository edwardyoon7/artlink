import type { ArtworkCategory } from "@/generated/prisma/client";

export const ARTWORK_CATEGORY_LABELS: Record<ArtworkCategory, string> = {
  ORIENTAL_PAINTING: "동양화",
  WESTERN_PAINTING: "서양화",
  SCULPTURE: "조각",
  OTHER: "기타",
  UNCATEGORIZED: "미분류",
};

// 작품 등록·구분 수정 시 작가가 고를 수 있는 값 (미분류는 마이그레이션 기본값일 뿐, 직접 선택 불가)
export const SELECTABLE_ARTWORK_CATEGORIES: ArtworkCategory[] = [
  "ORIENTAL_PAINTING",
  "WESTERN_PAINTING",
  "SCULPTURE",
  "OTHER",
];

// 검색 필터에서는 미분류 작품도 찾을 수 있어야 하므로 전체 값을 노출
export const ARTWORK_CATEGORY_FILTER_OPTIONS: ArtworkCategory[] = [
  "ORIENTAL_PAINTING",
  "WESTERN_PAINTING",
  "SCULPTURE",
  "OTHER",
  "UNCATEGORIZED",
];
