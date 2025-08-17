import { NextRequest } from "next/server";
import { json } from "@/lib/http";
import { supabaseServer } from "@/lib/supabase-server";
import { requireAuth } from "@/lib/auth-guard";

export async function GET(req: NextRequest) {
  try {
    const { role } = requireAuth(req);
    if (role !== "Admin") return json({ error: "Forbidden" }, 403);

    const [users, posts, active] = await Promise.all([
      supabaseServer.from("users").select("*", { count: "exact", head: true }),
      supabaseServer.from("posts").select("*", { count: "exact", head: true }),
      supabaseServer.rpc("count_users_active_today"),
    ]);

    return json({
      total_users: users.count || 0,
      total_posts: posts.count || 0,
      active_today: active.data || 0,
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unauthorized";
    return json({ error: message }, 401);
  }
}
