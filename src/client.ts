import dotenv from "dotenv";
import { ExactEvmScheme } from "@x402/evm/exact/client";
import { wrapFetchWithPayment, x402Client } from "@x402/fetch";
import { privateKeyToAccount } from "viem/accounts";

dotenv.config({ path: ".env.local" });
dotenv.config();

const privateKey = process.env.EVM_PRIVATE_KEY as `0x${string}` | undefined;
if (!privateKey) throw new Error("Missing EVM_PRIVATE_KEY");

const topic = process.argv.slice(2).join(" ").trim() || "What changed in the Solana ecosystem this week?";
const url = process.env.API_URL?.trim() || "http://localhost:4021/research";
const parsedUrl = new URL(url);
if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
  throw new Error("API_URL must use http:// or https://");
}

const client = new x402Client();
client.register("eip155:*", new ExactEvmScheme(privateKeyToAccount(privateKey)));

const fetchWithPayment = wrapFetchWithPayment(fetch, client);
const response = await fetchWithPayment(url, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ topic }),
});

const responseText = await response.text();
if (responseText) {
  try {
    console.log(JSON.stringify(JSON.parse(responseText), null, 2));
  } catch {
    console.log(responseText);
  }
}

const paymentSettled = response.headers.has("PAYMENT-RESPONSE");
if (paymentSettled) {
  console.log("Payment settled successfully.");
} else {
  console.error(`Payment was not settled (HTTP ${response.status}).`);
  if (response.status === 402) {
    console.error(
      "The buyer wallet may not have enough USDC on the network required by the API.",
    );
  }
}

if (!response.ok) process.exitCode = 1;
