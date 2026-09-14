import assert from "node:assert/strict";
import test from "node:test";
import {
  createLlmsText,
  createOpenApiDocument,
  createSkillText,
  createX402Manifest,
} from "./discovery.ts";

const config = {
  price: "$0.08",
  network: "eip155:8453",
  payTo: "0xd50e402b784587e494B864383FB50282118E3EA5",
};

test("publishes an OpenAPI operation for paid research", () => {
  const document = createOpenApiDocument(config);
  const operation = document.paths["/research"].post;

  assert.equal(document.openapi, "3.1.0");
  assert.equal(operation.operationId, "researchCryptoTopic");
  assert.match(operation.description, /\$0\.08 USDC/);
  assert.equal(operation["x-payment-info"].network, "eip155:8453");
  assert.ok("402" in operation.responses);
});

test("publishes concise agent-readable instructions", () => {
  const text = createLlmsText(config);

  assert.match(text, /POST https:\/\/x402-crypto-research-api-production\.up\.railway\.app\/research/);
  assert.match(text, /\$0\.08 USDC on eip155:8453/);
  assert.match(text, /openapi\.json/);
});

test("publishes a standalone x402 discovery manifest", () => {
  const manifest = createX402Manifest(config);
  const resource = manifest.resources[0]!;

  assert.equal(resource.url, "https://x402-crypto-research-api-production.up.railway.app/research");
  assert.equal(resource.method, "POST");
  assert.equal(resource.x402Version, 2);
  assert.equal(resource.accepts[0]!.payTo, config.payTo);
});

test("publishes an agent skill document", () => {
  const skill = createSkillText(config);

  assert.match(skill, /POST https:\/\/x402-crypto-research-api-production\.up\.railway\.app\/research/);
  assert.match(skill, /\.well-known\/x402/);
  assert.match(skill, /\$0\.08 USDC/);
});
