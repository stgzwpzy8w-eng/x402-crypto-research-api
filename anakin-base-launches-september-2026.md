# Base launches with more than $10,000 in September 2026 DEX volume

**Research date:** 14 September 2026  
**Question:** Which new projects launched this month and have already generated more than $10,000 in transaction volume?  
**Scope used:** Projects or tokens launched on Base during September 2026. “Volume” means executed DEX trading volume, not transfers, TVL, revenue, or market capitalization.

## Executive conclusion

Two launches clearly meet the test with strong evidence: **LAPTOP** and **SPCXc**. **BitTorture / FIN** is a probable third match, but its launch evidence and market data are less independently verified. Several pools exceed the volume threshold but should not be described as verified project launches. In particular, the Base token using the **STONKFLY** name appears unrelated to the original open-source Stonkfly developer.

This screen identifies activity, not quality. LAPTOP has the highest observed volume, but also the worst concentration and launch-trading risk. SPCXc has the strongest issuer provenance, but fragmented liquidity and tokenized-equity/compliance risks. None of the candidates should be treated as a recommendation to buy.

## Method

A candidate qualified only when:

1. A project or its official token became publicly tradable on Base between 1 and 14 September 2026.
2. At least one source showed more than $10,000 of executed DEX volume.
3. The token contract or pool could be distinguished from obvious ticker copies.

Confidence levels:

- **Confirmed:** launch timing, identity and volume supported by multiple or detailed sources.
- **Probable:** volume and a contemporaneous project identity exist, but independent launch verification is incomplete.
- **Excluded:** volume exists, but project identity, official affiliation or launch date cannot be established.

## Ranked results

### 1. SPCXc — strongest verified product launch

- **What it is:** Coinbase’s tokenized representation of SpaceX stock on Base.
- **Token contract:** `0xb2000000000000000000007b9fcbd005511aCBd5`
- **Primary observed pool:** `0x0bf58fe0FAc935Ac69595c19B12Ba0d75E3F8c0E` (SPCXc/USDC)
- **Launch window:** 4 September 2026.
- **Volume evidence:** approximately $6.6 million was reported by 12 September. A 9 September pool snapshot showed roughly $2.95 million of 24-hour volume across 7,948 transactions.
- **Liquidity evidence:** the same 9 September snapshot showed about $688,501 TVL. Other pools were much smaller, demonstrating liquidity fragmentation.
- **Why it ranks first:** clear issuer provenance, a specific contract, repeatable onchain markets and volume far above the threshold.
- **Key risks:** tokenized private-equity exposure is not equivalent to holding SpaceX shares directly; transfer/compliance rules may apply; liquidity is split across pools; a separate Uniswap pool had a low security score and under $10,000 liquidity in one snapshot.
- **Verdict:** **Confirmed match; highest confidence, medium market-structure risk.**

### 2. LAPTOP — largest volume, highest launch risk

- **What it is:** Hunter Biden’s LAPTOP token, opened for trading on Base.
- **Official main pool used in the market screen:** LAPTOP/USDC on Aerodrome. Buyers must verify the contract through the issuer because numerous counterfeit pools appeared before launch.
- **Trading opened:** 9 September 2026 at 12:02:45 UTC.
- **Volume evidence:** $2.08 million entered the Aerodrome pool in the first minute and $4.56 million in five minutes. Across eleven Base pools, six-hour DEX volume was approximately **$33.9 million**.
- **Participation:** 15,022 buying wallets appeared in the first hour, falling to 320 by hour six.
- **Concentration:** nine addresses controlled **96.3% of supply** at the end of the analysed window. Wallets below 10,000 tokens collectively held only 0.18%.
- **Trading quality:** 79.5% of sub-100-swap buyers were underwater at the $1.71 mark; the top twenty profitable wallets captured 61% of realised gains. The price fell 99.3% from the early high within roughly two hours.
- **Control risk:** the allocation wallets shared a two-of-three signer set, while the claims contract had a single owner with upgrade and pause powers.
- **Why it ranks second:** overwhelming evidence that it exceeds the volume threshold, but volume was dominated by a highly unstable launch with extreme concentration, bots/market making and early-wallet advantage.
- **Verdict:** **Confirmed match; very high risk. High volume should not be interpreted as healthy adoption.**

### 3. BitTorture / FIN — promising candidate, incomplete verification

- **What it claims to be:** a TAO-paired “decentralized cognitive experience” using a simulated fly nervous system.
- **Claimed contract:** `0x4f2f56338d14bd5d424c6428ddd0c93fc3f9aba3`
- **Launch evidence:** the project’s social account was created in September 2026 and introduced FIN during the research window.
- **Market evidence:** a Base market snapshot showed roughly $294,000 of 24-hour volume, about $94,000 of liquidity and 1,055 transactions for FIN/TAO.
- **Why confidence is lower:** most identity and launch evidence comes from the project’s own new social presence, and the market snapshot is point-in-time. Holder distribution and deployer flows were not independently verified.
- **Verdict:** **Probable match; do not upgrade to confirmed until the deployer, launch transaction and holder concentration are checked onchain.**

## Excluded or unresolved candidates

### STONKFLY — excluded for false-affiliation risk

The Base pool showed volume far above $10,000, but a forensic review found that the Base STONKFLY token was unrelated to Alex Wormuth’s original open-source Stonkfly project. The token reportedly linked to the developer’s repository despite the developer never issuing or endorsing a token. This is precisely why pool age and volume alone are insufficient.

### ChipWorks / CHIP — unresolved

A fresh Base pool showed more than $600,000 of 24-hour volume and roughly $206,000 of liquidity. No sufficiently strong independent evidence tied the pool to a verified project launch during this review. It remains a market candidate, not a confirmed project.

### Other fresh pools

DESKTOP, IPOD and similar pools crossed $10,000 in recent volume, but the available evidence was insufficient to establish an official project identity and September launch. They were excluded rather than padded into the result set.

## What the raw volume number hides

- **Volume can be circular:** bots, market makers and the same wallets can create large turnover without durable demand.
- **Liquidity matters:** a token with $300,000 volume and $20,000 liquidity behaves very differently from one with comparable volume and deep liquidity.
- **Identity matters:** anyone can copy a ticker or link to somebody else’s website or GitHub repository.
- **Distribution matters:** LAPTOP’s 96.3% concentration in nine addresses is more decision-relevant than merely clearing a $10,000 volume threshold.
- **Time windows matter:** “24-hour volume” is a rolling snapshot, while cumulative September volume requires historical swaps. Values above are labelled by the window the source actually measured.

## Practical answer

If the goal is to find newly launched Base projects worth further investigation rather than merely tokens with activity:

1. **Investigate SPCXc first** for a legitimate, issuer-backed product with substantial trading.
2. **Treat LAPTOP as a launch-forensics case, not a clean adoption signal.** Its volume is real, but concentration and early trading mechanics dominate the risk profile.
3. **Keep FIN on a watchlist** until deployer history, holder concentration and liquidity ownership are verified.
4. **Reject STONKFLY as an official-project match** unless the original developer publicly verifies the token contract.

## Sources and evidence trail

- Sam Town, detailed LAPTOP onchain teardown: https://samuel.town/blog/laptop-token-teardown
- Dexscreener Base market screen: https://dexscreener.com/base
- SPCXc/USDC pool snapshot: https://whattofarm.io/id/pairs/0x0bf58fe0FAc935Ac69595c19B12Ba0d75E3F8c0E
- SPCXc liquidity-fragmentation review: https://www.signaetstructura.com/en/research/spcxc-uniswap-v4-fee-fragmentation-base/
- SPCXc Uniswap V4 pool data: https://www.geckoterminal.com/base/pools/0x2f3e2834ad7199392a6c803c87a60463be06169b3e5fc0bee931bb49032bc390
- BitTorture project-profile archive: https://www.sotwe.com/BitTorture
- Stonkfly identity/copy-token investigation: https://recodex.ai/post/web3-core/652521.html

## Limitations

This is a time-bounded open-source review, not an audit. DEX snapshots change continuously. “Confirmed” means the launch and threshold were evidenced, not that the asset is safe. Contract bytecode, deployer funding, liquidity locks, complete holder tables and wash-trading detection should be obtained directly from chain data before making a financial decision.
