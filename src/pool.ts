import { Pool } from "pg";

const pool = new Pool({
  user: process.env.DATABASE_USER,
  host: process.env.DATABASE_HOST,
  database: process.env.DATABASE_NAME,
  password: process.env.DATABASE_PASSWORD,
  port: Number.parseInt(process.env.DATABASE_PORT ?? "0"),
});

export default pool;
