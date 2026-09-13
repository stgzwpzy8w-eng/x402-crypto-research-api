import assert from "node:assert/strict";
import test from "node:test";
import { renderLandingPage, renderResearchResultPage } from "./landing.ts";

test("renders public API details and escapes environment values", () => {
  const html = renderLandingPage({
    price: "$0.08",
    network: "eip155:84532",
    payTo: "<unsafe>",
  });

  assert.match(html, /POST \/research/);
  assert.match(html, /\$0\.08 USDC/);
  assert.match(html, /eip155:84532/);
  assert.match(html, /&lt;unsafe&gt;/);
  assert.doesNotMatch(html, /<unsafe>/);
  assert.match(html, /Testnet service; test USDC has no real-world value/);
  assert.match(html, /href="#free-demo"/);
  assert.match(html, /raw JSON demo response/);
  assert.match(html, /Try the free preview/);
  assert.match(html, /aria-label="Research topic"/);
  assert.match(html, /Generate preview/);
  assert.match(html, /Free static preview/);
  assert.match(html, /previewTopic\.textContent/);
  assert.match(html, /action="\/buy"/);
  assert.match(html, /Buy report/);
  assert.match(html, /first three external buyers/);
  assert.match(html, /Sources included/);
  assert.match(html, /Risks and uncertainty/);
  assert.match(html, /Agent quickstart/);
  assert.match(html, /@x402\/fetch/);
  assert.match(html, /href="\/openapi\.json"/);
  assert.match(html, /href="\/llms\.txt"/);
  assert.match(html, /href="\/health"/);
});

test("renders a safe browser research result", () => {
  const html = renderResearchResultPage({
    topic: "Base <script>alert(1)</script>",
    report: "Finding <strong>one</strong>",
    sources: [{ title: "Official <source>", url: "https://example.com/?a=1&b=2" }],
    researchedAt: "2026-09-13T12:00:00.000Z",
  });

  assert.match(html, /Payment settled · report ready/);
  assert.match(html, /Base &lt;script&gt;alert\(1\)&lt;\/script&gt;/);
  assert.match(html, /Finding &lt;strong&gt;one&lt;\/strong&gt;/);
  assert.match(html, /https:\/\/example\.com\/\?a=1&amp;b=2/);
  assert.doesNotMatch(html, /<script>alert\(1\)<\/script>/);
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
