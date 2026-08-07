-- AlterTable
ALTER TABLE "Instructor" ADD COLUMN "email" TEXT;

-- AlterTable
ALTER TABLE "InstructorAvailability" ADD COLUMN "endMinute" INTEGER;
ALTER TABLE "InstructorAvailability" ADD COLUMN "startMinute" INTEGER;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_CoachingBooking" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "curriculum" TEXT NOT NULL,
    "region" TEXT,
    "preferredDate" DATETIME NOT NULL,
    "durationHours" INTEGER NOT NULL DEFAULT 4,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "artistId" TEXT NOT NULL,
    "instructorId" TEXT,
    CONSTRAINT "CoachingBooking_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "CoachingBooking_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES "Instructor" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_CoachingBooking" ("artistId", "createdAt", "curriculum", "id", "instructorId", "preferredDate", "region", "status") SELECT "artistId", "createdAt", "curriculum", "id", "instructorId", "preferredDate", "region", "status" FROM "CoachingBooking";
DROP TABLE "CoachingBooking";
ALTER TABLE "new_CoachingBooking" RENAME TO "CoachingBooking";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
