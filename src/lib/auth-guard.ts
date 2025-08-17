import { NextRequest } from "next/server";
import { getBearerToken } from "./http";
import { verifyAccessToken } from "./jwt";

export function requireAuth(req: NextRequest) {
  const token = getBearerToken(req);
  if (!token) throw new Error("Unauthorized");
  try {
    const payload = verifyAccessToken(token);
    return payload;
  } catch {
    throw new Error("Unauthorized");
  }
}
