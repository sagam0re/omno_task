import { FastifyPluginAsync } from "fastify";
import { TransactionController } from "../controllers/transaction.controller";
import { TransactionService } from "../../application/services/transaction/transaction.service";
import { TransactionRepo } from "../../infrastructure/repositories/transaction.repo";
import { WebhookController } from "../controllers/webhook.controller";
import { PspController } from "../controllers/psp.controller";
import { PSPService } from "../../application/services/psp/psp.service";

const serviceRegisterPlugin: FastifyPluginAsync = async (fastify, options) => {
  const transactionRepo = new TransactionRepo(fastify.db);
  const transactionService = new TransactionService(transactionRepo);
  const transactionController = new TransactionController(transactionService);
  const webhookController = new WebhookController(transactionService);

  const pspService = new PSPService();
  const pspController = new PspController(pspService);

  fastify.decorate("transactionService", transactionService);
  fastify.decorate("transactionController", transactionController);
  fastify.decorate("webhookController", webhookController);
  fastify.decorate("pspController", pspController);
  fastify.decorate("pspService", pspService);

  fastify.log.info(
    "Dependency Injection complete: Services & Controllers wired.",
  );
};

export default serviceRegisterPlugin;
