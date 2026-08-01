import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { SiteHeader } from "@/components/site-header";
import { PasswordChangeForm } from "@/components/password-change-form";
import { PasswordHintForm } from "@/components/password-hint-form";

export default async function AccountSettingsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });

  return (
    <div className="min-h-screen bg-base text-ink">
      <SiteHeader />
      <section className="mx-auto max-w-xl px-6 pt-40 pb-20">
        <h1 className="font-[var(--font-serif-kr)] text-3xl">계정 설정</h1>
        <p className="mt-3 text-sm text-ink/70">이메일({user?.email})은 변경할 수 없습니다.</p>

        <div className="mt-10">
          <h2 className="font-[var(--font-serif-kr)] text-xl">비밀번호 변경</h2>
          <div className="mt-4">
            <PasswordChangeForm />
          </div>
        </div>

        <div className="mt-16">
          <h2 className="font-[var(--font-serif-kr)] text-xl">비밀번호 힌트</h2>
          <p className="mt-2 text-sm text-ink/60">
            비밀번호를 잊었을 때 본인 확인에 사용됩니다.
          </p>
          <div className="mt-4">
            <PasswordHintForm currentQuestion={user?.passwordHintQuestion ?? null} />
          </div>
        </div>
      </section>
    </div>
  );
}
