import Image from "next/image";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { ApplicationForm } from "@/components/application-form";

const services = [
  {
    title: "작품 위탁 판매 및 가격 컨설팅",
    description:
      "작품 사진 촬영·소개 문구 작성부터 시장 데이터 기반 가격 책정까지, 판매 전 과정을 함께 진행합니다.",
  },
  {
    title: "전시·협회 연계 우선 홍보",
    description:
      "향후 개설될 협회의 판매 목적 전시회에 우선 참여 기회를 안내하고, 전시 홍보 콘텐츠에 작가를 소개합니다.",
  },
  {
    title: "작가 프로필·이력 큐레이션",
    description:
      "학력·전시 경력·수상 이력 등 신뢰도를 뒷받침하는 정보를 큐레이션하여 컬렉터에게 노출합니다.",
  },
  {
    title: "컬렉터 매칭 및 딜 중개",
    description:
      "작품에 관심을 보인 컬렉터와의 커뮤니케이션·계약·배송까지 Artieum가 중간에서 조율합니다.",
  },
];

export default function ProArtistPage() {
  return (
    <div className="min-h-screen bg-base text-ink">
      <SiteHeader />

      <section className="mx-auto max-w-6xl px-6 pt-40 pb-20">
        <Link href="/#artists" className="text-sm text-ink/50 hover:text-ink">
          ← 작가 소개로 돌아가기
        </Link>
        <div className="mt-8 grid items-center gap-12 md:grid-cols-2">
          <div>
            <p className="font-[var(--font-serif-en)] text-xs tracking-[0.35em] text-ink">
              PRO ARTIST
            </p>
            <h1 className="mt-3 font-[var(--font-serif-kr)] text-4xl">
              프로 작가를 위한 Artieum
            </h1>
            <p className="mt-6 max-w-2xl text-ink/70">
              미술을 전공하고 전업으로 활동 중인 작가를 위한 서비스입니다. 아마추어 작가를 위한
              커리큘럼·코칭 중심 서비스와 달리, 프로 작가에게는 이력 기반 신뢰도 노출과
              판매·전시 중개에 집중된 서비스를 제공합니다.
            </p>
          </div>
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-sm border border-ink/20">
            <Image
              src="/home-images/pro-artist-2.png"
              alt="프로 작가"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
              priority
            />
          </div>
        </div>
      </section>

      <section className="border-y border-ink/10 bg-white/40">
        <div className="mx-auto max-w-4xl px-6 py-20">
          <div className="grid gap-10 sm:grid-cols-2">
            {services.map((service) => (
              <div key={service.title} className="border-l-2 border-ink pl-6">
                <h3 className="font-[var(--font-serif-kr)] text-xl">{service.title}</h3>
                <p className="mt-2 text-sm text-ink/70">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-2xl px-6 py-20">
        <p className="mb-8 text-center text-sm text-ink/60">
          프로 작가 등급은 가입 심사를 통해 운영자가 확인 후 부여합니다.
        </p>
        <ApplicationForm type="PRO" accentClass="bg-ink" />
      </section>
    </div>
  );
}
