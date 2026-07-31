import { SiteHeader } from "@/components/site-header";
import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-base text-ink">
      <SiteHeader />
      <section className="mx-auto max-w-md px-6 pt-40 pb-20">
        <h1 className="font-[var(--font-serif-kr)] text-3xl">로그인</h1>
        <p className="mt-3 text-sm text-ink/70">
          작가 등록·코칭 신청 시 만든 계정으로 로그인해 신청 현황을 확인하세요.
        </p>
        <LoginForm />
      </section>
    </div>
  );
}
