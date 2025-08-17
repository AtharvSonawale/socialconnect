import { NextRequest } from "next/server";
import { json } from "@/lib/http";
import { supabaseServer } from "@/lib/supabase-server";
import { requireAuth } from "@/lib/auth-guard";

export async function GET(req: NextRequest) {
  const { role } = requireAuth(req);
  if (role !== "Admin") return json({ error: "Forbidden" }, 403);

  const { data, error } = await supabaseServer
    .from("users")
    .select(
      "id, email, username, first_name, last_name, role, created_at, last_login"
    )
    .order("created_at", { ascending: false });
  if (error) return json({ error: error.message }, 400);
  return json({ users: data || [] });
}
