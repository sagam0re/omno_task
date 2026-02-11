import { FastifyRequest, FastifyReply } from "fastify";
import { CreateTransactionDto } from "../../application/services/dto/transaction.dto";
import { Currency } from "../../domain/enums";

export const validateTransactionRequest = async (
  request: FastifyRequest<{ Body: CreateTransactionDto }>,
  reply: FastifyReply,
) => {
  const body = request.body;
  const { cardNumber, cardExpiry, currency, cvv } = body;

  if (cvv && !/^[0-9]{3,4}$/.test(cvv)) {
    return reply.status(400).send({
      statusCode: 400,
      error: "Bad Request",
      message: "Invalid CVV",
    });
  }

  const validCurrencies = Object.values(Currency);

  if (currency && !validCurrencies.includes(currency)) {
    return reply.status(400).send({
      statusCode: 400,
      error: "Bad Request",
      message: "Invalid currency",
    });
  }

  if (cardNumber && !luhnCheck(cardNumber)) {
    return reply.status(400).send({
      statusCode: 400,
      error: "Bad Request",
      message: "Invalid card number (Luhn check failed)",
    });
  }

  if (cardExpiry) {
    const expiryRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;
    if (!expiryRegex.test(cardExpiry)) {
      return reply.status(400).send({
        statusCode: 400,
        error: "Bad Request",
        message: "Invalid card expiry format. Use MM/YY",
      });
    }

    const [month, year] = cardExpiry
      .split("/")
      .map((num: string) => parseInt(num, 10));
    const now = new Date();
    const currentYear = now.getFullYear() % 100;
    const currentMonth = now.getMonth() + 1;

    if (year < currentYear || (year === currentYear && month < currentMonth)) {
      return reply.status(400).send({
        statusCode: 400,
        error: "Bad Request",
        message: "Card has expired",
      });
    }
  }
};

const luhnCheck = (cardNumber: string) => {
  const digits = String(cardNumber).replace(/\D/g, "");
  let sum = 0;
  let isEven = false;

  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits.charAt(i), 10);

    if (isEven) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
};
