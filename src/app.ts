import Fastify, { FastifyInstance } from "fastify";
import fastifyCors from "@fastify/cors";
import plugin from "./api/plugins/plugin";
import transactionRoutes from "./api/routes/transaction.route";
import webhookRoutes from "./api/routes/webhook.route";
import pspRoutes from "./api/routes/psp.route";

const buildApp = async (): Promise<FastifyInstance> => {
  const app = Fastify({
    logger: {
      level: "info",
    },
  });

  app.register(plugin);
  app.register(fastifyCors, {
    origin: ["localhost:3000", "localhost:3001"],
  });

  await app.register(transactionRoutes);
  await app.register(webhookRoutes);
  await app.register(pspRoutes);

  return app;
};

export default buildApp;
