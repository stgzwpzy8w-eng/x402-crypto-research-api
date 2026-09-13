import assert from "node:assert/strict";
import { once } from "node:events";
import test from "node:test";
import express from "express";
import { paymentMiddlewareFromHTTPServer } from "@x402/express";

test("does not settle payment when research generation fails", async () => {
  let cancellationReason: unknown;
  let settlementCalls = 0;

  const fakeHttpServer = {
    routes: {},
    requiresPayment: () => true,
    initialize: async () => undefined,
    processHTTPRequest: async () => ({
      type: "payment-verified",
      cancellationDispatcher: {
        cancel: async (reason: unknown) => {
          cancellationReason = reason;
          return { cancelled: true };
        },
      },
      beforeHandlerSettlement: undefined,
      paymentPayload: {},
      paymentRequirements: {},
      declaredExtensions: {},
    }),
    createFailurePathSettlementHeaders: () => ({}),
    processSettlement: async () => {
      settlementCalls += 1;
      return { success: true, headers: {} };
    },
  };

  const app = express();
  app.use(paymentMiddlewareFromHTTPServer(fakeHttpServer as never, undefined, undefined, false));
  app.post("/research", (_req, res) => {
    res.status(502).json({ error: "Research generation failed" });
  });

  const server = app.listen(0);
  await once(server, "listening");

  try {
    const address = server.address();
    assert(address && typeof address !== "string");

    const response = await fetch(`http://127.0.0.1:${address.port}/research`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ topic: "Force a provider failure" }),
    });

    assert.equal(response.status, 502);
    assert.equal(settlementCalls, 0);
    assert.deepEqual(cancellationReason, {
      reason: "handler_failed",
      responseStatus: 502,
    });
  } finally {
    server.close();
    await once(server, "close");
  }
});

test("settles payment after research generation succeeds", async () => {
  let cancellationCalls = 0;
  let settlementCalls = 0;

  const fakeHttpServer = {
    routes: {},
    requiresPayment: () => true,
    initialize: async () => undefined,
    processHTTPRequest: async () => ({
      type: "payment-verified",
      cancellationDispatcher: {
        cancel: async () => {
          cancellationCalls += 1;
          return { cancelled: true };
        },
      },
      beforeHandlerSettlement: undefined,
      paymentPayload: {},
      paymentRequirements: {},
      declaredExtensions: {},
    }),
    createFailurePathSettlementHeaders: () => ({}),
    processSettlement: async () => {
      settlementCalls += 1;
      return {
        success: true,
        headers: { "PAYMENT-RESPONSE": "settled" },
      };
    },
  };

  const app = express();
  app.use(paymentMiddlewareFromHTTPServer(fakeHttpServer as never, undefined, undefined, false));
  app.post("/research", (_req, res) => {
    res.json({ report: "Completed research" });
  });

  const server = app.listen(0);
  await once(server, "listening");

  try {
    const address = server.address();
    assert(address && typeof address !== "string");

    const response = await fetch(`http://127.0.0.1:${address.port}/research`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ topic: "Successful research" }),
    });

    assert.equal(response.status, 200);
    assert.equal(response.headers.get("payment-response"), "settled");
    assert.equal(settlementCalls, 1);
    assert.equal(cancellationCalls, 0);
  } finally {
    server.close();
    await once(server, "close");
  }
});
