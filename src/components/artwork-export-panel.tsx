"use client";

import { useState } from "react";

const FORMATS: { key: string; label: string }[] = [
  { key: "excel", label: "Excel" },
  { key: "pdf", label: "PDF" },
  { key: "word", label: "Word" },
];

export function ArtworkExportPanel() {
  const [includeBuyer, setIncludeBuyer] = useState(false);

  return (
    <div className="rounded-sm border border-ink/20 p-6">
      <p className="font-[var(--font-serif-kr)] text-lg">유통내역 추출</p>
      <p className="mt-1 text-sm text-ink/60">
        판매 완료된 작품의 유통내역(판매일시·작품명·에디션번호·판매금액·판매자·작가·작품사진)을
        파일로 내려받습니다.
      </p>

      <label className="mt-4 flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={includeBuyer}
          onChange={(e) => setIncludeBuyer(e.target.checked)}
        />
        구매자 정보(성함·연락처) 포함
      </label>
      <p className="mt-1 text-xs text-ink/50">
        구매자 정보는 내부 가계부 용도로만 저장되며, 관공서 등 외부 제출용 파일에는 기본적으로
        빼고 추출하는 것을 권장합니다.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {FORMATS.map((format) => (
          <a
            key={format.key}
            href={`/api/artworks/export?format=${format.key}&includeBuyer=${includeBuyer}`}
            className="rounded-full border border-ink/30 px-4 py-1.5 text-xs tracking-wide text-ink transition-colors hover:bg-ink hover:text-base"
          >
            {format.label} 다운로드
          </a>
        ))}
      </div>
    </div>
  );
}
