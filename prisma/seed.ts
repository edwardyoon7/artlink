import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./dev.db",
});
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = process.env.ADMIN_EMAIL ?? "admin@artlink.local";
  const password = process.env.ADMIN_PASSWORD ?? "artlink-admin-2026!";

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`이미 존재하는 관리자 계정입니다: ${email}`);
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.create({
    data: {
      name: "운영자",
      email,
      phone: "000-0000-0000",
      passwordHash,
      role: "ADMIN",
    },
  });

  console.log(`관리자 계정 생성 완료: ${email} / ${password}`);
  console.log("로그인 후 비밀번호를 변경하는 것을 권장합니다.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
