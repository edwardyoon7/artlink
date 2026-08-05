import path from "path";
import { readFile } from "fs/promises";
import sharp from "sharp";
import PDFDocument from "pdfkit";
import {
  CERTIFICATE_COMPANY_ADDRESS,
  CERTIFICATE_COMPANY_CONTACT,
  CERTIFICATE_REPRESENTATIVE_NAME,
  CERTIFICATE_REPRESENTATIVE_TITLE,
  type CertificateData,
} from "@/lib/certificate";

// artwork-export-formats.ts와 동일한 이유로 TTF 고정 (WOFF2는 서버 환경에서 압축 해제가
// 불안정했음). 영문 전용 텍스트(헤드라인·라벨)는 pdfkit 내장 Times 계열을 써서 별도 폰트
// 파일 추가 없이도 국문(고딕)·영문(세리프) 페어링이라는 디자인 원칙을 최대한 지킨다.
const KOREAN_FONT_PATH = path.join(process.cwd(), "src/assets/fonts/NotoSansKR-Regular.ttf");

const TERRACOTTA = "#c1602e";
const INK = "#1f2937";
const INK_MUTED = "#6b7280";

function formatDate(d: Date | null) {
  if (!d) return "-";
  return new Date(d).toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" });
}

function formatSize(widthCm: number | null, heightCm: number | null) {
  if (widthCm == null || heightCm == null) return "-";
  return `${widthCm} × ${heightCm} cm`;
}

// 원본 업로드 이미지는 최대 50MB까지 허용되는데(작품 등록 시 원본 화질 보존 목적), pdfkit은
// PNG를 재압축 없이 원본 픽셀 그대로 임베드해 증서 PDF 용량이 수십MB로 부풀려짐. 실제로 화면에
// 보여줄 크기(170pt 정사각형 박스)에 맞춰 sharp로 축소 + JPEG 재인코딩한 뒤 넘겨서, pdfkit이
// JPEG의 자체 압축 스트림을 그대로 재사용하도록 한다(재인코딩 없이 삽입되어 훨씬 효율적).
async function loadCertificateImage(imageUrl: string): Promise<Buffer | null> {
  try {
    const imagePath = path.join(process.cwd(), "public", imageUrl);
    const original = await readFile(imagePath);
    return await sharp(original).resize(360, 360, { fit: "inside", withoutEnlargement: true }).jpeg({ quality: 82 }).toBuffer();
  } catch {
    return null; // 이미지 파일을 못 읽어도 보증서 자체는 계속 생성 (필수 요소 아님)
  }
}

export async function buildCertificatePdf(data: CertificateData): Promise<Buffer> {
  const imageBuffer = data.imageUrl ? await loadCertificateImage(data.imageUrl) : null;

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 56, size: "A4" }); // A4 세로(portrait)
    const chunks: Buffer[] = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    doc.registerFont("Noto", KOREAN_FONT_PATH);

    const left = doc.page.margins.left;
    const right = doc.page.width - doc.page.margins.right;
    const contentWidth = right - left;

    // 상단 워드마크
    doc.font("Times-Bold").fontSize(20).fillColor(INK);
    doc.text("A R T I E U M", left, doc.y, { width: contentWidth, align: "center", characterSpacing: 2 });
    doc.font("Noto").fontSize(9).fillColor(INK_MUTED);
    doc.text("아트이음", left, doc.y + 2, { width: contentWidth, align: "center" });

    doc.moveDown(1.2);
    doc.moveTo(left, doc.y).lineTo(right, doc.y).strokeColor(TERRACOTTA).lineWidth(1.2).stroke();
    doc.moveDown(1.4);

    // 제목
    doc.font("Noto").fontSize(24).fillColor(INK);
    doc.text("진품보증서", left, doc.y, { width: contentWidth, align: "center" });
    doc.moveDown(0.3);
    doc.font("Times-Roman").fontSize(11).fillColor(TERRACOTTA);
    doc.text("C E R T I F I C A T E   O F   A U T H E N T I C I T Y", left, doc.y, {
      width: contentWidth,
      align: "center",
    });

    doc.moveDown(0.8);
    doc.font("Noto").fontSize(8).fillColor(INK_MUTED);
    doc.text(`발급번호 ${data.certificateNumber}     발급일 ${formatDate(data.issuedAt)}`, left, doc.y, {
      width: contentWidth,
      align: "center",
    });

    doc.moveDown(1.4);

    // 작품 사진 (있는 경우)
    if (imageBuffer) {
      const boxSize = 170;
      const boxX = left + (contentWidth - boxSize) / 2;
      const boxY = doc.y;
      doc.image(imageBuffer, boxX, boxY, { fit: [boxSize, boxSize], align: "center", valign: "center" });
      doc.rect(boxX, boxY, boxSize, boxSize).strokeColor("#d9d3c7").lineWidth(1).stroke();
      doc.y = boxY + boxSize;
      doc.moveDown(1.2);
    }

    // 작품 정보
    const infoRows: [string, string][] = [
      ["작가 Artist", data.artistName],
      ["작품명 Title", data.title],
      ["재료 Medium", data.medium ?? "-"],
      ["크기 Size", formatSize(data.widthCm, data.heightCm)],
    ];
    if (data.editionNumber) infoRows.push(["에디션 Edition", data.editionNumber]);
    infoRows.push(["판매일 Date of Sale", formatDate(data.soldAt)]);

    const labelWidth = 150;
    const infoBlockX = left + (contentWidth - 420) / 2; // 폭 420pt로 가운데 정렬된 정보 블록
    let rowY = doc.y;
    for (const [label, value] of infoRows) {
      doc.font("Noto").fontSize(9.5).fillColor(INK_MUTED);
      doc.text(label, infoBlockX, rowY, { width: labelWidth });
      doc.font("Noto").fontSize(11).fillColor(INK);
      doc.text(value, infoBlockX + labelWidth, rowY, { width: 420 - labelWidth });
      rowY = Math.max(doc.y, rowY + 18);
    }
    doc.y = rowY;

    doc.moveDown(1.6);

    // 보증 문구
    doc.font("Noto").fontSize(11).fillColor(INK);
    doc.text(
      `본 증서는 위 작품이 작가 ${data.artistName}가 직접 제작한 원본(진품)임을 증명하며, ` +
        `아트이음(Artieum)이 작가와 컬렉터 사이의 거래를 중개하며 이를 보증합니다.`,
      left + 30,
      doc.y,
      { width: contentWidth - 60, align: "center", lineGap: 4 },
    );
    doc.moveDown(0.6);
    doc.font("Times-Italic").fontSize(9).fillColor(INK_MUTED);
    doc.text(
      "This is to certify that the artwork described above is an authentic original work created by the " +
        "named artist, and that Artieum guarantees this transaction as intermediary between the artist and the collector.",
      left + 30,
      doc.y,
      { width: contentWidth - 60, align: "center", lineGap: 3 },
    );

    // 서명란: 페이지 하단에 고정 배치
    const signatureY = doc.page.height - doc.page.margins.bottom - 90;
    const colWidth = contentWidth / 2 - 20;
    const leftColX = left;
    const rightColX = left + contentWidth / 2 + 20;

    doc.moveTo(leftColX, signatureY).lineTo(leftColX + colWidth, signatureY).strokeColor("#c9c2b3").lineWidth(0.8).stroke();
    doc.moveTo(rightColX, signatureY).lineTo(rightColX + colWidth, signatureY).strokeColor("#c9c2b3").lineWidth(0.8).stroke();

    doc.font("Noto").fontSize(11).fillColor(INK);
    doc.text(`작가  ${data.artistName}  (인)`, leftColX, signatureY + 8, { width: colWidth, align: "center" });
    doc.text(`${CERTIFICATE_REPRESENTATIVE_TITLE}  ${CERTIFICATE_REPRESENTATIVE_NAME}  (인)`, rightColX, signatureY + 8, {
      width: colWidth,
      align: "center",
    });

    // 하단 회사 정보
    const footerY = doc.page.height - doc.page.margins.bottom - 20;
    doc.font("Noto").fontSize(8).fillColor(INK_MUTED);
    doc.text(`${CERTIFICATE_COMPANY_ADDRESS}  ·  ${CERTIFICATE_COMPANY_CONTACT}`, left, footerY, {
      width: contentWidth,
      align: "center",
    });

    doc.end();
  });
}
