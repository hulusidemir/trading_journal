import { PrismaClient } from '@prisma/client'
import path from 'path'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

let prisma: PrismaClient

// Force Postgres if DB_ADAPTER env var is set (used in build script)
// Or if we are in Vercel/Production environment
const forcePostgres = process.env.DB_ADAPTER === 'postgres'
const isVercel = process.env.VERCEL === '1'
const isProduction = process.env.NODE_ENV === 'production'
const hasPostgresUrl = (process.env.DATABASE_URL || '').startsWith('postgres')

const shouldUsePostgres = forcePostgres || isVercel || isProduction || hasPostgresUrl

if (shouldUsePostgres) {
  // In production (Vercel) or when using Postgres, we use the standard client
  prisma = globalForPrisma.prisma || new PrismaClient()
} else {
  // In development (local) with SQLite, we use the adapter
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

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
