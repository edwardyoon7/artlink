import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { ApplicationForm } from "@/components/application-form";

const services = [
  {
    title: "맞춤 커리큘럼 추천",
    description:
      "비전공·취미 활동자의 수준과 목표에 맞는 사설기관(미술학원) 커리큘럼을 추천합니다.",
  },
  {
    title: "1:1 코칭",
    description:
      "개인 맞춤 코칭을 통해 취미로 시작한 작업을 완성도 있는 작품으로 발전시킵니다.",
  },
  {
    title: "첫 작품 판매 지원",
    description:
      "완성한 작품을 Artlink에 등록해 소규모로 판매를 시작할 수 있도록 돕습니다.",
  },
  {
    title: "전문 교육기관 진학 컨설팅",
    description:
      "본인의 의지에 따라 전문 교육기관 입학을 희망하는 경우, 진학까지 이어지는 후속 코칭을 제공합니다.",
  },
];

export default function AmateurArtistPage() {
  return (
    <div className="min-h-screen bg-base text-ink">
      <SiteHeader />

      <section className="mx-auto max-w-4xl px-6 pt-40 pb-20">
        <Link href="/#artists" className="text-sm text-ink/50 hover:text-ink">
          ← 작가 소개로 돌아가기
        </Link>
        <p className="mt-8 font-[var(--font-serif-en)] text-xs tracking-[0.35em] text-terracotta">
          AMATEUR ARTIST
        </p>
        <h1 className="mt-3 font-[var(--font-serif-kr)] text-4xl">
          아마추어 작가를 위한 Artlink
        </h1>
        <p className="mt-6 max-w-2xl text-ink/70">
          미술 비전공자로서 취미로 창작 활동을 이어가는 분들을 위한 서비스입니다. 프로 작가를
          위한 판매·전시 중개 서비스와 달리, 커리큘럼과 코칭을 통해 성장 과정을 함께 만들어가는
          데 집중합니다.
        </p>
      </section>

      <section className="border-y border-ink/10 bg-white/40">
        <div className="mx-auto max-w-4xl px-6 py-20">
          <div className="grid gap-10 sm:grid-cols-2">
            {services.map((service) => (
              <div key={service.title} className="border-l-2 border-terracotta pl-6">
                <h3 className="font-[var(--font-serif-kr)] text-xl">{service.title}</h3>
                <p className="mt-2 text-sm text-ink/70">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-2xl px-6 py-20">
        <p className="mb-8 text-center text-sm text-ink/60">
          코칭 이수 후에는 가입 심사를 거쳐 프로 작가 등급으로 전환을 신청할 수 있습니다.
        </p>
        <ApplicationForm type="AMATEUR" accentClass="bg-terracotta" />
      </section>
    </div>
  );
}
