export const demoResearchResult = {
  demo: true,
  topic: "What does an x402-powered research API do?",
  report:
    "This API accepts a crypto research topic, verifies a USDC payment through x402, and then returns a concise, web-researched report with source links. This response is a static preview; paid reports are generated fresh for the buyer's topic.",
  sources: [
    {
      title: "x402 documentation",
      url: "https://docs.x402.org/",
    },
  ],
  researchedAt: null,
  note: "Static preview only. POST /research for a current report.",
} as const;
