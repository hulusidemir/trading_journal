-- CreateTable
CREATE TABLE "Position" (
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
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Order" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
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

-- CreateTable
CREATE TABLE "JournalEntry" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT,
    "content" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
