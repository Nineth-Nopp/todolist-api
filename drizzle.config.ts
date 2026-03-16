import { defineConfig } from "drizzle-kit";

export default defineConfig({
    dialect: "sqlite",
    schema: "./db/schema.ts",
    out: "./db/migrations",
    dbCredentials: {
        url: "./sqlite.db",           // file will be created in project root
    },
    verbose: true,
    strict: true,
});