import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

export type FacilitatorProvider = "public" | "cdp";

export const CDP_FACILITATOR_URL = "https://api.cdp.coinbase.com/platform/v2/x402";

function required(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

function port(value: string | undefined): number {
  const parsed = Number(value ?? "4021");
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 65535) {
    throw new Error("PORT must be an integer between 1 and 65535");
  }
  return parsed;
}

export function parseFacilitatorProvider(value: string | undefined): FacilitatorProvider {
  const provider = value?.trim().toLowerCase() || "public";
  if (provider !== "public" && provider !== "cdp") {
    throw new Error("X402_FACILITATOR_PROVIDER must be public or cdp");
  }
  return provider;
}

export function validatePaymentConfig(
  price: string,
  network: string,
  facilitatorUrl: string,
  allowMainnet: boolean,
) {
  if (!/^\$(?:0|[1-9]\d*)(?:\.\d{1,6})?$/.test(price)) {
    throw new Error("X402_PRICE must look like $0.08 and use at most 6 decimal places");
  }

  const numericPrice = Number(price.slice(1));
  if (numericPrice <= 0 || numericPrice > 10) {
    throw new Error("X402_PRICE must be greater than $0 and no more than $10");
  }

  if (network === "eip155:84532") {
    return;
  }

  if (network !== "eip155:8453") {
    throw new Error("X402_NETWORK must be Base Sepolia (eip155:84532) or Base mainnet (eip155:8453)");
  }

  if (!allowMainnet) {
    throw new Error("Base mainnet requires ALLOW_MAINNET=true");
  }

  if (facilitatorUrl.replace(/\/$/, "") === "https://x402.org/facilitator") {
    throw new Error("The x402.org facilitator is testnet-only; configure a production facilitator for mainnet");
  }
}

export function loadServerConfig() {
  const payTo = required("PAY_TO");
  if (!/^0x[a-fA-F0-9]{40}$/.test(payTo)) {
    throw new Error("PAY_TO must be a valid EVM address");
  }

  const price = process.env.X402_PRICE?.trim() || "$0.08";
  const network = process.env.X402_NETWORK?.trim() || "eip155:84532";
  const facilitatorProvider = parseFacilitatorProvider(
    process.env.X402_FACILITATOR_PROVIDER,
  );
  const facilitatorUrl = facilitatorProvider === "cdp"
    ? CDP_FACILITATOR_URL
    : process.env.X402_FACILITATOR_URL?.trim() || "https://x402.org/facilitator";
  const allowMainnet = process.env.ALLOW_MAINNET?.trim().toLowerCase() === "true";

  validatePaymentConfig(price, network, facilitatorUrl, allowMainnet);

  const common = {
    openAiApiKey: required("OPENAI_API_KEY"),
    openAiModel: process.env.OPENAI_MODEL?.trim() || "gpt-5.4-mini",
    payTo: payTo as `0x${string}`,
    price,
    network: network as `${string}:${string}`,
    allowMainnet,
    port: port(process.env.PORT),
  };

  if (facilitatorProvider === "cdp") {
    return {
      ...common,
      facilitatorProvider,
      facilitatorUrl,
      cdpApiKeyId: required("CDP_API_KEY_ID"),
      cdpApiKeySecret: required("CDP_API_KEY_SECRET"),
    };
  }

  return {
    ...common,
    facilitatorProvider,
    facilitatorUrl,
  };
}
