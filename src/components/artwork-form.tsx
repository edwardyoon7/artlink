"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ARTWORK_CATEGORY_LABELS, SELECTABLE_ARTWORK_CATEGORIES } from "@/lib/artwork-category";

type Suggestion = { min: number; max: number; basis: string };

export function ArtworkForm({ suggestion }: { suggestion: Suggestion | null }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [price, setPrice] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    const formData = new FormData(event.currentTarget);
    const res = await fetch("/api/artworks", {
      method: "POST",
      body: formData,
    });

    setSubmitting(false);

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "등록 중 오류가 발생했습니다.");
      return;
    }

    router.push("/mypage");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-4">
      <label className="block text-sm">
        <span className="text-ink/70">작품명</span>
        <input
          name="title"
          required
          className="mt-1 w-full rounded-sm border border-ink/20 bg-base px-3 py-2 outline-none focus:border-ink"
        />
      </label>
      <label className="block text-sm">
        <span className="text-ink/70">재료·사이즈 (선택, 예: Hanji mixed with acrylic on canvas - 116.8 x 91 cm)</span>
        <input
          name="caption"
          className="mt-1 w-full rounded-sm border border-ink/20 bg-base px-3 py-2 outline-none focus:border-ink"
        />
      </label>
      <label className="block text-sm">
        <span className="text-ink/70">작품 소개 (선택)</span>
        <textarea
          name="description"
          rows={4}
          className="mt-1 w-full rounded-sm border border-ink/20 bg-base px-3 py-2 outline-none focus:border-ink"
        />
      </label>
      <label className="block text-sm">
        <span className="text-ink/70">에디션 번호 (선택, 판화·한정판 등에 해당할 경우 예: 3/50)</span>
        <input
          name="editionNumber"
          className="mt-1 w-full rounded-sm border border-ink/20 bg-base px-3 py-2 outline-none focus:border-ink"
        />
      </label>
      <div className="grid grid-cols-2 gap-4">
        <label className="block text-sm">
          <span className="text-ink/70">실제 가로 크기 (cm)</span>
          <input
            name="widthCm"
            type="number"
            min={1}
            max={1000}
            step="0.1"
            required
            className="mt-1 w-full rounded-sm border border-ink/20 bg-base px-3 py-2 outline-none focus:border-ink"
          />
        </label>
        <label className="block text-sm">
          <span className="text-ink/70">실제 세로 크기 (cm)</span>
          <input
            name="heightCm"
            type="number"
            min={1}
            max={1000}
            step="0.1"
            required
            className="mt-1 w-full rounded-sm border border-ink/20 bg-base px-3 py-2 outline-none focus:border-ink"
          />
        </label>
      </div>
      <p className="text-xs text-ink/50">
        실제 크기는 작품 상세 페이지의 “ARTIEUM VIRTUAL” 가상 배치 미리보기(현관·거실·사무실에 실제
        비율로 걸어본 모습)를 만드는 데 사용됩니다.
      </p>
      <label className="block text-sm">
        <span className="text-ink/70">작품 이미지 (선택, 홈 화면 썸네일로 노출됩니다)</span>
        <input
          name="image"
          type="file"
          accept="image/*"
          className="mt-1 block w-full text-sm text-ink/70 file:mr-4 file:rounded-full file:border-0 file:bg-ink/10 file:px-4 file:py-2 file:text-ink"
        />
      </label>
      <fieldset className="block text-sm">
        <legend className="text-ink/70">구분</legend>
        <div className="mt-2 flex flex-wrap gap-4">
          {SELECTABLE_ARTWORK_CATEGORIES.map((category) => (
            <label key={category} className="flex items-center gap-1.5 text-sm">
              <input type="radio" name="category" value={category} required />
              {ARTWORK_CATEGORY_LABELS[category]}
            </label>
          ))}
        </div>
      </fieldset>

      {suggestion ? (
        <div className="rounded-sm border border-terracotta/40 bg-terracotta/5 p-4 text-sm">
          <p className="font-medium text-ink">
            가격 컨설팅 참고 가격대: {suggestion.min.toLocaleString()}원 ~ {suggestion.max.toLocaleString()}원
          </p>
          <p className="mt-1 text-xs text-ink/60">{suggestion.basis} (무료 참고용이며 최종 가격은 작가가 결정합니다)</p>
          <button
            type="button"
            onClick={() => setPrice(String(Math.round((suggestion.min + suggestion.max) / 2)))}
            className="mt-2 rounded-full border border-terracotta px-3 py-1 text-xs text-terracotta"
          >
            참고 가격 적용
          </button>
        </div>
      ) : (
        <p className="text-xs text-ink/50">
          아직 판매 이력이 없어 가격 컨설팅 참고 가격대를 제공할 수 없습니다. 첫 판매 이후부터 제공됩니다.
        </p>
      )}

      <label className="block text-sm">
        <span className="text-ink/70">판매 가격 (원)</span>
        <input
          name="price"
          type="number"
          min={1}
          required
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="mt-1 w-full rounded-sm border border-ink/20 bg-base px-3 py-2 outline-none focus:border-ink"
        />
        <span className="mt-1 block text-xs text-ink/50">
          가격은 작가가 직접 책정합니다. 판매 시 수수료 30%가 차감됩니다.
        </span>
      </label>
      {error && <p className="text-sm text-red-700">{error}</p>}
      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-full bg-ink px-8 py-3 text-sm tracking-wide text-base disabled:opacity-60"
      >
        {submitting ? "등록 중..." : "위탁판매 등록하기"}
      </button>
    </form>
  );
}
