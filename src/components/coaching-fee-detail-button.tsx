"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

const FEE_ROWS = [
  { duration: "2시간", fee: "60,000원" },
  { duration: "4시간", fee: "100,000원" },
];

export function CoachingFeeDetailButton() {
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
        className="text-terracotta underline decoration-terracotta/40 underline-offset-2 transition-colors hover:decoration-terracotta"
      >
        코칭 비용 상세
      </button>

      {open &&
        mounted &&
        createPortal(
          <div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/50 px-6"
            onClick={() => setOpen(false)}
          >
            <div
              className="w-full max-w-sm rounded-sm border border-ink/10 bg-base p-8 shadow-lg"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-4">
                <p className="font-[var(--font-serif-en)] text-xs tracking-[0.3em] text-terracotta">
                  COACHING FEE
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

              <h2 className="mt-3 font-[var(--font-serif-kr)] text-xl">코칭 비용 안내</h2>
              <p className="mt-1 text-xs text-ink/50">주 2회 진행 기준</p>

              <table className="mt-5 w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-ink/20 text-ink/50">
                    <th className="pb-2 text-left font-normal">시간</th>
                    <th className="pb-2 text-right font-normal">비용</th>
                  </tr>
                </thead>
                <tbody>
                  {FEE_ROWS.map((row) => (
                    <tr key={row.duration} className="border-b border-ink/10">
                      <td className="py-2.5 text-ink/80">{row.duration}</td>
                      <td className="py-2.5 text-right font-medium text-ink">{row.fee}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <p className="mt-4 text-xs leading-relaxed text-ink/60">
                1주일 최대 3회까지 예약 가능합니다.
              </p>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
