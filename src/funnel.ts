import { randomUUID } from "node:crypto";
import type { IncomingHttpHeaders } from "node:http";
import type { NextFunction, Request, Response } from "express";

type FunnelEvent =
  | "landing_view"
  | "purchase_attempt"
  | "payment_required"
  | "payment_submitted"
  | "payment_rejected"
  | "purchase_completed";

const funnelEvents: FunnelEvent[] = [
  "landing_view",
  "purchase_attempt",
  "payment_required",
  "payment_submitted",
  "payment_rejected",
  "purchase_completed",
];

type FunnelCounts = Record<FunnelEvent, number>;

const emptyCounts = (): FunnelCounts => Object.fromEntries(
  funnelEvents.map((event) => [event, 0]),
) as FunnelCounts;

const startedAt = new Date().toISOString();
const totals = emptyCounts();
const bySource = new Map<string, FunnelCounts>();

const cleanSource = (value: unknown) => {
  if (typeof value !== "string") return "direct";
  const source = value.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "").slice(0, 40);
  return source || "direct";
};

export const logFunnelEvent = (
  event: FunnelEvent,
  details: Record<string, string | number> = {},
) => {
  totals[event] += 1;
  const source = cleanSource(details.source);
  const sourceCounts = bySource.get(source) ?? emptyCounts();
  sourceCounts[event] += 1;
  bySource.set(source, sourceCounts);
  console.log(JSON.stringify({ type: "funnel", event, at: new Date().toISOString(), ...details }));
};

export const getFunnelSnapshot = () => ({
  startedAt,
  generatedAt: new Date().toISOString(),
  totals: { ...totals },
  conversion: {
    landingToAttempt: ratio(totals.purchase_attempt, totals.landing_view),
    submittedToCompleted: ratio(totals.purchase_completed, totals.payment_submitted),
    landingToCompleted: ratio(totals.purchase_completed, totals.landing_view),
  },
  bySource: [...bySource.entries()]
    .map(([source, counts]) => ({ source, ...counts }))
    .sort((left, right) => right.landing_view - left.landing_view),
});

const ratio = (numerator: number, denominator: number) =>
  denominator === 0 ? null : Number((numerator / denominator).toFixed(4));

export const requestSource = (req: Request) => {
  if (typeof req.query.ref === "string" && req.query.ref.trim()) {
    return cleanSource(req.query.ref);
  }

  const referrer = req.get("referer");
  if (!referrer) return "direct";

  try {
    const host = new URL(referrer).hostname.toLowerCase();
    if (host === "t.co" || host.endsWith("x.com")) return "x";
    if (host.endsWith("discord.com")) return "discord";
    if (host.endsWith("smithery.ai")) return "smithery";
    if (host.endsWith("github.com")) return "github";
    if (host.endsWith("x402.org")) return "x402";
  } catch {
    return "direct";
  }

  return "referral";
};

export const trackPaidRequest = (req: Request, res: Response, next: NextFunction) => {
  if (!((req.method === "GET" && req.path === "/buy") ||
        (req.method === "POST" && req.path === "/research"))) {
    next();
    return;
  }

  const requestId = randomUUID();
  const flow = req.path === "/buy" ? "human" : "agent";
  const source = requestSource(req);
  const paymentSubmitted = hasPaymentAuthorization(req.headers);

  res.locals.funnelRequestId = requestId;
  res.locals.funnelFlow = flow;
  res.locals.funnelSource = source;
  logFunnelEvent("purchase_attempt", {
    requestId,
    flow,
    source,
    paymentAuthorization: paymentSubmitted ? "present" : "absent",
  });
  if (paymentSubmitted) {
    logFunnelEvent("payment_submitted", { requestId, flow, source });
  }

  res.once("finish", () => {
    if (res.statusCode === 402) {
      logFunnelEvent(paymentSubmitted ? "payment_rejected" : "payment_required", {
        requestId,
        flow,
        source,
      });
    } else if (res.statusCode >= 200 && res.statusCode < 300 && res.locals.researchCompleted === true) {
      logFunnelEvent("purchase_completed", { requestId, flow, source });
    }
  });

  next();
};

export const funnelSource = cleanSource;

export const hasPaymentAuthorization = (headers: IncomingHttpHeaders) =>
  Boolean(headers["payment-signature"] || headers["x-payment"]);
