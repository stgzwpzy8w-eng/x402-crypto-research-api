type LandingConfig = {
  price: string;
  network: string;
  payTo: string;
};

type ResearchResult = {
  topic: string;
  report: string;
  sources: Array<{ title: string; url: string }>;
  researchedAt: string;
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
      .report { margin: 28px 0; padding: 26px; border: 1px solid #2b694a; background: linear-gradient(145deg, #0e2118, #0a1711); border-radius: 18px; }
      .report-header { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 12px; padding-bottom: 18px; border-bottom: 1px solid #214634; }
      .report-title { margin: 4px 0 0; font-size: 1.35rem; }
      .badge { align-self: flex-start; padding: 6px 10px; border-radius: 999px; color: #07110d; background: #73f7b1; font-size: .78rem; font-weight: 800; }
      .finding { margin: 18px 0 0; padding-left: 18px; border-left: 2px solid #52ed9b; }
      .finding strong { display: block; margin-bottom: 4px; color: #e8fff4; }
      .muted { color: #77a88f; }
      .step { padding: 20px; border-left: 3px solid #52ed9b; }
      .label { color: #77a88f; font-size: .8rem; text-transform: uppercase; letter-spacing: .08em; }
      .value { margin-top: 8px; font-size: 1.05rem; overflow-wrap: anywhere; }
      h2 { margin-top: 48px; }
      h3 { margin: 0 0 8px; }
      p { line-height: 1.6; }
      pre { padding: 20px; overflow-x: auto; color: #bdfbd9; line-height: 1.5; }
      code { font-family: "SFMono-Regular", Consolas, monospace; }
      a { color: #73f7b1; }
      .actions { display: flex; flex-wrap: wrap; gap: 12px; margin: 28px 0 8px; }
      .button { display: inline-block; padding: 12px 16px; border: 1px solid #52ed9b; border-radius: 10px; color: #07110d; background: #73f7b1; font-weight: 750; text-decoration: none; }
      .button.secondary { color: #bdfbd9; background: transparent; border-color: #2b694a; }
      button.button { cursor: pointer; font: inherit; }
      .demo-form { display: flex; gap: 10px; margin: 20px 0; }
      .demo-input { flex: 1; min-width: 0; padding: 13px 14px; border: 1px solid #2b694a; border-radius: 10px; background: #07110d; color: #e8fff4; font: inherit; }
      .demo-input:focus { outline: 2px solid #52ed9b; outline-offset: 2px; }
      .purchase { margin: 28px 0 20px; padding: 28px; border: 1px solid #d3a93a; border-radius: 18px; background: linear-gradient(145deg, #211b0d, #12170f); box-shadow: 0 18px 55px rgba(0,0,0,.28); }
      .purchase h2 { margin: 6px 0 8px; font-size: clamp(1.7rem, 4vw, 2.35rem); }
      .purchase-top { display: flex; flex-wrap: wrap; align-items: flex-start; justify-content: space-between; gap: 14px; }
      .price-pill { padding: 9px 12px; border-radius: 999px; background: #ffe39a; color: #241b05; font-weight: 850; white-space: nowrap; }
      .purchase .demo-form { margin-bottom: 12px; }
      .purchase .button { padding-inline: 22px; }
      @media (max-width: 620px) { .demo-form { flex-direction: column; } }
      .links { display: flex; flex-wrap: wrap; gap: 18px; padding: 0; list-style: none; }
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

      <section class="purchase" id="buy">
        <div class="purchase-top">
          <div>
            <div class="eyebrow">Live paid research</div>
            <h2>Get a current research report</h2>
          </div>
          <div class="price-pill">${safePrice} USDC</div>
        </div>
        <p>Type what you want researched. You will see the secure wallet payment screen before anything is charged.</p>
        <form class="demo-form" action="/buy" method="get">
          <input class="demo-input" name="topic" type="text" minlength="3" maxlength="500" required placeholder="Example: What changed on Base this week?" aria-label="Paid research topic" />
          <button class="button" type="submit">Buy report</button>
        </form>
        <p class="muted">Introductory price for the first three external buyers · real USDC on Base · report opens here after payment.</p>
      </section>

      <div class="actions">
        <a class="button secondary" href="#free-demo">See free preview first</a>
        <a class="button secondary" href="#agent-quickstart">Agent quickstart</a>
      </div>

      <div class="grid">
        <div class="card"><div class="label">Endpoint</div><div class="value"><code>POST /research</code></div></div>
        <div class="card"><div class="label">Price</div><div class="value">${safePrice} USDC</div></div>
        <div class="card"><div class="label">Network</div><div class="value"><code>${safeNetwork}</code></div></div>
      </div>

      <h2>Example request body <span class="muted">(for API clients)</span></h2>
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

      <h2 id="free-demo">Try the free preview</h2>
      <p>Enter a topic to preview the report format. This free preview is illustrative and does not perform live research or charge a wallet.</p>
      <form class="demo-form" id="demo-form">
        <input class="demo-input" id="demo-topic" name="topic" type="text" minlength="3" maxlength="500" required value="What changed in the Base ecosystem this week?" aria-label="Research topic" />
        <button class="button" type="submit">Generate preview</button>
      </form>
      <article class="report">
        <div class="report-header">
          <div>
            <div class="label">Free static preview</div>
            <h3 class="report-title" id="preview-topic">What changed in the Base ecosystem this week?</h3>
          </div>
          <span class="badge">Sources included</span>
        </div>
        <p><strong>Short summary:</strong> Recent ecosystem activity is organized into the developments most relevant to builders, users, and agent operators.</p>
        <div class="finding"><strong>1. Key ecosystem development</strong><span class="muted">What happened, why it matters, and the date it was reported.</span></div>
        <div class="finding"><strong>2. Adoption or infrastructure signal</strong><span class="muted">A concise explanation backed by a direct source link.</span></div>
        <div class="finding"><strong>3. Risks and uncertainty</strong><span class="muted">Clear separation between confirmed facts, reported claims, and inference.</span></div>
        <p><strong>Sources:</strong> Direct links to the official announcements and other relevant primary material.</p>
      </article>

      <p class="muted">Building an agent? Open the <a href="/demo">raw JSON demo response</a> instead.</p>

      <h2 id="agent-quickstart">Agent quickstart</h2>
      <p>Any Node.js agent can use an x402-compatible fetch client. The client handles the payment challenge and retries the request automatically.</p>
      <pre><code>npm install @x402/fetch @x402/evm viem

import { ExactEvmScheme } from "@x402/evm/exact/client";
import { wrapFetchWithPayment, x402Client } from "@x402/fetch";
import { privateKeyToAccount } from "viem/accounts";

const client = new x402Client();
client.register("eip155:*", new ExactEvmScheme(
  privateKeyToAccount(process.env.EVM_PRIVATE_KEY)
));

const paidFetch = wrapFetchWithPayment(fetch, client);
const response = await paidFetch(
  "https://x402-crypto-research-api-production.up.railway.app/research",
  {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ topic: "What changed on Base this week?" })
  }
);
const report = await response.json();</code></pre>
      <p class="warning">Keep <code>EVM_PRIVATE_KEY</code> in the agent's secret store and use a dedicated low-balance wallet.</p>

      <h2>Machine-readable documentation</h2>
      <ul class="links">
        <li><a href="/openapi.json">OpenAPI specification</a></li>
        <li><a href="/.well-known/x402">x402 discovery manifest</a></li>
        <li><a href="/skill.md">Agent skill instructions</a></li>
        <li><a href="/llms.txt">LLM integration guide</a></li>
        <li><a href="/health">Service health</a></li>
        <li><a href="https://github.com/stgzwpzy8w-eng/x402-crypto-research-api">GitHub source and client</a></li>
      </ul>

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
    <script>
      const demoForm = document.getElementById("demo-form");
      const demoTopic = document.getElementById("demo-topic");
      const previewTopic = document.getElementById("preview-topic");
      demoForm.addEventListener("submit", (event) => {
        event.preventDefault();
        previewTopic.textContent = demoTopic.value.trim();
        previewTopic.scrollIntoView({ behavior: "smooth", block: "center" });
      });
    </script>
  </body>
</html>`;
};

export const renderResearchResultPage = (result: ResearchResult) => {
  const sources = result.sources
    .map(({ title, url }) => `<li><a href="${escapeHtml(url)}" rel="noreferrer">${escapeHtml(title)}</a></li>`)
    .join("");

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Research report | x402 Crypto Research API</title>
    <style>
      :root { color-scheme: dark; font-family: Inter, ui-sans-serif, system-ui, sans-serif; }
      body { margin: 0; background: #07110d; color: #e8fff4; }
      main { width: min(820px, calc(100% - 32px)); margin: 0 auto; padding: 56px 0; }
      a { color: #73f7b1; } h1 { line-height: 1.15; } p { line-height: 1.65; }
      .eyebrow { color: #73f7b1; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; }
      .report { white-space: pre-wrap; padding: 24px; border: 1px solid #2b694a; border-radius: 16px; background: #0c1b14; line-height: 1.65; }
      .meta { color: #77a88f; } li { margin: 10px 0; }
    </style>
  </head>
  <body>
    <main>
      <div class="eyebrow">Payment settled · report ready</div>
      <h1>${escapeHtml(result.topic)}</h1>
      <div class="report">${escapeHtml(result.report)}</div>
      <h2>Sources</h2>
      <ul>${sources}</ul>
      <p class="meta">Researched at ${escapeHtml(result.researchedAt)}</p>
      <p><a href="/">← Research another topic</a></p>
    </main>
  </body>
</html>`;
};
