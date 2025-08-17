import { NextRequest } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import { json } from "@/lib/http";
import { loginSchema } from "@/lib/validators";
import { verifyPassword } from "@/lib/hash";
import { signAccessToken, signRefreshToken } from "@/lib/jwt";
import { addSeconds } from "date-fns";
import { randomUUID } from "crypto";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { identifier, password } = loginSchema.parse(body);

    const query = identifier.includes("@")
      ? supabaseServer
          .from("users")
          .select("*")
          .eq("email", identifier)
          .maybeSingle()
      : supabaseServer
          .from("users")
          .select("*")
          .eq("username", identifier)
          .maybeSingle();

    const { data: user } = await query;
    if (!user) return json({ error: "Invalid credentials" }, 401);

    const ok = await verifyPassword(password, user.password_hash);
    if (!ok) return json({ error: "Invalid credentials" }, 401);

    const payload = {
      userId: user.id,
      role: (user.role === "Admin" ? "Admin" : "User") as "User" | "Admin",
    };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    const expiresAt = addSeconds(
      new Date(),
      Number(process.env.JWT_REFRESH_EXPIRES_IN || 1209600)
    );

    await supabaseServer.from("refresh_tokens").insert({
      id: randomUUID(),
      user_id: user.id,
      token: refreshToken,
      expires_at: expiresAt.toISOString(),
    });

    await supabaseServer
      .from("users")
      .update({ last_login: new Date().toISOString() })
      .eq("id", user.id);

    const profile = {
      id: user.id,
      email: user.email,
      username: user.username,
      first_name: user.first_name,
      last_name: user.last_name,
      avatar_url: user.avatar_url,
      website: user.website,
      location: user.location,
      role: user.role,
      profile_visibility: user.profile_visibility,
    };

    return json({ accessToken, refreshToken, user: profile });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Bad Request";
    return json({ error: message }, 400);
  }
}
