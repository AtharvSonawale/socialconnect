import { NextRequest } from "next/server";
import { json } from "@/lib/http";
import { requireAuth } from "@/lib/auth-guard";
import { supabaseServer } from "@/lib/supabase-server";

export async function DELETE(req: NextRequest) {
  try {
    const { userId } = requireAuth(req);

    // Extract postId and commentId from URL
    const url = new URL(req.url);
    const segments = url.pathname.split("/");
    // ["", "api", "posts", "<postId>", "comments", "<commentId>"]
    const commentId = segments.at(-1);
    if (!commentId) return json({ error: "Comment ID required" }, 400);

    // Check if the user is the comment author
    const { data: c, error: selectError } = await supabaseServer
      .from("comments")
      .select("author_id")
      .eq("id", commentId)
      .maybeSingle();

    if (selectError) return json({ error: selectError.message }, 400);

    if (!c || c.author_id !== userId) {
      return json({ error: "Forbidden" }, 403);
    }

    // Delete the comment
    const { error: deleteError } = await supabaseServer
      .from("comments")
      .delete()
      .eq("id", commentId);

    if (deleteError) return json({ error: deleteError.message }, 400);

    return json({ ok: true });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unauthorized";
    return json({ error: message }, 401);
  }
}
