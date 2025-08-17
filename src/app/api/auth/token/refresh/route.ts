import { NextRequest } from "next/server";
import { json } from "@/lib/http";
import { verifyRefreshToken, signAccessToken } from "@/lib/jwt";
import { supabaseServer } from "@/lib/supabase-server";

export async function POST(req: NextRequest) {
  try {
    const { refreshToken } = (await req.json()) as { refreshToken: string };
    if (!refreshToken) return json({ error: "Missing token" }, 400);

    const payload = verifyRefreshToken(refreshToken);
    const { data: row } = await supabaseServer
      .from("refresh_tokens")
      .select("id, user_id, blacklisted, expires_at")
      .eq("token", refreshToken)
      .maybeSingle();

    if (!row || row.blacklisted || new Date(row.expires_at) < new Date())
      return json({ error: "Invalid token" }, 401);

    const accessToken = signAccessToken({
      userId: payload.userId,
      role: payload.role,
    });
    return json({ accessToken });
  } catch {
    return json({ error: "Invalid token" }, 401);
  }
}
