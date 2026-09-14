import assert from "node:assert/strict";
import test from "node:test";
import { createMcpServerCard } from "./mcp.ts";

const config = {
  price: "$0.01",
  network: "eip155:8453",
} as Parameters<typeof createMcpServerCard>[0];

test("MCP server card advertises the purchase preparation tool", () => {
  const card = createMcpServerCard(config);
  assert.equal(card.serverInfo.name, "x402 Crypto Research API");
  assert.equal(card.authentication.required, false);
  assert.equal(card.tools[0]?.name, "prepare_crypto_research_purchase");
  assert.match(card.tools[0]?.description ?? "", /\$0\.01 USDC/);
});
