"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export function AboutArtieum() {
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
        className="tracking-wide text-ink/70 transition-colors hover:text-ink"
      >
        아트이음
      </button>

      {open &&
        mounted &&
        createPortal(
          <div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/50 px-6"
            onClick={() => setOpen(false)}
          >
            <div
              className="max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-sm border border-ink/10 bg-base p-8 shadow-lg"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-4">
                <h2 className="font-[var(--font-serif-en)] text-2xl tracking-[0.15em]">
                  ART·IEUM
                </h2>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="닫기"
                  className="text-ink/50 transition-colors hover:text-ink"
                >
                  ✕
                </button>
              </div>
              <div className="mt-6 space-y-4 text-sm leading-relaxed text-ink/80">
                <p>
                  아트이음(ART·IEUM)은 작가와 컬렉터를 이어주는 온라인 플랫폼입니다. 미술
                  입문자가 작가로 성장할 수 있는 맞춤형 컨설팅을 제공합니다. 그들이 첫 번째
                  전시회를 열 수 있는 기회를 만들어줍니다. 또한 컬렉터들에게 신진 작가의
                  작품을 홍보함으로써, 성장 가능한 작가의 작품을 조기에 소장할 수 있는
                  기회를 만들어 줍니다. 따라서 아트이음은 기존의 플랫폼과 차별화된 서비스를
                  제공합니다.
                </p>
                <p>
                  애다아트기획의 대표인 윤진수 작가는 한양대학교 전자공학과를 졸업하고
                  대기업에서 시스템 개발 경험을 갖고 있으며, 홍익대학교 미술대학원 미술학과를
                  졸업한 작가로서, 그의 다양한 경험과 노하우를 바탕으로 아트이음이
                  만들어졌습니다.
                </p>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
