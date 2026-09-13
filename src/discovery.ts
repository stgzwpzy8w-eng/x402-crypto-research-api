type PublicApiConfig = {
  price: string;
  network: string;
};

const publicBaseUrl = "https://x402-crypto-research-api-production.up.railway.app";

export function createOpenApiDocument(config: PublicApiConfig) {
  return {
    openapi: "3.1.0",
    info: {
      title: "x402 Crypto Research API",
      version: "0.1.0",
      description: `Current, sourced crypto research paid per request with x402. Price: ${config.price} USDC on ${config.network}.`,
    },
    servers: [{ url: publicBaseUrl }],
    paths: {
      "/research": {
        post: {
          operationId: "researchCryptoTopic",
          summary: "Generate a current crypto research report",
          description: `Requires an x402 payment of ${config.price} USDC on ${config.network}.`,
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    topic: { type: "string", minLength: 3, maxLength: 500 },
                  },
                  required: ["topic"],
                  additionalProperties: false,
                },
              },
            },
          },
          responses: {
            "200": {
              description: "Fresh research report after successful payment",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      topic: { type: "string" },
                      report: { type: "string" },
                      sources: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            title: { type: "string" },
                            url: { type: "string", format: "uri" },
                          },
                          required: ["title", "url"],
                        },
                      },
                      researchedAt: { type: "string", format: "date-time" },
                    },
                    required: ["topic", "report", "sources", "researchedAt"],
                  },
                },
              },
            },
            "400": { description: "Invalid topic" },
            "402": { description: "x402 payment required" },
            "502": { description: "Research provider failed; payment is not settled" },
          },
        },
      },
      "/demo": {
        get: {
          operationId: "getDemoReport",
          summary: "Inspect a free static response example",
          responses: { "200": { description: "Static example; not current research" } },
        },
      },
      "/health": {
        get: {
          operationId: "getHealth",
          summary: "Check service availability",
          responses: { "200": { description: "Service is running" } },
        },
      },
    },
  };
}

export function createLlmsText(config: PublicApiConfig): string {
  return `# x402 Crypto Research API

> Current, sourced crypto research for humans and AI agents, paid per request with x402.

- API base: ${publicBaseUrl}
- Paid endpoint: POST ${publicBaseUrl}/research
- Price: ${config.price} USDC on ${config.network}
- Request JSON: {"topic":"Your crypto research question"}
- Free static example: ${publicBaseUrl}/demo
- OpenAPI specification: ${publicBaseUrl}/openapi.json
- Source and client: https://github.com/stgzwpzy8w-eng/x402-crypto-research-api

The paid endpoint returns topic, report, source links, and researchedAt. A compatible x402 client handles the HTTP 402 challenge and payment automatically. Use a dedicated low-balance wallet.
`;
}
