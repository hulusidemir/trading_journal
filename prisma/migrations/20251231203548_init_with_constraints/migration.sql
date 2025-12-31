/*
  Warnings:

  - A unique constraint covering the columns `[symbol,side]` on the table `Position` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `orderId` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Order" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "orderId" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "side" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "qty" REAL NOT NULL,
    "filledQty" REAL NOT NULL DEFAULT 0,
    "triggerPrice" REAL,
    "isReduceOnly" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Order" ("createdAt", "filledQty", "id", "isReduceOnly", "notes", "price", "qty", "side", "status", "symbol", "triggerPrice", "type", "updatedAt") SELECT "createdAt", "filledQty", "id", "isReduceOnly", "notes", "price", "qty", "side", "status", "symbol", "triggerPrice", "type", "updatedAt" FROM "Order";
DROP TABLE "Order";
ALTER TABLE "new_Order" RENAME TO "Order";
CREATE UNIQUE INDEX "Order_orderId_key" ON "Order"("orderId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Position_symbol_side_key" ON "Position"("symbol", "side");
