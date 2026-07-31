import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "./src/generated/prisma/client";

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL ?? "file:./dev.db" });
const prisma = new PrismaClient({ adapter });

async function main() {
  const users = await prisma.user.findMany({ where: { role: "APPLICANT" } });
  for (const u of users) {
    console.log(`${u.email} | role=${u.role} | artistLevel=${u.artistLevel}`);
  }
  const apps = await prisma.application.findMany();
  for (const a of apps) {
    console.log(`app: ${a.email} | type=${a.type} | status=${a.status}`);
  }
}
main().finally(() => prisma.$disconnect());
