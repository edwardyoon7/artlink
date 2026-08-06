import path from "path";
import ExcelJS from "exceljs";
import PDFDocument from "pdfkit";
import {
  Document,
  Packer,
  Paragraph,
  Table,
  TableRow,
  TableCell,
  TextRun,
  WidthType,
  HeadingLevel,
  TableLayoutType,
  PageOrientation,
  convertInchesToTwip,
} from "docx";
import type { SoldArtworkRow } from "@/lib/artwork-export";
import { formatDateTimeKST } from "@/lib/format-date";

// TTF로 고정 — WOFF2는 압축 해제(brotli) 처리가 서버 환경에 따라 불안정하게 동작해
// 글자가 안 보이는 문제가 있었음. pdfkit이 가장 안정적으로 지원하는 형식은 순수 TTF.
const KOREAN_FONT_PATH = path.join(
  process.cwd(),
  "src/assets/fonts/NotoSansKR-Regular.ttf",
);

// PDF는 A4 가로(landscape) 기준 여백 제외 실사용 폭이 약 780pt라, 구매자 정보를 포함해도
// 넘치지 않도록 폭을 좁게 잡는다. Excel/Word는 이 값을 참고용 비율로만 사용한다.
function columnsFor(includeBuyer: boolean) {
  const base: { label: string; key: keyof SoldArtworkRow; width: number }[] = [
    { label: "판매일시", key: "soldAt", width: 110 },
    { label: "작품명", key: "title", width: 110 },
    { label: "에디션번호", key: "editionNumber", width: 60 },
    { label: "판매금액", key: "price", width: 70 },
    { label: "판매자", key: "seller", width: 90 },
    { label: "작가", key: "artist", width: 60 },
    { label: "작품사진(URL)", key: "imageUrl", width: 100 },
  ];
  if (includeBuyer) {
    base.push({ label: "구매자명", key: "buyerName", width: 60 });
    base.push({ label: "구매자연락처", key: "buyerContact", width: 90 });
  }
  return base;
}

export async function buildExcel(
  rows: SoldArtworkRow[],
  includeBuyer: boolean,
): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("유통내역");
  const columns = columnsFor(includeBuyer);

  sheet.columns = columns.map((c) => ({
    header: c.label,
    key: c.key,
    width: Math.round(c.width / 7),
  }));
  sheet.getRow(1).font = { bold: true };

  for (const row of rows) {
    sheet.addRow(row);
  }

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

export async function buildWord(
  rows: SoldArtworkRow[],
  includeBuyer: boolean,
): Promise<Buffer> {
  const columns = columnsFor(includeBuyer);
  // DXA(twip, 1/20pt) 절대 단위로 지정 — 퍼센트 단위는 이 라이브러리/워드 조합에서
  // 표가 극단적으로 좁게 찌그러지는 문제가 있었음. layout을 FIXED로 강제해
  // 워드가 내용 기준으로 임의로 열 너비를 재계산하지 못하게 함.
  const dxa = (pt: number) => pt * 20;
  const columnWidthsDxa = columns.map((c) => dxa(c.width));
  const tableWidthDxa = columnWidthsDxa.reduce((sum, w) => sum + w, 0);

  const cellMargins = {
    top: 60,
    bottom: 60,
    left: 80,
    right: 80,
  };

  const headerRow = new TableRow({
    children: columns.map(
      (c, i) =>
        new TableCell({
          width: { size: columnWidthsDxa[i], type: WidthType.DXA },
          margins: cellMargins,
          children: [
            new Paragraph({ children: [new TextRun({ text: c.label, bold: true })] }),
          ],
        }),
    ),
  });

  const dataRows = rows.map(
    (row) =>
      new TableRow({
        children: columns.map(
          (c, i) =>
            new TableCell({
              width: { size: columnWidthsDxa[i], type: WidthType.DXA },
              margins: cellMargins,
              children: [new Paragraph(String(row[c.key] ?? ""))],
            }),
        ),
      }),
  );

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            size: {
              orientation: PageOrientation.LANDSCAPE,
            },
            margin: {
              top: convertInchesToTwip(0.5),
              bottom: convertInchesToTwip(0.5),
              left: convertInchesToTwip(0.5),
              right: convertInchesToTwip(0.5),
            },
          },
        },
        children: [
          new Paragraph({
            text: "아트이음 미술품 유통내역",
            heading: HeadingLevel.HEADING_1,
          }),
          new Paragraph({ text: `생성일: ${formatDateTimeKST(new Date())}` }),
          new Paragraph({ text: "" }),
          new Table({
            rows: [headerRow, ...dataRows],
            width: { size: tableWidthDxa, type: WidthType.DXA },
            layout: TableLayoutType.FIXED,
          }),
        ],
      },
    ],
  });

  return await Packer.toBuffer(doc);
}

export async function buildPdf(
  rows: SoldArtworkRow[],
  includeBuyer: boolean,
): Promise<Buffer> {
  const columns = columnsFor(includeBuyer);

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 30, size: "A4", layout: "landscape" });
    const chunks: Buffer[] = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    doc.registerFont("Noto", KOREAN_FONT_PATH);
    doc.font("Noto");

    const marginLeft = doc.page.margins.left;
    const pageBottom = doc.page.height - doc.page.margins.bottom;

    function drawHeaderTitle() {
      doc.fontSize(15).text("아트이음 미술품 유통내역", marginLeft, doc.y);
      doc.fontSize(8).fillColor("#666666");
      doc.text(`생성일: ${formatDateTimeKST(new Date())}`, marginLeft);
      doc.fillColor("#000000");
      doc.moveDown(0.7);
    }

    function drawTableHeader() {
      const y = doc.y;
      let x = marginLeft;
      doc.fontSize(8.5);
      for (const col of columns) {
        doc.text(col.label, x, y, { width: col.width, ellipsis: true });
        x += col.width;
      }
      doc.moveTo(marginLeft, y + 14).lineTo(x, y + 14).strokeColor("#cccccc").stroke();
      doc.y = y + 18;
    }

    drawHeaderTitle();
    drawTableHeader();

    doc.fontSize(8);
    for (const row of rows) {
      if (doc.y > pageBottom - 20) {
        doc.addPage();
        doc.font("Noto");
        drawTableHeader();
        doc.fontSize(8);
      }
      const y = doc.y;
      let x = marginLeft;
      for (const col of columns) {
        const value =
          col.key === "price" ? Number(row.price).toLocaleString() + "원" : String(row[col.key] ?? "");
        doc.text(value, x, y, { width: col.width - 4, ellipsis: true });
        x += col.width;
      }
      doc.y = y + 14;
    }

    if (rows.length === 0) {
      doc.fontSize(10).fillColor("#666666").text("판매 완료된 작품이 없습니다.", marginLeft, doc.y);
    }

    doc.end();
  });
}
