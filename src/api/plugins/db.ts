import { Pool } from "pg";
import { FastifyPluginAsync } from "fastify";

let pool: Pool;

export const dbPlugin: FastifyPluginAsync = async (fastify, options) => {
  pool = new Pool({
    connectionString: fastify.config.DATABASE_URL,
  });

  try {
    await pool.connect();
    fastify.log.info("Database connected successfully");
  } catch (err) {
    fastify.log.error({ err }, "Failed to connect to database");
    process.exit(1);
  }

  fastify.decorate("db", pool);

  fastify.addHook("onClose", async (instance) => {
    await instance.db.end();
  });
};
export { pool };
