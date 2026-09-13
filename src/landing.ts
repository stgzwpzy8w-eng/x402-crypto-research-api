type LandingConfig = {
  price: string;
  network: string;
  payTo: string;
};

const escapeHtml = (value: string) =>
  value.replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
      })[character] ?? character,
  );

export const renderLandingPage = ({ price, network, payTo }: LandingConfig) => {
  const safePrice = escapeHtml(price);
  const safeNetwork = escapeHtml(network);
  const safePayTo = escapeHtml(payTo);
  const paymentNotice = network === "eip155:8453"
    ? "Mainnet service; payments use real USDC on Base."
    : "Testnet service; test USDC has no real-world value.";

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>x402 Crypto Research API</title>
    <style>
      :root { color-scheme: dark; font-family: Inter, ui-sans-serif, system-ui, sans-serif; }
      * { box-sizing: border-box; }
      body { margin: 0; min-height: 100vh; background: #07110d; color: #e8fff4; }
      main { width: min(880px, calc(100% - 32px)); margin: 0 auto; padding: 72px 0; }
      .eyebrow { color: #73f7b1; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; }
      h1 { max-width: 720px; margin: 14px 0 18px; font-size: clamp(2.5rem, 7vw, 5.5rem); line-height: .98; }
      .lead { max-width: 660px; color: #a8c7b8; font-size: 1.2rem; line-height: 1.6; }
      .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 14px; margin: 36px 0; }
      .card, pre { border: 1px solid #214634; background: #0c1b14; border-radius: 16px; }
      .card { padding: 20px; }
      .step { padding: 20px; border-left: 3px solid #52ed9b; }
      .label { color: #77a88f; font-size: .8rem; text-transform: uppercase; letter-spacing: .08em; }
      .value { margin-top: 8px; font-size: 1.05rem; overflow-wrap: anywhere; }
      h2 { margin-top: 48px; }
      h3 { margin: 0 0 8px; }
      p { line-height: 1.6; }
      pre { padding: 20px; overflow-x: auto; color: #bdfbd9; line-height: 1.5; }
      code { font-family: "SFMono-Regular", Consolas, monospace; }
      a { color: #73f7b1; }
      .warning { padding: 16px 18px; border: 1px solid #725b24; border-radius: 12px; background: #211b0d; color: #ffe3a0; }
      .status { display: inline-flex; align-items: center; gap: 8px; color: #a8c7b8; }
      .dot { width: 9px; height: 9px; border-radius: 50%; background: #52ed9b; box-shadow: 0 0 18px #52ed9b; }
      footer { margin-top: 52px; color: #77a88f; }
    </style>
  </head>
  <body>
    <main>
      <div class="eyebrow">Pay per request with USDC</div>
      <h1>Current crypto research for humans and agents.</h1>
      <p class="lead">Send one topic to the API. x402 handles payment before a sourced, up-to-date research report is generated.</p>

      <div class="grid">
        <div class="card"><div class="label">Endpoint</div><div class="value"><code>POST /research</code></div></div>
        <div class="card"><div class="label">Price</div><div class="value">${safePrice} USDC</div></div>
        <div class="card"><div class="label">Network</div><div class="value"><code>${safeNetwork}</code></div></div>
      </div>

      <h2>Request body</h2>
      <pre><code>{
  "topic": "What changed in the Solana ecosystem this week?"
}</code></pre>

      <h2>Response</h2>
      <pre><code>{
  "topic": "...",
  "report": "...",
  "sources": [{ "title": "...", "url": "..." }],
  "researchedAt": "..."
}</code></pre>

      <h2>Buy one report</h2>
      <p>The payment is signed locally by the buyer client. This website never asks for a private key.</p>
      <div class="grid">
        <div class="card step"><h3>1. Get the client</h3><p>Clone the <a href="https://github.com/stgzwpzy8w-eng/x402-crypto-research-api">GitHub repository</a> and run <code>pnpm install</code>.</p></div>
        <div class="card step"><h3>2. Prepare a wallet</h3><p>Use a dedicated low-balance wallet with at least ${safePrice} USDC on Base.</p></div>
        <div class="card step"><h3>3. Request research</h3><p>Save the two values below in <code>.env.local</code>, then run the client command.</p></div>
      </div>

      <pre><code>EVM_PRIVATE_KEY=0xYOUR_DEDICATED_BUYER_WALLET_PRIVATE_KEY
API_URL=https://x402-crypto-research-api-production.up.railway.app/research</code></pre>
      <pre><code>pnpm client "Give a concise current status update on the Base ecosystem."</code></pre>
      <p class="warning">Mainnet purchase: ${safePrice} USDC is real money. Never paste a private key into this website, a chat, GitHub, or Railway.</p>

      <p class="status"><span class="dot"></span> Service online</p>
      <footer>Payments are sent to <code>${safePayTo}</code>. ${paymentNotice}</footer>
    </main>
  </body>
</html>`;
};
