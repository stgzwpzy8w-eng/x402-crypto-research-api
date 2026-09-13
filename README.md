# x402 Crypto Research API

Minimal TypeScript-MVP med en enda betald endpoint:

```http
POST /research
Content-Type: application/json

{"topic":"What changed in the Solana ecosystem this week?"}
```

Endpointen kräver en `exact`-betalning i test-USDC via x402 innan OpenAI gör en aktuell webbresearch och returnerar rapporten. Standardnätet är Base Sepolia, så testflödet använder inga riktiga pengar.

Den driftsatta tjänsten finns på [x402-crypto-research-api-production.up.railway.app](https://x402-crypto-research-api-production.up.railway.app). Startsidan visar aktuell pris- och nätverksinformation, och `GET /health` kan användas som enkel statuskontroll.

`POST /research` deklarerar Bazaar-metadata enligt x402 v2 så att kompatibla facilitatorer och klienter kan läsa hur endpointen anropas och vilket svar den ger. Katalogisering beror på facilitatorns stöd och sker normalt i samband med en genomförd betalning.

## Flödet

1. Klienten skickar `POST /research`.
2. Servern svarar `402 Payment Required` med betalningskravet.
3. x402-klienten signerar en USDC-betalning och försöker igen automatiskt.
4. Facilitatorn verifierar och avvecklar betalningen.
5. Först därefter körs researchen och JSON-svaret returneras.

## Krav

- Node.js 22+
- pnpm
- En EVM-adress som tar emot test-USDC
- För det betalda testet: en separat test-wallet med Base Sepolia USDC

Använd aldrig en wallet med riktiga tillgångar i den lokala testkonfigurationen.

## Installation

```powershell
pnpm install
```

Kopiera värdena du behöver från `.env.example` till `.env.local`. OpenAI-nyckeln finns redan i `.env.local` om den skapades via Codex-flödet. Lägg minst till:

```dotenv
PAY_TO=0xDIN_MOTTAGARADRESS
```

Standardinställningarna är:

```dotenv
OPENAI_MODEL=gpt-5.4-mini
X402_PRICE=$0.08
X402_NETWORK=eip155:84532
X402_FACILITATOR_PROVIDER=public
X402_FACILITATOR_URL=https://x402.org/facilitator
ALLOW_MAINNET=false
PORT=4021
```

### Coinbase CDP-facilitator

Coinbase CDP kan användas på Base Sepolia utan att byta till riktiga pengar. Skapa en Secret API Key i CDP-portalen och lägg följande tre variabler i Railway eller `.env.local`:

```dotenv
X402_FACILITATOR_PROVIDER=cdp
CDP_API_KEY_ID=organizations/.../apiKeys/...
CDP_API_KEY_SECRET=din-hemliga-nyckel
```

Använd värdet `name` från den nedladdade JSON-filen som `CDP_API_KEY_ID` och värdet `privateKey` som `CDP_API_KEY_SECRET`. Nycklarna ska aldrig läggas i GitHub eller klistras in i en chatt. `X402_NETWORK=eip155:84532` och `ALLOW_MAINNET=false` ska vara kvar under testningen.

## Kör servern

```powershell
pnpm start
```

`pnpm dev` finns också för automatisk omstart under utveckling.

## Kontrollera 402-svaret utan betalning

I ett andra terminalfönster:

```powershell
curl.exe -i -X POST http://localhost:4021/research `
  -H "Content-Type: application/json" `
  -d '{"topic":"What changed in the Solana ecosystem this week?"}'
```

Du ska få HTTP-status `402` och ett `PAYMENT-REQUIRED`-huvud. Ingen OpenAI-research körs i detta steg.

## Betalt end-to-end-test

1. Skapa en separat test-wallet.
2. Sätt `EVM_PRIVATE_KEY` i `.env.local` till test-walletens privata nyckel.
3. Fyll test-walletens publika adress med Base Sepolia USDC via en faucet.
4. Kör:

```powershell
pnpm client -- "What changed in the Solana ecosystem this week?"
```

Klienten hanterar `402`-utmaningen, betalar `$0.08` test-USDC och skriver sedan ut researchsvaret.

## Tester

```powershell
pnpm test
pnpm typecheck
```

## Svarsexempel

```json
{
  "topic": "What changed in the Solana ecosystem this week?",
  "report": "...",
  "sources": [
    { "title": "Source title", "url": "https://example.com/article" }
  ],
  "researchedAt": "2026-09-13T12:00:00.000Z"
}
```

## Betalningssäkerhet

Den låsta versionen av x402 Express verifierar först betalningsgodkännandet och väntar med att avveckla betalningen tills endpointen har svarat framgångsrikt. Om researchen svarar med `4xx` eller `5xx` avbryts betalningen och klienten skriver `Payment was not settled.` Ett automatiskt test skyddar detta beteende.

## Kostnadsmätning

Efter varje lyckad rapport skriver servern en rad som börjar med `[research-cost]`. Den visar input-token, cachelagrade input-token, output-token, antal webbsökningar och uppskattad kostnad i USD. Ämnet och API-nyckeln loggas inte.

Prisuppskattningen gäller standardpriserna för `gpt-5.4-mini`: $0,75 per miljon input-token, $0,075 per miljon cachelagrade input-token, $4,50 per miljon output-token och $0,01 per webbsökning. Kontrollera alltid aktuella priser före produktion.

Betapriset är `$0.08` USDC. Ett uppmätt test kostade uppskattningsvis `$0.031940`, vilket motsvarar cirka 60 % bruttomarginal före hosting och andra kostnader. Mät fler rapporter innan priset används på mainnet.

## MVP-begränsningar

- Lägg till idempotens, jobbspårning, återförsök och en tydlig återbetalningspolicy före produktion.
- Ingen cache, rate limiting eller databas.
- Base Sepolia och den publika test-facilitatorn är endast avsedda för utveckling. Byt konfiguration och gör en separat säkerhetsgranskning före mainnet.

## Mainnet-spärr

Servern accepterar bara Base Sepolia (`eip155:84532`) och Base mainnet (`eip155:8453`). Mainnet startar inte om inte `ALLOW_MAINNET=true` har satts uttryckligen. Den vägrar också använda den kostnadsfria `x402.org`-facilitatorn på mainnet, eftersom den endast stöder testnät.

Priset måste skrivas som exempelvis `$0.08`, får ha högst sex decimaler och är hårt begränsat till högst `$10` för att minska risken för ett felaktigt miljövärde.

Innan mainnet:

1. Välj och konfigurera en produktionsfacilitator som stöder Base mainnet.
2. Bekräfta mottagaradressen igen och sätt `X402_NETWORK=eip155:8453`.
3. Kör ett kontrollerat köp med en separat wallet och ett litet saldo.
4. Sätt `ALLOW_MAINNET=true` först när punkterna ovan är verifierade.

## Dokumentation

- [x402: Quickstart for Sellers](https://docs.x402.org/getting-started/quickstart-for-sellers)
- [x402: Quickstart for Buyers](https://docs.x402.org/getting-started/quickstart-for-buyers)
- [OpenAI Responses API](https://developers.openai.com/api/reference/typescript/resources/beta/subresources/responses/methods/create)
