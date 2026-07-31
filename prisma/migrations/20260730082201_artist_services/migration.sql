-- AlterTable
ALTER TABLE "User" ADD COLUMN "artistLevel" TEXT;

-- CreateTable
CREATE TABLE "Artwork" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "price" INTEGER NOT NULL,
    "imageUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "artistId" TEXT NOT NULL,
    CONSTRAINT "Artwork_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CoachingBooking" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "curriculum" TEXT NOT NULL,
    "preferredDate" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "artistId" TEXT NOT NULL,
    CONSTRAINT "CoachingBooking_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "depositorName" TEXT,
    "status" TEXT NOT NULL DEFAULT 'WAITING',
    "confirmedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "artworkId" TEXT,
    "coachingBookingId" TEXT,
    CONSTRAINT "Payment_artworkId_fkey" FOREIGN KEY ("artworkId") REFERENCES "Artwork" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Payment_coachingBookingId_fkey" FOREIGN KEY ("coachingBookingId") REFERENCES "CoachingBooking" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Payment_artworkId_key" ON "Payment"("artworkId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_coachingBookingId_key" ON "Payment"("coachingBookingId");
