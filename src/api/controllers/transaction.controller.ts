import { FastifyReply, FastifyRequest } from "fastify";
import { ITransactionService } from "../../application/services/transaction/transaction.interface";
import { CreateTransactionDto } from "../../application/services/dto/transaction.dto";

export class TransactionController {
  constructor(private service: ITransactionService) {}

  create = async (
    request: FastifyRequest<{ Body: CreateTransactionDto }>,
    reply: FastifyReply,
  ) => {
    const data = request.body;
    try {
      const result = await this.service.createTransaction(data);
      return reply.code(201).send(result);
    } catch (err) {
      return reply.code(500).send(err);
    }
  };

  handleFailure = async (request: FastifyRequest, reply: FastifyReply) => {
    return reply.type("text/html").send(`
      <html>
        <head>
          <title>Payment Failed</title>
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
            .error { color: red; }
            .container { max-width: 600px; margin: 0 auto; border: 1px solid #ccc; padding: 20px; border-radius: 8px; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1 class="error">Payment Failed</h1>
            <p>We were unable to process your payment. This could be due to:</p>
            <ul style="text-align: left; display: inline-block;">
              <li>Insufficient funds</li>
              <li>Incorrect card details</li>
              <li>Transaction cancellation</li>
            </ul>
            <p>Please try again or contact support.</p>
            <a href="/">Return to Home</a>
          </div>
        </body>
      </html>
    `);
  };
}
