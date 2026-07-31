"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";

type ApplicationType = "PRO" | "AMATEUR";

export function ApplicationForm({
  type,
  accentClass,
}: {
  type: ApplicationType;
  accentClass: string;
}) {
  const [status, setStatus] = useState<"idle" | "submitting" | "done" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    const password = formData.get("password") as string;
    const passwordConfirm = formData.get("passwordConfirm") as string;
    if (password !== passwordConfirm) {
      setStatus("error");
      setErrorMessage("비밀번호가 일치하지 않습니다.");
      return;
    }
    formData.delete("passwordConfirm");
    formData.set("type", type);

    setStatus("submitting");
    setErrorMessage("");

    const res = await fetch("/api/applications", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setStatus("error");
      setErrorMessage(body.error ?? "신청 처리 중 오류가 발생했습니다.");
      return;
    }

    setStatus("done");
    form.reset();
  }

  if (status === "done") {
    return (
      <div className="rounded-sm border-2 border-current p-8 text-center">
        <p className="font-[var(--font-serif-kr)] text-xl">신청이 접수되었습니다.</p>
        <p className="mt-3 text-sm text-ink/70">
          입력하신 이메일과 비밀번호로 <Link href="/login" className="underline">로그인</Link> 후,
          마이페이지에서 심사 상태를 확인할 수 있습니다.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <fieldset className="space-y-4">
        <legend className="mb-2 font-[var(--font-serif-kr)] text-lg">기본 정보</legend>
        <Field label="성함" name="name" required />
        <Field label="전화번호" name="phone" type="tel" required />
        <Field label="이메일" name="email" type="email" required />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="비밀번호 (8자 이상)" name="password" type="password" minLength={8} required />
          <Field label="비밀번호 확인" name="passwordConfirm" type="password" minLength={8} required />
        </div>
      </fieldset>

      {type === "PRO" ? (
        <fieldset className="space-y-4">
          <legend className="mb-2 font-[var(--font-serif-kr)] text-lg">경력 정보</legend>
          <TextArea label="학력" name="education" required />
          <TextArea label="미술 작가경력" name="career" required />
          <Field label="전시 횟수 (숫자로 입력)" name="exhibitionCount" type="number" required />
          <p className="-mt-2 text-xs text-ink/50">
            승인 후 작품 등록 시 추천 가격대 계산에 참고됩니다.
          </p>
          <FileField label="증빙서류 (학력·경력·전시 이력 등, 최대 5개)" name="documents" />
        </fieldset>
      ) : (
        <fieldset className="space-y-4">
          <legend className="mb-2 font-[var(--font-serif-kr)] text-lg">지원 정보</legend>
          <TextArea label="지원 동기 및 희망 커리큘럼" name="motivation" required />
          <FileField label="참고 작품·포트폴리오 (선택, 최대 5개)" name="documents" />
        </fieldset>
      )}

      {status === "error" && (
        <p className="text-sm text-red-700">{errorMessage}</p>
      )}

      <button
        type="submit"
        disabled={status === "submitting"}
        className={`w-full rounded-full px-8 py-3 text-sm tracking-wide text-base disabled:opacity-60 ${accentClass}`}
      >
        {status === "submitting" ? "제출 중..." : "신청하기"}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  minLength,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  minLength?: number;
}) {
  return (
    <label className="block text-sm">
      <span className="text-ink/70">{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        minLength={minLength}
        className="mt-1 w-full rounded-sm border border-ink/20 bg-base px-3 py-2 outline-none focus:border-ink"
      />
    </label>
  );
}

function TextArea({
  label,
  name,
  required,
}: {
  label: string;
  name: string;
  required?: boolean;
}) {
  return (
    <label className="block text-sm">
      <span className="text-ink/70">{label}</span>
      <textarea
        name={name}
        required={required}
        rows={4}
        className="mt-1 w-full rounded-sm border border-ink/20 bg-base px-3 py-2 outline-none focus:border-ink"
      />
    </label>
  );
}

function FileField({ label, name }: { label: string; name: string }) {
  return (
    <label className="block text-sm">
      <span className="text-ink/70">{label}</span>
      <input
        name={name}
        type="file"
        multiple
        className="mt-1 block w-full text-sm text-ink/70 file:mr-4 file:rounded-full file:border-0 file:bg-ink/10 file:px-4 file:py-2 file:text-ink"
      />
    </label>
  );
}
