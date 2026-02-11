import fp from "fastify-plugin";
import { FastifyPluginAsync } from "fastify";
import dotenv from "dotenv";
import { TransactionController } from "../controllers/transaction.controller";
import { TransactionService } from "../../application/services/transaction/transaction.service";
import { Pool } from "pg";
import { dbPlugin } from "./db";
import serviceRegisterPlugin from "./service-register";
import swaggerPlugin from "./swagger";
import { WebhookController } from "../controllers/webhook.controller";
import { PspController } from "../controllers/psp.controller";
import { PSPService } from "../../application/services/psp/psp.service";

declare module "fastify" {
  interface FastifyInstance {
    db: Pool;
    config: {
      DATABASE_URL: string;
      PORT: number;
    };
    transactionController: TransactionController;
    transactionService: TransactionService;
    webhookController: WebhookController;
    pspController: PspController;
    pspService: PSPService;
  }
}

const plugin: FastifyPluginAsync = async (fastify, options) => {
  dotenv.config();
  const config = {
    DATABASE_URL: process.env.DATABASE_URL || "",
    PORT: parseInt(process.env.PORT || "3001", 10),
  };
  fastify.decorate("config", config);

  // Database connection
  await dbPlugin(fastify, options);
  await swaggerPlugin(fastify, options);
  await serviceRegisterPlugin(fastify, options);
};

export default fp(plugin);
