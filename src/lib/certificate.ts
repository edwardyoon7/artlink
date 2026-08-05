import { prisma } from "@/lib/prisma";

// 진품보증서 서명란에 들어가는 회사 대표 정보 — 사이트 푸터(src/components/site-footer.tsx)와
// 동일한 표기를 사용한다. 방문객 화면 문구는 브랜드명 "Artieum(아트이음)"으로 리브랜딩됐지만,
// 대표자명 자체는 리브랜딩과 무관한 사실이라 그대로 재사용.
export const CERTIFICATE_REPRESENTATIVE_TITLE = "아트이음 대표";
export const CERTIFICATE_REPRESENTATIVE_NAME = "윤진수";
export const CERTIFICATE_COMPANY_ADDRESS = "경기도 김포시 사우동 923 보보스프라자 3층";
export const CERTIFICATE_COMPANY_CONTACT = "010-7406-6537 · edwardyoon7@gmail.com";

export type CertificateData = {
  certificateNumber: string;
  issuedAt: Date;
  artistName: string;
  title: string;
  medium: string | null;
  widthCm: number | null;
  heightCm: number | null;
  editionNumber: string | null;
  soldAt: Date | null;
  imageUrl: string | null;
};

function buildCertificateNumber(artworkId: string, soldAt: Date | null) {
  const datePart = (soldAt ?? new Date()).toISOString().slice(0, 10).replace(/-/g, "");
  const suffix = artworkId.slice(-6).toUpperCase();
  return `ARTIEUM-${datePart}-${suffix}`;
}

// 관리자 전용 — 판매완료(SOLD) 작품만 진품보증서 발급 대상.
export async function getCertificateData(artworkId: string): Promise<CertificateData | null> {
  const artwork = await prisma.artwork.findUnique({
    where: { id: artworkId },
    include: { artist: true },
  });

  if (!artwork || artwork.status !== "SOLD") {
    return null;
  }

  return {
    certificateNumber: buildCertificateNumber(artwork.id, artwork.soldAt),
    issuedAt: new Date(),
    artistName: artwork.artist.name,
    title: artwork.title,
    medium: artwork.caption,
    widthCm: artwork.widthCm,
    heightCm: artwork.heightCm,
    editionNumber: artwork.editionNumber,
    soldAt: artwork.soldAt,
    imageUrl: artwork.imageUrl,
  };
}
