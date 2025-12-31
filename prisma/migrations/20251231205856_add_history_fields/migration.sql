-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Position" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "symbol" TEXT NOT NULL,
    "side" TEXT NOT NULL,
    "qty" REAL NOT NULL,
    "value" REAL NOT NULL,
    "entryPrice" REAL NOT NULL,
    "markPrice" REAL NOT NULL,
    "liqPrice" REAL,
    "breakEvenPrice" REAL,
    "im" REAL,
    "mm" REAL,
    "unrealizedPnl" REAL NOT NULL,
    "unrealizedRoi" REAL NOT NULL,
    "realizedPnl" REAL NOT NULL,
    "tp" REAL,
    "sl" REAL,
    "leverage" REAL NOT NULL,
    "isCross" BOOLEAN NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "closedAt" DATETIME,
    "exitPrice" REAL,
    "notes" TEXT,
    "closeNotes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Position" ("breakEvenPrice", "createdAt", "entryPrice", "id", "im", "isCross", "leverage", "liqPrice", "markPrice", "mm", "notes", "qty", "realizedPnl", "side", "sl", "symbol", "tp", "unrealizedPnl", "unrealizedRoi", "updatedAt", "value") SELECT "breakEvenPrice", "createdAt", "entryPrice", "id", "im", "isCross", "leverage", "liqPrice", "markPrice", "mm", "notes", "qty", "realizedPnl", "side", "sl", "symbol", "tp", "unrealizedPnl", "unrealizedRoi", "updatedAt", "value" FROM "Position";
DROP TABLE "Position";
ALTER TABLE "new_Position" RENAME TO "Position";
CREATE UNIQUE INDEX "Position_symbol_side_status_key" ON "Position"("symbol", "side", "status");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
