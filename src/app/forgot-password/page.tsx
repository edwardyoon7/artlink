import { SiteHeader } from "@/components/site-header";
import { ForgotPasswordForm } from "@/components/forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-base text-ink">
      <SiteHeader />
      <section className="mx-auto max-w-md px-6 pt-40 pb-20">
        <h1 className="font-[var(--font-serif-kr)] text-3xl">비밀번호 찾기</h1>
        <p className="mt-3 text-sm text-ink/70">
          가입 시 등록한 이메일과 비밀번호 힌트로 본인 확인 후 새 비밀번호를 설정할 수 있습니다.
        </p>
        <ForgotPasswordForm />
      </section>
    </div>
  );
}
