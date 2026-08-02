import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL ?? "file:./dev.db" });
const prisma = new PrismaClient({ adapter });

async function main() {
  const artworks = await prisma.artwork.findMany({ where: { imageUrl: { startsWith: "/artworks/" } } });
  for (const artwork of artworks) {
    const newUrl = artwork.imageUrl!.replace("/artworks/", "/artwork-uploads/");
    await prisma.artwork.update({ where: { id: artwork.id }, data: { imageUrl: newUrl } });
    console.log(`artwork ${artwork.id}: ${artwork.imageUrl} -> ${newUrl}`);
  }

  const goodsItems = await prisma.goods.findMany({ where: { imageUrl: { startsWith: "/goods/" } } });
  for (const goods of goodsItems) {
    const newUrl = goods.imageUrl!.replace("/goods/", "/goods-uploads/");
    await prisma.goods.update({ where: { id: goods.id }, data: { imageUrl: newUrl } });
    console.log(`goods ${goods.id}: ${goods.imageUrl} -> ${newUrl}`);
  }

  console.log(`done: ${artworks.length} artworks, ${goodsItems.length} goods updated`);
}

main().finally(() => prisma.$disconnect());
