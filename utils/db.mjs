// Create PostgreSQL Connection Pool here !
import "dotenv/config";
import * as pg from "pg";

const { Pool } = pg.default;

const connectionPool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

export default connectionPool;
