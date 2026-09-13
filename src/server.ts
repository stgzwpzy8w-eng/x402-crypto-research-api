import express, { type NextFunction, type Request, type Response } from "express";
import { createCdpFacilitatorClient } from "@coinbase/cdp-sdk/x402";
import { HTTPFacilitatorClient } from "@x402/core/server";
import { ExactEvmScheme } from "@x402/evm/exact/server";
import { paymentMiddleware, x402ResourceServer } from "@x402/express";
import { createPaywall } from "@x402/paywall";
import { evmPaywall } from "@x402/paywall/evm";
import {
  bazaarResourceServerExtension,
  declareDiscoveryExtension,
} from "@x402/extensions/bazaar";
import { loadServerConfig } from "./config.js";
import { formatResearchCost } from "./cost.js";
import { demoResearchResult } from "./demo.js";
import { createLlmsText, createOpenApiDocument } from "./discovery.js";
import { renderLandingPage, renderResearchResultPage } from "./landing.js";
import { createResearcher } from "./research.js";
import { normalizeTopic } from "./topic.js";

const config = loadServerConfig();
const research = createResearcher(config.openAiApiKey, config.openAiModel);
const facilitator = config.facilitatorProvider === "cdp"
  ? createCdpFacilitatorClient({
      apiKeyId: config.cdpApiKeyId,
      apiKeySecret: config.cdpApiKeySecret,
    })
  : new HTTPFacilitatorClient({ url: config.facilitatorUrl });
const resourceServer = new x402ResourceServer(facilitator)
  .register(config.network, new ExactEvmScheme())
  .registerExtension(bazaarResourceServerExtension);
const browserPaywall = createPaywall()
  .withNetwork(evmPaywall)
  .withConfig({
    appName: "x402 Crypto Research API",
    testnet: config.network !== "eip155:8453",
  })
  .build();

const app = express();
app.set("trust proxy", 1);
app.use(express.json({ limit: "16kb" }));
app.get("/", (_req: Request, res: Response) => {
  res.type("html").send(renderLandingPage(config));
});
app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok" });
});
app.get("/demo", (_req: Request, res: Response) => {
  res.json(demoResearchResult);
});
app.get("/openapi.json", (_req: Request, res: Response) => {
  res.json(createOpenApiDocument(config));
});
app.get("/llms.txt", (_req: Request, res: Response) => {
  res.type("text/plain").send(createLlmsText(config));
});
app.use(
  paymentMiddleware(
    {
      "GET /buy": {
        accepts: {
          scheme: "exact",
          price: config.price,
          network: config.network,
          payTo: config.payTo,
        },
        description: "Current crypto research report in the browser",
        mimeType: "text/html",
      },
      "POST /research": {
        accepts: {
          scheme: "exact",
          price: config.price,
          network: config.network,
          payTo: config.payTo,
        },
        description: "Current crypto research report for one topic",
        mimeType: "application/json",
        serviceName: "x402 Crypto Research API",
        tags: ["crypto", "research", "web-search", "ai"],
        extensions: declareDiscoveryExtension({
          input: {
            topic: "What changed in the Solana ecosystem this week?",
          },
          inputSchema: {
            properties: {
              topic: {
                type: "string",
                description: "Crypto research question or topic",
                minLength: 3,
                maxLength: 500,
              },
            },
            required: ["topic"],
            additionalProperties: false,
          },
          bodyType: "json",
          output: {
            example: {
              topic: "What changed in the Solana ecosystem this week?",
              report: "A concise, sourced research report.",
              sources: [
                { title: "Source title", url: "https://example.com/article" },
              ],
              researchedAt: "2026-09-13T12:00:00.000Z",
            },
          },
        }),
      },
    },
    resourceServer,
    {
      appName: "x402 Crypto Research API",
      testnet: config.network !== "eip155:8453",
    },
    browserPaywall,
  ),
);

app.get("/buy", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const topic = normalizeTopic(req.query.topic);
    const { result, usage } = await research(topic);
    console.log(formatResearchCost(config.openAiModel, usage));
    res.type("html").send(renderResearchResultPage(result));
  } catch (error) {
    next(error);
  }
});

app.post("/research", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const topic = normalizeTopic(req.body?.topic);
    const { result, usage } = await research(topic);
    console.log(formatResearchCost(config.openAiModel, usage));
    res.json(result);
  } catch (error) {
    next(error);
  }
});

app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (error instanceof TypeError || error instanceof RangeError || error instanceof SyntaxError) {
    res.status(400).json({ error: error.message });
    return;
  }

  console.error(error);
  res.status(502).json({ error: "Research generation failed" });
});

app.listen(config.port, () => {
  console.log(`x402 Crypto Research API listening on http://localhost:${config.port}`);
  console.log(
    `POST /research costs ${config.price} USDC on ${config.network}; payments go to ${config.payTo}`,
  );
  console.log(`x402 facilitator: ${config.facilitatorProvider}`);
});
