import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

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

export function loadServerConfig() {
  const payTo = required("PAY_TO");
  if (!/^0x[a-fA-F0-9]{40}$/.test(payTo)) {
    throw new Error("PAY_TO must be a valid EVM address");
  }

  return {
    openAiApiKey: required("OPENAI_API_KEY"),
    openAiModel: process.env.OPENAI_MODEL?.trim() || "gpt-5.4-mini",
    payTo: payTo as `0x${string}`,
    price: process.env.X402_PRICE?.trim() || "$0.08",
    network: (process.env.X402_NETWORK?.trim() || "eip155:84532") as `${string}:${string}`,
    facilitatorUrl:
      process.env.X402_FACILITATOR_URL?.trim() || "https://x402.org/facilitator",
    port: port(process.env.PORT),
  };
}
