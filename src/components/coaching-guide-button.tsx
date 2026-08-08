"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";

// 홈 "교육" 섹션의 "1:1 코칭" 항목 옆에 배치되는 안내 버튼 — 지역선택→강사매칭→시간예약→
// 결제신청→2단계확정→안내메일까지 코칭 예약 흐름을 한 장으로 정리한 이미지를 팝업으로
// 보여준다. 비용(2시간 6만원·4시간 10만원)도 이미지 안에 포함돼 있는데, 작품 가격·작가
// 프로필과 달리 코칭 비용은 로그인 게이팅 대상이 아니라(CLAUDE.md 참고) 비회원에게도 그대로
// 노출한다.
const IMAGE_WIDTH = 1800;
const IMAGE_HEIGHT = 1273;

export function CoachingGuideButton() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-full border border-terracotta/40 px-3 py-1 text-xs tracking-[0.15em] text-terracotta transition-colors hover:border-terracotta hover:bg-terracotta hover:text-base"
      >
        GUIDE
      </button>

      {open &&
        mounted &&
        createPortal(
          <div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/50 px-6"
            onClick={() => setOpen(false)}
          >
            <div
              className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-sm border border-ink/10 bg-base p-4 shadow-lg sm:p-6"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-4 px-2 pb-3 sm:px-2">
                <p className="font-[var(--font-serif-en)] text-xs tracking-[0.3em] text-terracotta">
                  COACHING GUIDE
                </p>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="닫기"
                  className="text-ink/50 transition-colors hover:text-ink"
                >
                  ✕
                </button>
              </div>
              <Image
                src="/home-images/coaching-guide.jpg"
                alt="아트이음 코칭 서비스 안내 — 비전공·취미 작가를 위한 맞춤 미술 코칭. 2시간 60,000원, 4시간 100,000원, 주 최대 3회. 지역 선택 → 강사 매칭 → 시간 예약 → 결제 신청 → 2단계 확정 → 안내 메일 순으로 진행됩니다. 확정 이후 전문 교육기관 진학을 원하시면 후속 코칭까지 지원합니다."
                width={IMAGE_WIDTH}
                height={IMAGE_HEIGHT}
                className="w-full rounded-sm border border-ink/10"
              />
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
