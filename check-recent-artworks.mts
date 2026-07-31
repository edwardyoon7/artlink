import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "./src/generated/prisma/client";

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL ?? "file:./dev.db" });
const prisma = new PrismaClient({ adapter });

async function main() {
  const artworks = await prisma.artwork.findMany({
    orderBy: { createdAt: "desc" },
    include: { payment: true, artist: true },
  });
  for (const a of artworks) {
    console.log(JSON.stringify({
      title: a.title,
      artist: a.artist.name,
      status: a.status,
      imageUrl: a.imageUrl,
      paymentStatus: a.payment?.status,
      depositorName: a.payment?.depositorName,
      createdAt: a.createdAt,
    }));
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
