import { FastifyPluginAsync } from "fastify";
import { createTransactionSchema } from "./schema/transaction.schema";

const transactionRoutes: FastifyPluginAsync = async (fastify) => {
  const controller = fastify.transactionController;

  fastify.post(
    "/transactions",
    { schema: createTransactionSchema },
    controller.create,
  );

  fastify.get("/transactions/failure", controller.handleFailure);
};

export default transactionRoutes;
