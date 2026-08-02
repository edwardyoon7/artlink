"use client";

import { useState } from "react";

const STEPS = [
  { title: "① 아이디어 제출", desc: "작가가 원하는 굿즈 아이디어와 타겟층을 제안합니다.", fee: "무료" },
  { title: "② 아이디어/디자인 컨설팅", desc: "Artieum가 디자인 방향과 타겟 마케팅을 함께 설계합니다.", fee: "건별 청구" },
  { title: "③ 제작 의뢰", desc: "확정된 방향을 외주 제작업체에 의뢰합니다.", fee: "건별 청구" },
  { title: "④ 샘플 검토", desc: "초도 샘플을 확인하고 사진·영상을 작가에게 공유합니다.", fee: "건별 청구" },
  { title: "⑤ 샘플 승인", desc: "작가가 샘플을 확인하고 승인합니다.", fee: "-" },
  { title: "⑥ 발행", desc: "작가가 최종 가격·설명·사진을 등록하면 홈페이지에 공개됩니다.", fee: "-" },
];

export function GoodsProcessInfo() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-4 inline-flex items-center gap-1 text-sm text-ink/70 underline hover:text-ink"
      >
        진행 절차 안내 보기
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-6"
          onClick={() => setOpen(false)}
        >
          <div
            className="max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-sm bg-base p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2 className="font-[var(--font-serif-kr)] text-xl">굿즈 진행 절차</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="닫기"
                className="text-ink/50 hover:text-ink"
              >
                ✕
              </button>
            </div>
            <p className="mt-2 text-xs text-ink/50">
              컨설팅·제작의뢰·샘플검토 비용은 건별로 다르며, 각 단계에 도달했을 때 개별 안내드립니다.
            </p>
            <div className="mt-6 space-y-4">
              {STEPS.map((step) => (
                <div key={step.title} className="rounded-sm border border-ink/10 p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-ink">{step.title}</p>
                    <span className="rounded-full bg-ink/10 px-3 py-1 text-xs text-ink/70">{step.fee}</span>
                  </div>
                  <p className="mt-1 text-sm text-ink/60">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
