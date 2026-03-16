import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "./schema";

const sqlite = new Database("./sqlite.db"); // same path as in drizzle.config.ts

export const db = drizzle(sqlite, { schema });