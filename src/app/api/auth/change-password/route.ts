import { NextRequest } from "next/server";
import { json } from "@/lib/http";
import { requireAuth } from "@/lib/auth-guard";
import { supabaseServer } from "@/lib/supabase-server";
import { verifyPassword, hashPassword } from "@/lib/hash";

export async function POST(req: NextRequest) {
  try {
    const { userId } = requireAuth(req);
    const { oldPassword, newPassword } = await req.json();

    const { data: user, error } = await supabaseServer
      .from("users")
      .select("password_hash")
      .eq("id", userId)
      .single();

    if (error || !user) {
      return json({ error: "User not found" }, 404);
    }

    const ok = await verifyPassword(oldPassword, user.password_hash);
    if (!ok) {
      return json({ error: "Old password incorrect" }, 400);
    }

    const newHash = await hashPassword(newPassword);
    await supabaseServer
      .from("users")
      .update({ password_hash: newHash })
      .eq("id", userId);

    return json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Bad Request";
    return json({ error: message }, 400);
  }
}
