import assert from "node:assert/strict";
import test from "node:test";
import { funnelSource, hasPaymentAuthorization } from "./funnel.ts";

test("funnelSource keeps short campaign labels", () => {
  assert.equal(funnelSource("Gold-402"), "gold-402");
});

test("funnelSource removes unsafe characters and defaults to direct", () => {
  assert.equal(funnelSource("  Discord / launch!  "), "discordlaunch");
  assert.equal(funnelSource(undefined), "direct");
});

test("detects x402 v2 and legacy payment authorization headers without logging their values", () => {
  assert.equal(hasPaymentAuthorization({ "payment-signature": "signed-payload" }), true);
  assert.equal(hasPaymentAuthorization({ "x-payment": "legacy-signed-payload" }), true);
  assert.equal(hasPaymentAuthorization({ "content-type": "application/json" }), false);
});
