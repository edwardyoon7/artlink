"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";

type Profile = {
  photoUrl: string | null;
  education: string | null;
  exhibitions: string | null;
  awards: string | null;
};

export function ArtistProfileButton({
  artistName,
  profile,
}: {
  artistName: string;
  profile: Profile;
}) {
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
        className="rounded-full border border-ink/30 px-3 py-1 text-xs tracking-[0.15em] text-ink transition-colors hover:border-terracotta hover:text-terracotta"
      >
        PROFILE
      </button>

      {open &&
        mounted &&
        createPortal(
          <div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/50 px-6"
            onClick={() => setOpen(false)}
          >
            <div
              className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-sm border border-ink/10 bg-base p-8 shadow-lg"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-4">
                <p className="font-[var(--font-serif-en)] text-xs tracking-[0.3em] text-terracotta">
                  ARTIST PROFILE
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

              <div className="mt-4 flex items-start gap-4">
                {profile.photoUrl ? (
                  <div className="relative aspect-square w-24 shrink-0 overflow-hidden rounded-sm border border-ink/10">
                    <Image src={profile.photoUrl} alt={`${artistName} 작가 사진`} fill sizes="96px" className="object-cover" />
                  </div>
                ) : (
                  <div className="flex aspect-square w-24 shrink-0 items-center justify-center rounded-sm border border-ink/10 bg-ink/5 text-[10px] text-ink/40">
                    사진 없음
                  </div>
                )}
                <h2 className="mt-1 font-[var(--font-serif-kr)] text-xl">{artistName}</h2>
              </div>

              <div className="mt-6 space-y-4 text-sm leading-relaxed text-ink/80">
                {profile.education && (
                  <div>
                    <p className="text-xs tracking-wide text-ink/50">학력</p>
                    <p className="mt-1 whitespace-pre-line">{profile.education}</p>
                  </div>
                )}
                {profile.exhibitions && (
                  <div>
                    <p className="text-xs tracking-wide text-ink/50">전시경력</p>
                    <p className="mt-1 whitespace-pre-line">{profile.exhibitions}</p>
                  </div>
                )}
                {profile.awards && (
                  <div>
                    <p className="text-xs tracking-wide text-ink/50">수상경력</p>
                    <p className="mt-1 whitespace-pre-line">{profile.awards}</p>
                  </div>
                )}
                {!profile.education && !profile.exhibitions && !profile.awards && (
                  <p className="text-ink/50">등록된 이력 정보가 없습니다.</p>
                )}
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
