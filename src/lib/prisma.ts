import { PrismaClient } from '@prisma/client'
import path from 'path'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

let prisma: PrismaClient

// Determine if we should use PostgreSQL or SQLite based on the DATABASE_URL
// On Vercel, DATABASE_URL will be a postgres connection string
// Locally, it might be a file path (sqlite)
const dbUrl = process.env.DATABASE_URL || ''
const isPostgres = dbUrl.startsWith('postgres') || dbUrl.startsWith('postgresql') || process.env.VERCEL === '1'

if (isPostgres) {
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
