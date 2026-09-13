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

const client = new x402Client();
client.register("eip155:*", new ExactEvmScheme(privateKeyToAccount(privateKey)));

const fetchWithPayment = wrapFetchWithPayment(fetch, client);
const response = await fetchWithPayment(url, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ topic }),
});

const body = await response.json();
console.log(JSON.stringify(body, null, 2));
if (response.headers.has("PAYMENT-RESPONSE")) {
  console.log("Payment settled successfully.");
} else {
  console.log("Payment was not settled.");
}

if (!response.ok) process.exitCode = 1;
