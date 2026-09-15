import assert from "node:assert/strict";
import test from "node:test";
import { funnelSource, hasPaymentAuthorization, requestSource } from "./funnel.ts";

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

test("requestSource prefers campaign labels and recognizes common referrers", () => {
  const request = (ref: unknown, referer?: string) => ({
    query: { ref },
    get: (name: string) => name === "referer" ? referer : undefined,
  });

  assert.equal(requestSource(request("X-Campaign") as never), "x-campaign");
  assert.equal(requestSource(request(undefined, "https://t.co/example") as never), "x");
  assert.equal(requestSource(request(undefined, "https://discord.com/channels/1") as never), "discord");
  assert.equal(requestSource(request(undefined, "not a url") as never), "direct");
});
