import dotenv from "dotenv";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

dotenv.config({
  path: ".env.local",
});

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not defined in .env.local");
}

const sql = neon(process.env.DATABASE_URL);

export const db = drizzle(sql);