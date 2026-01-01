const fs = require('fs');
console.log('Running switch-db.js script...');
const path = require('path');

const schemaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma');
const type = process.argv[2];

if (!fs.existsSync(schemaPath)) {
  console.error('Schema file not found at:', schemaPath);
  process.exit(1);
}

let schema = fs.readFileSync(schemaPath, 'utf8');

if (type === 'postgres') {
  // Replace the datasource block with PostgreSQL configuration
  schema = schema.replace(
    /datasource db \{[\s\S]*?\}/,
    `datasource db {
  provider = "postgresql"
}`
  );
  console.log('✔ Switched Prisma schema to PostgreSQL');
} else if (type === 'sqlite') {
  // Replace the datasource block with SQLite configuration
  schema = schema.replace(
    /datasource db \{[\s\S]*?\}/,
    `datasource db {
  provider = "sqlite"
}`
  );
  console.log('✔ Switched Prisma schema to SQLite');
} else {
  console.error('Usage: node scripts/switch-db.js [postgres|sqlite]');
  process.exit(1);
}

fs.writeFileSync(schemaPath, schema);
