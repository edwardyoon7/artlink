import "dotenv/config";
import { unlink } from "fs/promises";
import path from "path";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../src/generated/prisma/client";

// 판매완료 처리까지 테스트해본 "test1", "test2" 작품을 정리하기 위한 일회성 스크립트.
// 제목이 정확히 일치하는 작품만 지운다(실수로 다른 작품이 지워지지 않도록).
const TEST_TITLES = ["test1", "test2"];

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./dev.db",
});
const prisma = new PrismaClient({ adapter });

async function main() {
  const artworks = await prisma.artwork.findMany({
    where: { title: { in: TEST_TITLES } },
    include: { artist: true },
  });

  if (artworks.length === 0) {
    console.log("삭제할 테스트 작품을 찾지 못했습니다.");
    return;
  }

  console.log(`아래 ${artworks.length}건을 삭제합니다:`);
  for (const artwork of artworks) {
    console.log(
      `- [${artwork.id}] "${artwork.title}" (작가: ${artwork.artist.name}, 상태: ${artwork.status}, ` +
        `위탁가: ${artwork.price}원, 최종판매가: ${artwork.finalPrice ?? "-"}원)`,
    );
  }

  for (const artwork of artworks) {
    await prisma.payment.deleteMany({ where: { artworkId: artwork.id } });
  }
  await prisma.artwork.deleteMany({ where: { title: { in: TEST_TITLES } } });

  for (const artwork of artworks) {
    if (artwork.imageUrl) {
      const filePath = path.join(process.cwd(), "public", artwork.imageUrl);
      try {
        await unlink(filePath);
        console.log(`이미지 파일 삭제: ${artwork.imageUrl}`);
      } catch {
        console.log(`이미지 파일을 찾지 못해 건너뜀: ${artwork.imageUrl}`);
      }
    }
  }

  console.log("완료되었습니다.");
}

main().finally(() => prisma.$disconnect());
