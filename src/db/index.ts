// import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema"
import pg from "pg"
const { Pool } = pg;


const pool = new Pool({
    host: process.env.DATABASE_URL!,
    port: 5432,
    user: process.env.DATABASE_USER!,
    password: process.env.DATABASE_PASSWORD!,
    database: process.env.DATABASE_NAME!,
})

export const db = drizzle(pool,{schema});