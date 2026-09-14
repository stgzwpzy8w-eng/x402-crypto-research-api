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

const cleanSource = (value: unknown) => {
  if (typeof value !== "string") return "direct";
  const source = value.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "").slice(0, 40);
  return source || "direct";
};

export const logFunnelEvent = (
  event: FunnelEvent,
  details: Record<string, string | number> = {},
) => {
  console.log(JSON.stringify({ type: "funnel", event, at: new Date().toISOString(), ...details }));
};

export const trackPaidRequest = (req: Request, res: Response, next: NextFunction) => {
  if (!((req.method === "GET" && req.path === "/buy") ||
        (req.method === "POST" && req.path === "/research"))) {
    next();
    return;
  }

  const requestId = randomUUID();
  const flow = req.path === "/buy" ? "human" : "agent";
  const source = cleanSource(req.query.ref);
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
