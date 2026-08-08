import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../src/generated/prisma/client";

// 테스트 데이터의 오기입 가격 등을 관리자가 직접 바로잡기 위한 일회성 스크립트.
// 작가는 등록 후 가격을 스스로 수정할 수 없는 구조라(자주 바뀌면 신뢰도가 흔들린다는
// 판단), 이런 정정은 운영자가 DB를 직접 고치는 방식으로 처리한다.
const [title, artistName, newPriceStr] = process.argv.slice(2);

if (!title || !artistName || !newPriceStr) {
  console.error("사용법: npx tsx scripts/fix-artwork-price.ts <작품제목> <작가성함> <새가격>");
  process.exit(1);
}
const newPrice = Number(newPriceStr);
if (!Number.isFinite(newPrice) || newPrice <= 0) {
  console.error("가격은 0보다 큰 숫자여야 합니다.");
  process.exit(1);
}

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./dev.db",
});
const prisma = new PrismaClient({ adapter });

async function main() {
  const matches = await prisma.artwork.findMany({
    where: { title, artist: { name: artistName } },
    include: { artist: true },
  });

  if (matches.length === 0) {
    console.error(`해당 작품을 찾을 수 없습니다: 제목="${title}", 작가="${artistName}"`);
    process.exitCode = 1;
    return;
  }
  if (matches.length > 1) {
    console.error(`동일 조건의 작품이 ${matches.length}건 있어 특정할 수 없습니다 — 직접 확인 필요:`);
    for (const m of matches) {
      console.error(`  id=${m.id} price=${m.price} status=${m.status}`);
    }
    process.exitCode = 1;
    return;
  }

  const artwork = matches[0];
  console.log(`대상 확인: "${artwork.title}"(작가: ${artwork.artist.name}) 현재 가격 ${artwork.price.toLocaleString()}원 → ${newPrice.toLocaleString()}원으로 변경`);

  await prisma.artwork.update({ where: { id: artwork.id }, data: { price: newPrice } });
  console.log("변경 완료.");
}

main().finally(() => prisma.$disconnect());
