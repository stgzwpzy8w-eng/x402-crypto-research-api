import express, { type NextFunction, type Request, type Response } from "express";
import { readFileSync } from "node:fs";
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
import {
  createLlmsText,
  createOpenApiDocument,
  createSkillText,
  createX402Manifest,
} from "./discovery.js";
import { renderLandingPage, renderResearchResultPage } from "./landing.js";
import { createResearcher } from "./research.js";
import { normalizeTopic } from "./topic.js";
import { funnelSource, logFunnelEvent, trackPaidRequest } from "./funnel.js";
import { createMcpHandler, createMcpServerCard } from "./mcp.js";

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
app.get("/", (req: Request, res: Response) => {
  logFunnelEvent("landing_view", { source: funnelSource(req.query.ref) });
  res.type("html").send(renderLandingPage(config));
});
app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok" });
});
app.get("/demo", (_req: Request, res: Response) => {
  res.json(demoResearchResult);
});
app.get("/examples/base-launches-september-2026.md", (_req: Request, res: Response) => {
  const reportUrl = new URL("../anakin-base-launches-september-2026.md", import.meta.url);
  res.type("text/markdown").send(readFileSync(reportUrl, "utf8"));
});
app.get("/openapi.json", (_req: Request, res: Response) => {
  res.json(createOpenApiDocument(config));
});
app.get("/.well-known/x402", (_req: Request, res: Response) => {
  res.json(createX402Manifest(config));
});
app.get("/skill.md", (_req: Request, res: Response) => {
  res.type("text/markdown").send(createSkillText(config));
});
app.get("/llms.txt", (_req: Request, res: Response) => {
  res.type("text/plain").send(createLlmsText(config));
});
app.get("/.well-known/mcp/server-card.json", (_req: Request, res: Response) => {
  res.json(createMcpServerCard(config));
});
app.post("/mcp", createMcpHandler(config));
app.get("/mcp", (_req: Request, res: Response) => {
  res.status(405).set("Allow", "POST").json({ error: "Use POST with MCP Streamable HTTP" });
});
app.use(trackPaidRequest);
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
        description: "Base launch intelligence or current crypto research report in the browser",
        mimeType: "text/html",
      },
      "POST /research": {
        accepts: {
          scheme: "exact",
          price: config.price,
          network: config.network,
          payTo: config.payTo,
        },
        description: "Base launch intelligence and current crypto research for one topic",
        mimeType: "application/json",
        serviceName: "x402 Crypto Research API",
        tags: ["base", "launch-intelligence", "crypto", "due-diligence", "research", "ai"],
        extensions: declareDiscoveryExtension({
          input: {
            topic: "Which Base projects launched this month and show credible traction?",
          },
          inputSchema: {
            properties: {
              topic: {
                type: "string",
                description: "Base launch, token due-diligence, or crypto intelligence question",
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
              topic: "Which Base projects launched this month and show credible traction?",
              report: "A sourced intelligence report with evidence, risks, exclusions, and a ranked conclusion.",
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
    res.locals.researchCompleted = true;
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
    res.locals.researchCompleted = true;
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
