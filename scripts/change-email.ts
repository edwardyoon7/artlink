import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../src/generated/prisma/client";

const [currentEmail, newEmail] = process.argv.slice(2);

if (!currentEmail || !newEmail) {
  console.error("사용법: npm run change-email -- <기존이메일> <새이메일>");
  process.exit(1);
}

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./dev.db",
});
const prisma = new PrismaClient({ adapter });

async function main() {
  const user = await prisma.user.findUnique({ where: { email: currentEmail } });
  if (!user) {
    console.error(`해당 이메일의 계정을 찾을 수 없습니다: ${currentEmail}`);
    process.exitCode = 1;
    return;
  }

  const conflict = await prisma.user.findUnique({ where: { email: newEmail } });
  if (conflict) {
    console.error(`이미 사용 중인 이메일입니다: ${newEmail}`);
    process.exitCode = 1;
    return;
  }

  await prisma.user.update({ where: { email: currentEmail }, data: { email: newEmail } });
  console.log(`이메일이 변경되었습니다: ${currentEmail} → ${newEmail}`);
  console.log("비밀번호는 그대로 유지됩니다.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
