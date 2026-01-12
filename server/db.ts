import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";

let pool: Pool | null = null;
let dbInstance: ReturnType<typeof drizzle> | null = null;

export const getDb = () => {
  if (dbInstance) return dbInstance;
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is required for database access.");
  }
  pool = new Pool({ connectionString });
  dbInstance = drizzle(pool);
  return dbInstance;
};
