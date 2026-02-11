import { FastifyReply, FastifyRequest } from "fastify";
import { PspProcessDto } from "../../application/services/dto/psp.dto";
import { IPSPService } from "../../application/services/psp/psp.interface";

export class PspController {
  constructor(private service: IPSPService) {}

  process = async (
    request: FastifyRequest<{ Body: PspProcessDto }>,
    reply: FastifyReply,
  ) => {
    try {
      const result = await this.service.processTransaction(request.body);
      return reply.send(result);
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send(error);
    }
  };

  handle3ds = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };

      reply.type("text/html").send(`
          <html>
          <head>
            <title>Payment Failed</title>
            <style>
              body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
              .container { max-width: 600px; margin: 0 auto; border: 1px solid #ccc; padding: 20px; border-radius: 8px; }
            </style>
          </head>
            <body>
              <h1>3DS Authentication</h1>
              <button id="btn">Approve Payment</button>
              <button id="cancel-btn" style="background-color: red; color: white;">Cancel Payment</button>

              <script>
                document.getElementById('btn').onclick = async () => {
                  const response = await fetch('/psp/payment-complete', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ transactionId: "${id}" })
                  });
                  if (response.ok) {
                    const html = await response.text();
                    document.body.innerHTML = html; 
                  }
                };

                document.getElementById('cancel-btn').onclick = async () => {
                  const response = await fetch('/psp/payment-cancel', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ transactionId: "${id}" })
                  });
                  if (response.ok) {
                    const data = await response.json();
                    if (data.redirectUrl) {
                      window.location.href = data.redirectUrl;
                    }
                  }
                };
              </script>
            </body>
          </html>
        `);
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send(error);
    }
  };

  paymentComplete = async (
    request: FastifyRequest<{ Body: { transactionId: string } }>,
    reply: FastifyReply,
  ) => {
    const { transactionId } = request.body;

    try {
      // Delegate to service to handle webhook and status update
      await this.service.completePayment(transactionId);
    } catch (err) {
      request.log.error(err, "Failed to complete payment");
      return reply.type("text/html").send(
        `<html>
        <head>
          <title>Payment Failed</title>
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
            .container { max-width: 600px; margin: 0 auto; border: 1px solid #ccc; padding: 20px; border-radius: 8px; }
          </style>
        </head>
        <body>
          <div class="container">       
            <h1>Payment Failed</h1>
            <p>Transaction not found or invalid.</p>
          </div>
        </body>
      </html>`,
      );
    }

    return reply.type("text/html").send(
      `<html>
        <head>
          <title>Payment Failed</title>
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
            .container { max-width: 600px; margin: 0 auto; border: 1px solid #ccc; padding: 20px; border-radius: 8px; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Payment Complete</h1>
            <p>Your transaction has been processed. You can close this window.</p>
          </div>
        </body>
      </html>`,
    );
  };

  paymentCancel = async (
    request: FastifyRequest<{ Body: { transactionId: string } }>,
    reply: FastifyReply,
  ) => {
    const { transactionId } = request.body;

    try {
      const failureUrl = await this.service.cancelPayment(transactionId);
      return reply.send({ redirectUrl: failureUrl });
    } catch (err: any) {
      request.log.error(err, "Failed to cancel payment");
      return reply
        .code(500)
        .send({ error: "Failed to cancel payment", message: err.message });
    }
  };
}
