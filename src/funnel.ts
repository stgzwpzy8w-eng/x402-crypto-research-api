import { randomUUID } from "node:crypto";
import type { NextFunction, Request, Response } from "express";

type FunnelEvent =
  | "landing_view"
  | "purchase_attempt"
  | "payment_required"
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

  res.locals.funnelRequestId = requestId;
  res.locals.funnelFlow = flow;
  res.locals.funnelSource = source;
  logFunnelEvent("purchase_attempt", { requestId, flow, source });

  res.once("finish", () => {
    if (res.statusCode === 402) {
      logFunnelEvent("payment_required", { requestId, flow, source });
    } else if (res.statusCode >= 200 && res.statusCode < 300 && res.locals.researchCompleted === true) {
      logFunnelEvent("purchase_completed", { requestId, flow, source });
    }
  });

  next();
};

export const funnelSource = cleanSource;
