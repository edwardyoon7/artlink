-- CreateTable
CREATE TABLE "Instructor" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "education" TEXT,
    "exhibitions" TEXT,
    "awards" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "InstructorRegion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "region" TEXT NOT NULL,
    "instructorId" TEXT NOT NULL,
    CONSTRAINT "InstructorRegion_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES "Instructor" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "InstructorAvailability" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "weekday" TEXT NOT NULL,
    "instructorId" TEXT NOT NULL,
    CONSTRAINT "InstructorAvailability_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES "Instructor" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_CoachingBooking" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "curriculum" TEXT NOT NULL,
    "region" TEXT,
    "preferredDate" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "artistId" TEXT NOT NULL,
    "instructorId" TEXT,
    CONSTRAINT "CoachingBooking_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "CoachingBooking_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES "Instructor" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_CoachingBooking" ("artistId", "createdAt", "curriculum", "id", "preferredDate", "status") SELECT "artistId", "createdAt", "curriculum", "id", "preferredDate", "status" FROM "CoachingBooking";
DROP TABLE "CoachingBooking";
ALTER TABLE "new_CoachingBooking" RENAME TO "CoachingBooking";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "InstructorRegion_instructorId_region_key" ON "InstructorRegion"("instructorId", "region");

-- CreateIndex
CREATE UNIQUE INDEX "InstructorAvailability_instructorId_weekday_key" ON "InstructorAvailability"("instructorId", "weekday");
