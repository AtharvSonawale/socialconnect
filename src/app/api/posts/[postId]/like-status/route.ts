import { NextRequest } from "next/server";
import { json } from "@/lib/http";
import { requireAuth } from "@/lib/auth-guard";
import { supabaseServer } from "@/lib/supabase-server";

export async function GET(req: NextRequest) {
  try {
    // Authenticated user
    const { userId } = requireAuth(req);

    // Extract postId from URL: /api/posts/[postId]/like-status
    const segments = new URL(req.url).pathname.split("/");
    const postId = segments[segments.indexOf("posts") + 1];
    if (!postId) return json({ error: "Post ID required" }, 400);

    // Check if user liked the post
    const { data, error } = await supabaseServer
      .from("likes")
      .select("id")
      .eq("user_id", userId)
      .eq("post_id", postId)
      .maybeSingle();

    if (error) return json({ error: error.message }, 500);

    return json({ liked: !!data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unauthorized";
    return json({ liked: false, error: message }, 401);
  }
}
