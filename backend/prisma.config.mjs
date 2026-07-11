import 'dotenv/config';
import { defineConfig } from 'prisma/config';
import { PrismaBetterSQLite3 } from '@prisma/adapter-better-sqlite3';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const dbUrl = process.env.DATABASE_URL || 'file:./dev.db';
// Strip the "file:" prefix to get a raw filesystem path
const dbPath = dbUrl.startsWith('file:')
  ? path.resolve(__dirname, dbUrl.slice(5))
  : dbUrl;

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: dbUrl,
  },
  migrate: {
    adapter: () => new PrismaBetterSQLite3({ url: dbPath }),
  },
  client: {
    adapter: () => new PrismaBetterSQLite3({ url: dbPath }),
  },
});

