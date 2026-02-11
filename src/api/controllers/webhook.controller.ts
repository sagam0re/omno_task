import { FastifyReply, FastifyRequest } from "fastify";
import { ITransactionService } from "../../application/services/transaction/transaction.interface";
import { WebhookDto } from "../../application/services/dto/webhook.dto";

export class WebhookController {
  constructor(private service: ITransactionService) {}

  handlePspWebhook = async (
    request: FastifyRequest<{ Body: WebhookDto }>,
    reply: FastifyReply,
  ) => {
    const payload = request.body;
    try {
      await this.service.handleWebhook(payload);
      return reply.code(200).send({ received: true });
    } catch (err) {
      request.log.error(err);
      return reply.code(200).send({ error: "Processed with errors" });
    }
  };
}
