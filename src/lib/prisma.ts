import { PrismaClient } from '@prisma/client'
import path from 'path'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

let prisma: PrismaClient

const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1'

if (isProduction) {
  // In production (Vercel), we use PostgreSQL which doesn't need the adapter
  prisma = globalForPrisma.prisma || new PrismaClient()
} else {
  // In development (local), we use SQLite with the adapter
  // Use require to avoid importing better-sqlite3 in production builds
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3')
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const Database = require('better-sqlite3')
  
  const dbPath = path.join(process.cwd(), 'dev.db')
  const database = new Database(dbPath)
  const adapter = new PrismaBetterSqlite3(database)
  
  prisma = globalForPrisma.prisma || new PrismaClient({ adapter })
}

export { prisma }

if (!isProduction) globalForPrisma.prisma = prisma
