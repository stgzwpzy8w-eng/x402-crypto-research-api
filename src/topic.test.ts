import assert from "node:assert/strict";
import test from "node:test";
import { normalizeTopic } from "./topic.ts";

test("normalizes whitespace", () => {
  assert.equal(normalizeTopic("  Solana   ecosystem this week  "), "Solana ecosystem this week");
});

test("rejects missing, short and oversized topics", () => {
  assert.throws(() => normalizeTopic(undefined), /must be a string/);
  assert.throws(() => normalizeTopic(" x "), /at least 3/);
  assert.throws(() => normalizeTopic("x".repeat(501)), /must not exceed 500/);
});
