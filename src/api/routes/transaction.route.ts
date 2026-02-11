import { FastifyPluginAsync } from "fastify";
import { createTransactionSchema } from "./schema/transaction.schema";
import { validateTransactionRequest } from "../middleware/validation.middleware";

const transactionRoutes: FastifyPluginAsync = async (fastify) => {
  const controller = fastify.transactionController;

  fastify.post(
    "/transactions",
    {
      schema: createTransactionSchema,
      preHandler: validateTransactionRequest as any,
    },
    controller.create,
  );

  fastify.get("/transactions/failure", controller.handleFailure);
};

export default transactionRoutes;
