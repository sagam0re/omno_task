import { FastifyPluginAsync } from "fastify";
import { webhookSchema } from "./schema/webhook.schema";

const webhookRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post(
    "/webhooks/psp",
    { schema: webhookSchema },
    fastify.webhookController.handlePspWebhook,
  );
};

export default webhookRoutes;
