-- CreateTable
CREATE TABLE "Goods" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "concept" TEXT NOT NULL,
    "targetAudience" TEXT,
    "stage" TEXT NOT NULL DEFAULT 'REQUESTED',
    "sampleImageUrl" TEXT,
    "price" INTEGER,
    "description" TEXT,
    "imageUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "artistId" TEXT NOT NULL,
    CONSTRAINT "Goods_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Payment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "depositorName" TEXT,
    "status" TEXT NOT NULL DEFAULT 'WAITING',
    "confirmedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "artworkId" TEXT,
    "coachingBookingId" TEXT,
    "goodsId" TEXT,
    CONSTRAINT "Payment_artworkId_fkey" FOREIGN KEY ("artworkId") REFERENCES "Artwork" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Payment_coachingBookingId_fkey" FOREIGN KEY ("coachingBookingId") REFERENCES "CoachingBooking" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Payment_goodsId_fkey" FOREIGN KEY ("goodsId") REFERENCES "Goods" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Payment" ("amount", "artworkId", "coachingBookingId", "confirmedAt", "createdAt", "depositorName", "id", "status", "type") SELECT "amount", "artworkId", "coachingBookingId", "confirmedAt", "createdAt", "depositorName", "id", "status", "type" FROM "Payment";
DROP TABLE "Payment";
ALTER TABLE "new_Payment" RENAME TO "Payment";
CREATE UNIQUE INDEX "Payment_artworkId_key" ON "Payment"("artworkId");
CREATE UNIQUE INDEX "Payment_coachingBookingId_key" ON "Payment"("coachingBookingId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
