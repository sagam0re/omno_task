import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import supertest from "supertest";
import buildApp from "../../src/app";
import { TransactionStatus } from "../../src/domain/enums";

const mockQuery = vi.fn();
const mockRelease = vi.fn();
const mockConnect = vi.fn();

vi.mock("pg", () => {
  return {
    Pool: class {
      connect = mockConnect;
      query = mockQuery;
      end = vi.fn();
      on = vi.fn();
    },
  };
});

describe("PSP Routes Integration", () => {
  let app: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockConnect.mockResolvedValue({
      query: mockQuery,
      release: mockRelease,
    });
    mockQuery.mockResolvedValue({ rows: [] });

    app = await buildApp();
    await app.ready();
  });

  afterEach(async () => {
    if (app) await app.close();
  });

  describe("POST /psp/transactions", () => {
    it("should return PENDING_3DS for 4111 card", async () => {
      const payload = {
        amount: 100,
        currency: "USD",
        cardNumber: "4111000000000000",
        callbackUrl: "http://callback",
        internalId: "tx-123",
        failureUrl: "http://failure",
        cvv: "123",
        cardExpiry: "12/25",
      };

      const response = await supertest(app.server)
        .post("/psp/transactions")
        .send(payload)
        .expect(200);

      expect(response.body.status).toBe(TransactionStatus.PENDING_3DS);
      expect(response.body.redirectUrl).toBeDefined();
    });
  });

  describe("GET /psp/3ds/:id", () => {
    it("should return HTML", async () => {
      const response = await supertest(app.server)
        .get("/psp/3ds/tx-123")
        .expect(200);

      expect(response.headers["content-type"]).toBe("text/html");
      expect(response.text).toContain("3DS Authentication");
    });
  });

  describe("POST /psp/payment-complete", () => {
    it("should complete payment successfully", async () => {
      await supertest(app.server).post("/psp/transactions").send({
        amount: 100,
        currency: "USD",
        cardNumber: "4111000000000000",
        callbackUrl: "http://callback",
        internalId: "tx-123",
        failureUrl: "http://failure",
        cvv: "123",
        cardExpiry: "12/25",
      });

      const response = await supertest(app.server)
        .post("/psp/payment-complete")
        .send({ transactionId: "tx-123" })
        .expect(200);

      expect(response.headers["content-type"]).toBe("text/html");
      expect(response.text).toContain("Payment Complete");
    });
  });

  describe("POST /psp/payment-cancel", () => {
    it("should cancel payment successfully", async () => {
      await supertest(app.server).post("/psp/transactions").send({
        amount: 100,
        currency: "USD",
        cardNumber: "4111000000000000",
        callbackUrl: "http://callback",
        internalId: "tx-123",
        failureUrl: "http://failure",
        cvv: "123",
        cardExpiry: "12/25",
      });

      const response = await supertest(app.server)
        .post("/psp/payment-cancel")
        .send({ transactionId: "tx-123" })
        .expect(200);

      expect(response.body).toEqual({ redirectUrl: "http://failure" });
    });
  });
});
