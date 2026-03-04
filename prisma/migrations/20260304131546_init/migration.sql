-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "hubspotId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Equipment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "hubspotId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'available',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Reservation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "equipmentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "contactName" TEXT NOT NULL,
    "contactEmail" TEXT,
    "contactPhone" TEXT,
    "checkInTime" DATETIME NOT NULL,
    "checkOutTime" DATETIME NOT NULL,
    "notes" TEXT,
    "hubspotDealId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Reservation_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Reservation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Equipment_hubspotId_key" ON "Equipment"("hubspotId");

-- CreateIndex
CREATE INDEX "Reservation_equipmentId_idx" ON "Reservation"("equipmentId");

-- CreateIndex
CREATE INDEX "Reservation_userId_idx" ON "Reservation"("userId");

-- CreateIndex
CREATE INDEX "Reservation_checkInTime_idx" ON "Reservation"("checkInTime");

-- CreateIndex
CREATE INDEX "Reservation_checkOutTime_idx" ON "Reservation"("checkOutTime");
