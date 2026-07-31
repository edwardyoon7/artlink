"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Goods = {
  id: string;
  stage: string;
  sampleImageUrl: string | null;
  title: string;
};

const VIDEO_EXTENSIONS = [".mp4", ".mov", ".webm"];

function isVideo(url: string) {
  return VIDEO_EXTENSIONS.some((ext) => url.toLowerCase().endsWith(ext));
}

export function GoodsDetailActions({ goods }: { goods: Goods }) {
  const router = useRouter();
  const [approving, setApproving] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleApprove() {
    setApproving(true);
    setError("");
    const res = await fetch(`/api/goods/${goods.id}/approve`, { method: "PATCH" });
    setApproving(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "승인 처리 중 오류가 발생했습니다.");
      return;
    }
    router.refresh();
  }

  async function handlePublish(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    const formData = new FormData(event.currentTarget);
    const res = await fetch(`/api/goods/${goods.id}/publish`, {
      method: "PATCH",
      body: formData,
    });
    setSubmitting(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "발행 중 오류가 발생했습니다.");
      return;
    }
    router.push("/mypage");
    router.refresh();
  }

  if (goods.stage === "SAMPLE_REVIEW") {
    if (!goods.sampleImageUrl) {
      return <p className="text-sm text-ink/60">관리자가 초도 샘플을 준비 중입니다. 준비되면 사진·영상을 공유해드립니다.</p>;
    }
    return (
      <div className="space-y-4">
        <p className="text-sm text-ink/70">초도 샘플을 확인하고 승인 여부를 결정해주세요.</p>
        {isVideo(goods.sampleImageUrl) ? (
          <video src={goods.sampleImageUrl} controls className="w-full rounded-sm" />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={goods.sampleImageUrl} alt="초도 샘플" className="w-full rounded-sm" />
        )}
        {error && <p className="text-sm text-red-700">{error}</p>}
        <button
          onClick={handleApprove}
          disabled={approving}
          className="w-full rounded-full bg-ink px-8 py-3 text-sm tracking-wide text-base disabled:opacity-60"
        >
          {approving ? "처리 중..." : "샘플 승인"}
        </button>
      </div>
    );
  }

  if (goods.stage === "APPROVED") {
    return (
      <form onSubmit={handlePublish} className="space-y-4">
        <p className="text-sm text-ink/70">샘플이 승인되었습니다. 최종 판매 정보를 입력해 굿즈를 공개해주세요.</p>
        <label className="block text-sm">
          <span className="text-ink/70">상품명</span>
          <input
            name="title"
            required
            defaultValue={goods.title}
            className="mt-1 w-full rounded-sm border border-ink/20 bg-base px-3 py-2 outline-none focus:border-ink"
          />
        </label>
        <label className="block text-sm">
          <span className="text-ink/70">상품 설명 (선택)</span>
          <textarea
            name="description"
            rows={4}
            className="mt-1 w-full rounded-sm border border-ink/20 bg-base px-3 py-2 outline-none focus:border-ink"
          />
        </label>
        <label className="block text-sm">
          <span className="text-ink/70">판매 가격 (원)</span>
          <input
            name="price"
            type="number"
            min={1}
            required
            className="mt-1 w-full rounded-sm border border-ink/20 bg-base px-3 py-2 outline-none focus:border-ink"
          />
        </label>
        <label className="block text-sm">
          <span className="text-ink/70">대표 이미지 (선택)</span>
          <input
            name="image"
            type="file"
            accept="image/*"
            className="mt-1 block w-full text-sm text-ink/70 file:mr-4 file:rounded-full file:border-0 file:bg-ink/10 file:px-4 file:py-2 file:text-ink"
          />
        </label>
        {error && <p className="text-sm text-red-700">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-full bg-ink px-8 py-3 text-sm tracking-wide text-base disabled:opacity-60"
        >
          {submitting ? "발행 중..." : "굿즈 공개하기"}
        </button>
      </form>
    );
  }

  if (goods.stage === "LISTED" || goods.stage === "SOLD_OUT") {
    return (
      <Link href={`/goods/${goods.id}`} className="text-sm font-medium text-ink hover:underline">
        공개 페이지 보기 →
      </Link>
    );
  }

  return <p className="text-sm text-ink/60">관리자의 다음 안내를 기다리고 있습니다.</p>;
}
