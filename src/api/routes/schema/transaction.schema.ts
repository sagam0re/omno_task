import { Currency, TransactionStatus } from "../../../domain/enums";

export const createTransactionSchema = {
  summary: "Create a new transaction",
  description:
    "Initiates a payment transaction with the given card details. This endpoint validates the input and communicates with the PSP.",
  tags: ["Transactions"],
  body: {
    type: "object",
    required: ["amount", "currency", "cardNumber", "cvv", "cardExpiry"],
    properties: {
      amount: {
        type: "integer",
        minimum: 1,
        description: "Amount in smallest currency unit (e.g., cents)",
      },
      currency: {
        type: "string",
        description: "ISO 4217 Currency Code",
      },
      cardNumber: {
        type: "string",
        description: "16-digit card number",
      },
      cvv: {
        type: "string",
        description: "Card security code",
      },
      cardExpiry: { type: "string", description: "Card expiry date (MM/YY)" },
    },
    examples: [
      {
        amount: 1000,
        currency: "USD",
        cardNumber: "1234567812345678",
        cvv: "123",
        cardExpiry: "12/25",
      },
    ],
  },
  response: {
    201: {
      description: "Transaction created successfully",
      type: "object",
      properties: {
        transactionId: { type: "string" },
        status: { type: "string" },
        redirectUrl: { type: "string" },
      },
    },
    400: {
      description: "Validation error",
      type: "object",
      properties: {
        statusCode: { type: "integer" },
        error: { type: "string" },
        message: { type: "string" },
      },
    },
    500: {
      description: "Internal Server Error",
      type: "object",
      properties: {
        statusCode: { type: "integer" },
        error: { type: "string" },
        message: { type: "string" },
      },
    },
  },
};
