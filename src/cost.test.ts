import assert from "node:assert/strict";
import test from "node:test";
import { estimateResearchUsage, formatResearchCost } from "./cost.ts";

test("estimates GPT-5.4 Mini token and web-search cost", () => {
  const usage = estimateResearchUsage("gpt-5.4-mini", 10_000, 2_000, 1_000, 1);

  assert.equal(usage.estimatedUsd, 0.02065);
  assert.match(formatResearchCost("gpt-5.4-mini", usage), /estimated_usd=\$0\.020650/);
});

test("does not guess a price for an unknown model", () => {
  const usage = estimateResearchUsage("another-model", 100, 0, 100, 1);

  assert.equal(usage.estimatedUsd, null);
  assert.match(formatResearchCost("another-model", usage), /estimated_usd=unavailable/);
});
