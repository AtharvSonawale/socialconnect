import { NextRequest } from "next/server";
import { json } from "@/lib/http";
import { supabaseServer } from "@/lib/supabase-server";
import { requireAuth } from "@/lib/auth-guard";

export async function DELETE(req: NextRequest) {
  try {
    const { role } = requireAuth(req);
    if (role !== "Admin") return json({ error: "Forbidden" }, 403);

    // Extract postId from URL
    const url = new URL(req.url);
    const segments = url.pathname.split("/"); // ["", "api", "admin", "posts", "<postId>"]
    const postId = segments.at(-1);
    if (!postId) return json({ error: "Post ID is required" }, 400);

    const { error } = await supabaseServer
      .from("posts")
      .delete()
      .eq("id", postId);
    if (error) return json({ error: error.message }, 400);

    return json({ ok: true });
  } catch (e: unknown) {
    if (e instanceof Error) return json({ error: e.message }, 500);
    return json({ error: "Unknown error" }, 500);
  }
}
