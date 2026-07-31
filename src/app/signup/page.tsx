import { SiteHeader } from "@/components/site-header";
import { SignupForm } from "@/components/signup-form";

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-base text-ink">
      <SiteHeader />
      <section className="mx-auto max-w-md px-6 pt-40 pb-20">
        <h1 className="font-[var(--font-serif-kr)] text-3xl">회원가입</h1>
        <p className="mt-3 text-sm text-ink/70">
          가입하시면 작품의 자세한 설명과 구입 방법을 확인하실 수 있습니다.
        </p>
        <SignupForm />
      </section>
    </div>
  );
}
