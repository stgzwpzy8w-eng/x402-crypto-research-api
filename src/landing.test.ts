import assert from "node:assert/strict";
import test from "node:test";
import { renderLandingPage } from "./landing.ts";

test("renders public API details and escapes environment values", () => {
  const html = renderLandingPage({
    price: "$0.08",
    network: "eip155:84532",
    payTo: "<unsafe>",
  });

  assert.match(html, /POST \/research/);
  assert.match(html, /\$0\.08 USDC/);
  assert.match(html, /eip155:84532/);
  assert.match(html, /&lt;unsafe&gt;/);  assert.doesNotMatch(html, /<unsafe>/);
  assert.match(html, /Testnet service; test USDC has no real-world value/);
  assert.match(html, /href="\/demo"/);
  assert.match(html, /without a wallet, payment, or API cost/);
  assert.match(html, /Agent quickstart/);
  assert.match(html, /@x402\/fetch/);
  assert.match(html, /href="\/openapi\.json"/);
  assert.match(html, /href="\/llms\.txt"/);
  assert.match(html, /href="\/health"/);
});

test("warns that Base mainnet uses real USDC", () => {
  const html = renderLandingPage({
    price: "$0.08",
    network: "eip155:8453",
    payTo: "0xd50e402b784587e494B864383FB50282118E3EA5",
  });

  assert.match(html, /Mainnet service; payments use real USDC on Base/);
  assert.match(html, /Buy one report/);
  assert.match(html, /pnpm client/);
  assert.match(html, /dedicated low-balance wallet/);
  assert.match(html, /API_URL=https:\/\/x402-crypto-research-api-production\.up\.railway\.app\/research/);
  assert.match(html, /\$0\.08 USDC is real money/);
  assert.doesNotMatch(html, /test USDC has no real-world value/);
});
