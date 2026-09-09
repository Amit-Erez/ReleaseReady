import { Pool, types } from "pg";
import { config } from "./config.js";
types.setTypeParser(1700, (value) => parseFloat(value));

export const pool = new Pool({ 
    connectionString: config.DATABASE_URL,
    ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : undefined,
 });