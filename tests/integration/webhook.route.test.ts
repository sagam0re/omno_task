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

describe("Webhook Route Integration", () => {
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

  it("should process webhook successfully", async () => {
    const payload = {
      transactionId: "tx_123e4567-e89b-12d3-a456-426614174000",
      status: TransactionStatus.SUCCESS,
      final_amount: 100,
    };

    const mockTx = {
      id: "tx-123",
      status: TransactionStatus.PENDING_3DS,
      amount: 100,
      currency: "USD",
    };

    mockQuery
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({ rows: [mockTx] })
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({});

    const response = await supertest(app.server)
      .post("/webhooks/psp")
      .send(payload)
      .expect(200);

    expect(response.body).toEqual({ received: true });
    expect(mockQuery).toHaveBeenCalled();
  });

  it("should be idempotent (same webhook sent twice)", async () => {
    const payload = {
      transactionId: "123e4567-e89b-12d3-a456-426614174000",
      status: TransactionStatus.SUCCESS,
      final_amount: 100,
    };

    const mockTx = {
      id: "tx-123",
      status: TransactionStatus.SUCCESS,
      amount: 100,
      currency: "USD",
    };

    mockQuery
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({ rows: [mockTx] })
      .mockResolvedValueOnce({});

    const response = await supertest(app.server)
      .post("/webhooks/psp")
      .send(payload)
      .expect(200);

    expect(response.body).toEqual({ received: true });

    const hasRollback = mockQuery.mock.calls.some(
      (args) => args[0] === "ROLLBACK",
    );
    expect(hasRollback).toBe(true);
  });
});
