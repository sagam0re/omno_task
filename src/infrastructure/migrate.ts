import dotenv from "dotenv";
import { Client } from "pg";
import fs from "fs";
import path from "path";

dotenv.config();

const dbConfig = {
  connectionString: process.env.DATABASE_URL,
};

const MAX_RETRIES = 10;
const RETRY_DELAY = 5000;

async function migrate() {
  const client = new Client(dbConfig);

  let attempts = 0;

  while (attempts < MAX_RETRIES) {
    try {
      console.log(`Attempting connection... (${attempts + 1}/${MAX_RETRIES})`);
      await client.connect();
      console.log("Connected to Database!");
      break;
    } catch (err: any) {
      attempts++;
      console.log(
        `Database not ready yet. Retrying in ${RETRY_DELAY / 1000}s...`,
      );
      if (attempts >= MAX_RETRIES) {
        console.error("Could not connect to database after multiple attempts.");
        process.exit(1);
      }
      await new Promise((res) => setTimeout(res, RETRY_DELAY));
    }
  }

  try {
    const sqlPath = path.join(__dirname, "./migrations/init.sql");
    const sql = fs.readFileSync(sqlPath, "utf8");
    console.log("Running init.sql...");
    await client.query(sql);
    console.log("Migration complete! Database is ready.");
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

migrate();
