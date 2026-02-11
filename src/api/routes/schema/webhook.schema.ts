export const webhookSchema = {
  summary: "Process PSP Webhook",
  description:
    "Handles callbacks from the PSP service regarding transaction status updates.",
  tags: ["Webhooks"],
  body: {
    type: "object",
    required: ["transactionId", "status"],
    properties: {
      transactionId: {
        type: "string",
        description: "The ID of the transaction",
      },
      status: {
        type: "string",
        description: "The new status of the transaction",
      },
      final_amount: {
        type: "number",
        description: "The final amount processed (if applicable)",
      },
    },
    examples: [
      {
        transactionId: "123e4567-e89b-12d3-a456-426614174000",
        status: "success",
        final_amount: 1000,
      },
    ],
  },
  response: {
    200: {
      description: "Webhook processed successfully",
      type: "object",
      properties: {
        received: { type: "boolean" },
      },
    },
    400: {
      description: "Invalid payload or transaction not found",
      type: "object",
      properties: {
        statusCode: { type: "integer" },
        error: { type: "string" },
        message: { type: "string" },
      },
    },
  },
};
