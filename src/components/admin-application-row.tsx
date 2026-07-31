"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { StatusBadge } from "@/components/status-badge";

type Application = {
  id: string;
  type: string;
  status: string;
  name: string;
  phone: string;
  email: string;
  education: string | null;
  career: string | null;
  exhibitionCount: number | null;
  motivation: string | null;
  createdAt: string;
  documents: { id: string; filename: string }[];
};

const ACTIONS: { status: string; label: string }[] = [
  { status: "RECEIVED", label: "접수 처리" },
  { status: "APPROVED", label: "승인" },
  { status: "REJECTED", label: "반려" },
];

export function AdminApplicationRow({ application }: { application: Application }) {
  const router = useRouter();
  const [status, setStatus] = useState(application.status);
  const [updating, setUpdating] = useState(false);
  const [expanded, setExpanded] = useState(false);

  async function updateStatus(next: string) {
    setUpdating(true);
    const res = await fetch(`/api/applications/${application.id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    setUpdating(false);
    if (res.ok) {
      setStatus(next);
      router.refresh();
    }
  }

  return (
    <div className="rounded-sm border border-ink/20 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="font-[var(--font-serif-en)] text-xs tracking-[0.3em] text-ink/60">
            {application.type === "PRO" ? "PRO ARTIST" : "AMATEUR ARTIST"}
          </span>
          <p className="mt-1 font-[var(--font-serif-kr)] text-lg">{application.name}</p>
        </div>
        <StatusBadge status={status} />
      </div>

      <button
        onClick={() => setExpanded((v) => !v)}
        className="mt-3 text-sm text-ink/50 hover:text-ink"
      >
        {expanded ? "접기 ↑" : "상세 보기 ↓"}
      </button>

      {expanded && (
        <div className="mt-4 space-y-1 border-t border-ink/10 pt-4 text-sm text-ink/70">
          <p>전화번호: {application.phone}</p>
          <p>이메일: {application.email}</p>
          {application.education && <p>학력: {application.education}</p>}
          {application.career && <p>경력: {application.career}</p>}
          {application.exhibitionCount != null && <p>전시 횟수: {application.exhibitionCount}회</p>}
          {application.motivation && <p>지원 동기: {application.motivation}</p>}
          <p>신청일: {application.createdAt}</p>
          <div>
            <p>첨부 서류 ({application.documents.length}건):</p>
            {application.documents.length === 0 ? (
              <p className="text-ink/50">첨부된 파일이 없습니다.</p>
            ) : (
              <ul className="ml-4 list-disc">
                {application.documents.map((doc) => (
                  <li key={doc.id}>
                    <a
                      href={`/api/documents/${doc.id}`}
                      className="underline hover:text-ink"
                    >
                      {doc.filename}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      <div className="mt-4 flex gap-2">
        {ACTIONS.map((action) => (
          <button
            key={action.status}
            disabled={updating || status === action.status}
            onClick={() => updateStatus(action.status)}
            className="rounded-full border border-ink/30 px-4 py-1.5 text-xs tracking-wide text-ink transition-colors hover:bg-ink hover:text-base disabled:opacity-40"
          >
            {action.label}
          </button>
        ))}
      </div>
    </div>
  );
}
