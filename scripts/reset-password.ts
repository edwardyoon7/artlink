import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../src/generated/prisma/client";

const [email, newPassword] = process.argv.slice(2);

if (!email || !newPassword) {
  console.error("사용법: npm run reset-password -- <이메일> <새비밀번호>");
  process.exit(1);
}
if (newPassword.length < 8) {
  console.error("비밀번호는 8자 이상이어야 합니다.");
  process.exit(1);
}

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./dev.db",
});
const prisma = new PrismaClient({ adapter });

async function main() {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    console.error(`해당 이메일의 계정을 찾을 수 없습니다: ${email}`);
    process.exitCode = 1;
    return;
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({ where: { email }, data: { passwordHash } });
  console.log(`비밀번호가 변경되었습니다: ${email}`);
}

main().finally(() => prisma.$disconnect());
