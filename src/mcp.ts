import type { Request, Response } from "express";
import type { loadServerConfig } from "./config.js";

type ServerConfig = ReturnType<typeof loadServerConfig>;

type JsonRpcRequest = {
  jsonrpc?: string;
  id?: string | number | null;
  method?: string;
  params?: {
    name?: string;
    arguments?: { topic?: unknown };
  };
};

const protocolVersion = "2025-03-26";

function tool(config: ServerConfig) {
  return {
    name: "prepare_crypto_research_purchase",
    description:
      `Prepare a current, sourced crypto research request costing ${config.price} USDC on Base. ` +
      "The returned endpoint uses x402; a compatible buyer client signs the payment locally.",
    inputSchema: {
      type: "object",
      properties: {
        topic: {
          type: "string",
          minLength: 3,
          maxLength: 500,
          description: "The crypto ecosystem, protocol, token, market, or security question to research",
        },
      },
      required: ["topic"],
      additionalProperties: false,
    },
  };
}

export function createMcpServerCard(config: ServerConfig) {
  return {
    serverInfo: { name: "x402 Crypto Research API", version: "0.1.0" },
    authentication: { required: false, schemes: [] },
    tools: [tool(config)],
    resources: [],
    prompts: [],
  };
}

export function createMcpHandler(config: ServerConfig) {
  return (req: Request, res: Response) => {
    const message = req.body as JsonRpcRequest;
    const id = message?.id ?? null;

    if (message?.jsonrpc !== "2.0" || !message.method) {
      res.status(400).json({
        jsonrpc: "2.0",
        id,
        error: { code: -32600, message: "Invalid JSON-RPC request" },
      });
      return;
    }

    if (message.method === "notifications/initialized") {
      res.status(202).end();
      return;
    }

    if (message.method === "initialize") {
      res.json({
        jsonrpc: "2.0",
        id,
        result: {
          protocolVersion,
          capabilities: { tools: { listChanged: false } },
          serverInfo: { name: "x402 Crypto Research API", version: "0.1.0" },
          instructions:
            "Use prepare_crypto_research_purchase to obtain the x402 endpoint and exact paid request for a crypto topic.",
        },
      });
      return;
    }

    if (message.method === "tools/list") {
      res.json({ jsonrpc: "2.0", id, result: { tools: [tool(config)] } });
      return;
    }

    if (message.method === "tools/call") {
      if (message.params?.name !== "prepare_crypto_research_purchase") {
        res.json({
          jsonrpc: "2.0",
          id,
          error: { code: -32602, message: "Unknown tool" },
        });
        return;
      }

      const topic = message.params.arguments?.topic;
      if (typeof topic !== "string" || topic.trim().length < 3 || topic.trim().length > 500) {
        res.json({
          jsonrpc: "2.0",
          id,
          result: {
            isError: true,
            content: [{ type: "text", text: "topic must contain between 3 and 500 characters" }],
          },
        });
        return;
      }

      const purchase = {
        endpoint: "https://x402-crypto-research-api-production.up.railway.app/research",
        method: "POST",
        headers: { "content-type": "application/json" },
        body: { topic: topic.trim() },
        price: config.price,
        currency: "USDC",
        network: config.network,
        paymentProtocol: "x402",
        note: "Use an x402-compatible HTTP client. The buyer signs locally; never send a private key to this server or Smithery.",
      };

      res.json({
        jsonrpc: "2.0",
        id,
        result: {
          content: [{ type: "text", text: JSON.stringify(purchase, null, 2) }],
          structuredContent: purchase,
        },
      });
      return;
    }

    res.json({
      jsonrpc: "2.0",
      id,
      error: { code: -32601, message: "Method not found" },
    });
  };
}
