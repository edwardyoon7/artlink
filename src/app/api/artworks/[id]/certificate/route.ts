import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getCertificateData } from "@/lib/certificate";
import { buildCertificatePdf } from "@/lib/certificate-pdf";

// 관리자 전용 — 판매완료(SOLD) 작품에 한해 진품보증서 PDF를 즉시 생성해 내려준다.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
  }

  const { id } = await params;
  const data = await getCertificateData(id);
  if (!data) {
    return NextResponse.json(
      { error: "판매완료(SOLD) 상태인 작품만 진품보증서를 발급할 수 있습니다." },
      { status: 404 },
    );
  }

  const buffer = await buildCertificatePdf(data);

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${encodeURIComponent(data.certificateNumber)}.pdf"`,
    },
  });
}
