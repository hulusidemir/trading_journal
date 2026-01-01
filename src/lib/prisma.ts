import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import Database from 'better-sqlite3'
import path from 'path'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

let prisma: PrismaClient

if (process.env.NODE_ENV === 'production') {
  // In production (Vercel), we use PostgreSQL which doesn't need the adapter
  // The connection string is handled by prisma.config.ts or environment variables
  prisma = globalForPrisma.prisma || new PrismaClient()
} else {
  // In development (local), we use SQLite with the adapter
  const dbPath = path.join(process.cwd(), 'dev.db')
  const database = new Database(dbPath)
  const adapter = new PrismaBetterSqlite3(database)
  
  prisma = globalForPrisma.prisma || new PrismaClient({ adapter })
}

export { prisma }

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
