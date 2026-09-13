export type ResearchUsage = {
  inputTokens: number;
  cachedInputTokens: number;
  outputTokens: number;
  webSearchCalls: number;
  estimatedUsd: number | null;
};

const GPT_5_4_MINI = {
  inputPerMillion: 0.75,
  cachedInputPerMillion: 0.075,
  outputPerMillion: 4.5,
  webSearchPerCall: 0.01,
};

export function estimateResearchUsage(
  model: string,
  inputTokens: number,
  cachedInputTokens: number,
  outputTokens: number,
  webSearchCalls: number,
): ResearchUsage {
  const safeCachedTokens = Math.min(Math.max(cachedInputTokens, 0), inputTokens);
  const nonCachedInputTokens = Math.max(inputTokens - safeCachedTokens, 0);
  const isSupportedModel = model === "gpt-5.4-mini" || model.startsWith("gpt-5.4-mini-");

  if (!isSupportedModel) {
    return {
      inputTokens,
      cachedInputTokens: safeCachedTokens,
      outputTokens,
      webSearchCalls,
      estimatedUsd: null,
    };
  }

  const estimatedUsd =
    (nonCachedInputTokens / 1_000_000) * GPT_5_4_MINI.inputPerMillion +
    (safeCachedTokens / 1_000_000) * GPT_5_4_MINI.cachedInputPerMillion +
    (outputTokens / 1_000_000) * GPT_5_4_MINI.outputPerMillion +
    webSearchCalls * GPT_5_4_MINI.webSearchPerCall;

  return {
    inputTokens,
    cachedInputTokens: safeCachedTokens,
    outputTokens,
    webSearchCalls,
    estimatedUsd,
  };
}

export function formatResearchCost(model: string, usage: ResearchUsage): string {
  const estimatedCost =
    usage.estimatedUsd === null ? "unavailable" : `$${usage.estimatedUsd.toFixed(6)}`;

  return [
    "[research-cost]",
    `model=${model}`,
    `input_tokens=${usage.inputTokens}`,
    `cached_input_tokens=${usage.cachedInputTokens}`,
    `output_tokens=${usage.outputTokens}`,
    `web_search_calls=${usage.webSearchCalls}`,
    `estimated_usd=${estimatedCost}`,
  ].join(" ");
}
