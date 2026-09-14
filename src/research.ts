import OpenAI from "openai";
import { estimateResearchUsage, type ResearchUsage } from "./cost.js";

export type ResearchResult = {
  topic: string;
  report: string;
  sources: Array<{ title: string; url: string }>;
  researchedAt: string;
};

export type ResearchOperation = {
  result: ResearchResult;
  usage: ResearchUsage;
};

type Citation = { type: "url_citation"; title?: string; url: string };

export function createResearcher(apiKey: string, model: string) {
  const client = new OpenAI({ apiKey });

  return async function research(topic: string): Promise<ResearchOperation> {
    const response = await client.responses.create({
      model,
      store: false,
      max_output_tokens: 1800,
      tools: [{ type: "web_search_preview", search_context_size: "low" }],
      instructions: `You are a careful crypto intelligence analyst. Produce decision-useful analysis rather than a generic search summary.

For every request:
- define the scope and the metric being measured;
- verify important claims with primary or reputable sources when possible;
- distinguish confirmed facts, reported claims, and your own inference;
- include contract addresses and dates when they are relevant;
- compare candidates instead of merely listing them;
- flag weak evidence, suspicious activity, concentration, liquidity, counterfeit contracts, and other material risks;
- explain notable exclusions and why they did not qualify;
- finish with a ranked conclusion or a clear answer to the question.

For Base launch, token, or protocol research, use this structure when applicable: scope and methodology; screened candidates; verified launch evidence; volume and liquidity; holder or market concentration; suspicious-activity and contract-risk flags; exclusions; ranked conclusion.

Return a concise but substantive report with source citations. Do not give personalized financial advice and never imply that trading volume alone proves quality or legitimacy.`,
      input: `Research topic: ${topic}`,
    });

    const sources = new Map<string, { title: string; url: string }>();
    for (const item of response.output) {
      if (item.type !== "message") continue;
      for (const content of item.content) {
        if (content.type !== "output_text") continue;
        for (const annotation of content.annotations) {
          if (annotation.type !== "url_citation") continue;
          const citation = annotation as Citation;
          sources.set(citation.url, {
            title: citation.title || new URL(citation.url).hostname,
            url: citation.url,
          });
        }
      }
    }

    if (!response.output_text.trim()) {
      throw new Error("The research provider returned an empty report");
    }

    const webSearchCalls = response.output.filter(item => item.type === "web_search_call").length;
    const usage = estimateResearchUsage(
      model,
      response.usage?.input_tokens ?? 0,
      response.usage?.input_tokens_details.cached_tokens ?? 0,
      response.usage?.output_tokens ?? 0,
      webSearchCalls,
    );

    return {
      result: {
        topic,
        report: response.output_text,
        sources: [...sources.values()],
        researchedAt: new Date().toISOString(),
      },
      usage,
    };
  };
}
