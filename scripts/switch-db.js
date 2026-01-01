const fs = require('fs');
console.log('Running switch-db.js script...');
const path = require('path');

const schemaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma');
const prismaLibPath = path.join(__dirname, '..', 'src', 'lib', 'db.ts');
const type = process.argv[2];

if (!fs.existsSync(schemaPath)) {
  console.error('Schema file not found at:', schemaPath);
  process.exit(1);
}

let schema = fs.readFileSync(schemaPath, 'utf8');
const datasourceRegex = /datasource db \{[\s\S]*?\}/;

// Templates for prisma.ts
const postgresPrismaTs = `import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
`;

const sqlitePrismaTs = `import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import Database from 'better-sqlite3'
import path from 'path'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

const dbPath = path.join(process.cwd(), 'dev.db')
const database = new Database(dbPath)
const adapter = new PrismaBetterSqlite3(database)

export const prisma = globalForPrisma.prisma || new PrismaClient({ adapter })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
`;

if (type === 'postgres') {
  // 1. Update Schema
  schema = schema.replace(
    datasourceRegex,
    `datasource db {
  provider = "postgresql"
}`
  );
  
  // 2. Rewrite prisma.ts for Postgres ONLY
  fs.writeFileSync(prismaLibPath, postgresPrismaTs);
  
  console.log('✔ Switched Prisma schema to PostgreSQL');
  console.log('✔ Rewrote src/lib/db.ts for PostgreSQL');
  
} else if (type === 'sqlite') {
  // 1. Update Schema
  schema = schema.replace(
    datasourceRegex,
    `datasource db {
  provider = "sqlite"
}`
  );
  
  // 2. Rewrite prisma.ts for SQLite ONLY
  fs.writeFileSync(prismaLibPath, sqlitePrismaTs);

  console.log('✔ Switched Prisma schema to SQLite');
  console.log('✔ Rewrote src/lib/db.ts for SQLite');
  
} else {
  console.error('Usage: node scripts/switch-db.js [postgres|sqlite]');
  process.exit(1);
}

fs.writeFileSync(schemaPath, schema);
