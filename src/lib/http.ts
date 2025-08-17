import { NextRequest, NextResponse } from "next/server";

/**
 * Returns a typed JSON response.
 * @param data - The data to return in the response.
 * @param init - Either the status code or NextResponseInit object.
 */
export function json<T>(data: T, init?: number | ResponseInit) {
  if (typeof init === "number") {
    return NextResponse.json(data, { status: init });
  }
  return NextResponse.json(data, init);
}

/**
 * Extracts the bearer token from the Authorization header.
 * @param req - The incoming Next.js request.
 * @returns The token string or null if not found.
 */
export function getBearerToken(req: NextRequest): string | null {
  const auth = req.headers.get("authorization") ?? "";
  const [, token] = auth.split(" ");
  return token || null;
}
