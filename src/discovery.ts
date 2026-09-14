type PublicApiConfig = {
  price: string;
  network: string;
  payTo?: string;
};

const publicBaseUrl = "https://x402-crypto-research-api-production.up.railway.app";

export function createOpenApiDocument(config: PublicApiConfig) {
  return {
    openapi: "3.1.0",
    info: {
      title: "Base Launch Intelligence API",
      version: "0.1.0",
      description: `Base launch screening and token due diligence with verified evidence, market-quality analysis, risk flags, exclusions, and ranked conclusions. Paid per request with x402. Price: ${config.price} USDC on ${config.network}.`,
    },
    servers: [{ url: publicBaseUrl }],
    paths: {
      "/research": {
        post: {
          operationId: "researchCryptoTopic",
          summary: "Generate Base launch intelligence or token due diligence",
          description: `Requires an x402 payment of ${config.price} USDC on ${config.network}.`,
          "x-payment-info": {
            price: config.price,
            currency: "USDC",
            network: config.network,
            protocols: [{ x402: {} }],
          },
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

export function createX402Manifest(config: PublicApiConfig) {
  return {
    name: "Base Launch Intelligence API",
    description: "Screen new Base launches and investigate Base tokens with evidence, market-quality analysis, risk flags, exclusions, and ranked conclusions.",
    version: "0.1.0",
    homepage: publicBaseUrl,
    skill: `${publicBaseUrl}/skill.md`,
    openapi: `${publicBaseUrl}/openapi.json`,
    resources: [
      {
        url: `${publicBaseUrl}/research`,
        method: "POST",
        type: "http",
        x402Version: 2,
        description: "Generate Base launch intelligence or token due diligence with source links.",
        accepts: [
          {
            scheme: "exact",
            network: config.network,
            price: config.price,
            currency: "USDC",
            ...(config.payTo ? { payTo: config.payTo } : {}),
          },
        ],
        input: {
          contentType: "application/json",
          schema: {
            type: "object",
            properties: { topic: { type: "string", minLength: 3, maxLength: 500 } },
            required: ["topic"],
            additionalProperties: false,
          },
        },
      },
    ],
  };
}

export function createSkillText(config: PublicApiConfig): string {
  return `# Base Launch Intelligence API

## Capability

Find credible new Base launches or investigate a Base token. Reports add verified contracts and launch evidence, liquidity and concentration analysis, suspicious-activity flags, exclusions, a ranked conclusion, and source links.

## Paid operation

- Endpoint: POST ${publicBaseUrl}/research
- Price: ${config.price} USDC
- Network: ${config.network}
- Protocol: x402 v2, exact payment
- Content-Type: application/json

## Input

\`\`\`json
{"topic":"Which Base projects launched this month and show credible traction?"}
\`\`\`

The topic must contain 3–500 characters.

## Output

JSON containing \`topic\`, \`report\`, \`sources\`, and \`researchedAt\`. Send the request with an x402-compatible client; it should handle the initial HTTP 402 challenge, sign the USDC authorization, and retry automatically.

## Discovery

- Manifest: ${publicBaseUrl}/.well-known/x402
- OpenAPI: ${publicBaseUrl}/openapi.json
- Free response example: ${publicBaseUrl}/demo
- Source: https://github.com/stgzwpzy8w-eng/x402-crypto-research-api
`;
}

export function createLlmsText(config: PublicApiConfig): string {
  return `# Base Launch Intelligence API

> Base launch screening and token due diligence for humans and AI agents, paid per request with x402.

- API base: ${publicBaseUrl}
- Paid endpoint: POST ${publicBaseUrl}/research
- Price: ${config.price} USDC on ${config.network}
- Request JSON: {"topic":"Your crypto research question"}
- Free static example: ${publicBaseUrl}/demo
- OpenAPI specification: ${publicBaseUrl}/openapi.json
- Source and client: https://github.com/stgzwpzy8w-eng/x402-crypto-research-api

Use it to find credible new Base launches, investigate a token, or compare Base projects. The paid endpoint returns evidence, market-quality analysis, risk flags, exclusions, a ranked conclusion, source links, and researchedAt. A compatible x402 client handles the HTTP 402 challenge and payment automatically. Use a dedicated low-balance wallet.
`;
}
