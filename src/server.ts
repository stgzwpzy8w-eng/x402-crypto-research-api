import express, { type NextFunction, type Request, type Response } from "express";
import { HTTPFacilitatorClient } from "@x402/core/server";
import { ExactEvmScheme } from "@x402/evm/exact/server";
import { paymentMiddleware, x402ResourceServer } from "@x402/express";
import {
  bazaarResourceServerExtension,
  declareDiscoveryExtension,
} from "@x402/extensions/bazaar";
import { loadServerConfig } from "./config.js";
import { formatResearchCost } from "./cost.js";
import { renderLandingPage } from "./landing.js";
import { createResearcher } from "./research.js";
import { normalizeTopic } from "./topic.js";

const config = loadServerConfig();
const research = createResearcher(config.openAiApiKey, config.openAiModel);
const facilitator = new HTTPFacilitatorClient({ url: config.facilitatorUrl });
const resourceServer = new x402ResourceServer(facilitator)
  .register(config.network, new ExactEvmScheme())
  .registerExtension(bazaarResourceServerExtension);

const app = express();
app.use(express.json({ limit: "16kb" }));
app.get("/", (_req: Request, res: Response) => {
  res.type("html").send(renderLandingPage(config));
});
app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok" });
});
app.use(
  paymentMiddleware(
    {
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
  ),
);

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
});
