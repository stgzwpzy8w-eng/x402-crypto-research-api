import assert from "node:assert/strict";
import test from "node:test";
import { parseFacilitatorProvider, validatePaymentConfig } from "./config.ts";

const testFacilitator = "https://x402.org/facilitator";

test("accepts the safe Base Sepolia defaults", () => {
  assert.doesNotThrow(() =>
    validatePaymentConfig("$0.08", "eip155:84532", testFacilitator, false),
  );
});

test("rejects malformed or dangerous prices", () => {
  assert.throws(
    () => validatePaymentConfig("0.08", "eip155:84532", testFacilitator, false),
    /X402_PRICE/,
  );
  assert.throws(
    () => validatePaymentConfig("$80", "eip155:84532", testFacilitator, false),
    /no more than \$10/,
  );
});

test("requires an explicit switch and production facilitator for Base mainnet", () => {
  assert.throws(
    () => validatePaymentConfig("$0.08", "eip155:8453", testFacilitator, false),
    /ALLOW_MAINNET=true/,
  );
  assert.throws(
    () => validatePaymentConfig("$0.08", "eip155:8453", testFacilitator, true),
    /testnet-only/,
  );
  assert.doesNotThrow(() =>
    validatePaymentConfig("$0.08", "eip155:8453", "https://production.example/facilitator", true),
  );
});

test("rejects networks outside the MVP allowlist", () => {
  assert.throws(
    () => validatePaymentConfig("$0.08", "eip155:1", testFacilitator, false),
    /Base Sepolia.*Base mainnet/,
  );
});

test("accepts only the supported facilitator providers", () => {
  assert.equal(parseFacilitatorProvider(undefined), "public");
  assert.equal(parseFacilitatorProvider(" CDP "), "cdp");
  assert.throws(() => parseFacilitatorProvider("unknown"), /public or cdp/);
});
