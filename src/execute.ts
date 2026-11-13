import type { PayloadBuilderResponse } from "./types.js";

export class PayWayAPIError extends Error {
  constructor(public readonly status: number, public readonly statusText: string, public readonly body: unknown) {
    super(`PayWay API Error: ${status} ${statusText}`);
    this.name = "PayWayAPIError";
  }
}

export async function execute<T>(payload: PayloadBuilderResponse<T>): Promise<T> {
  const response = await fetch(payload.url, {
    method: payload.method,
    headers: payload.headers,
    body: JSON.stringify(payload.body),
  });
  const text = await response.text();
  let body: unknown;
  try { body = JSON.parse(text); } catch { body = text; }
  if (!response.ok) throw new PayWayAPIError(response.status, response.statusText, body);
  if (typeof body === "string") throw new Error("PayWay returned a non-JSON response");
  return body as T;
}
