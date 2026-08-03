import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getSoldArtworkRows } from "@/lib/artwork-export";
import { buildExcel, buildPdf, buildWord } from "@/lib/artwork-export-formats";

const CONTENT_TYPES: Record<string, string> = {
  excel: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  word: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  pdf: "application/pdf",
};

const EXTENSIONS: Record<string, string> = {
  excel: "xlsx",
  word: "docx",
  pdf: "pdf",
};

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const format = searchParams.get("format") ?? "excel";
  const includeBuyer = searchParams.get("includeBuyer") === "true";

  if (!CONTENT_TYPES[format]) {
    return NextResponse.json({ error: "지원하지 않는 형식입니다." }, { status: 400 });
  }

  const rows = await getSoldArtworkRows();

  let buffer: Buffer;
  if (format === "excel") {
    buffer = await buildExcel(rows, includeBuyer);
  } else if (format === "word") {
    buffer = await buildWord(rows, includeBuyer);
  } else {
    buffer = await buildPdf(rows, includeBuyer);
  }

  const dateStamp = new Date().toISOString().slice(0, 10);
  const filename = `artieum-유통내역-${dateStamp}.${EXTENSIONS[format]}`;

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": CONTENT_TYPES[format],
      "Content-Disposition": `attachment; filename="${encodeURIComponent(filename)}"`,
    },
  });
}
