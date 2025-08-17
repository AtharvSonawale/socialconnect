import { NextRequest } from "next/server";
import { json } from "@/lib/http";
import { requireAuth } from "@/lib/auth-guard";
import { supabaseServer } from "@/lib/supabase-server";

// Helper to extract postId from URL: /api/posts/[postId]/like
function getPostId(req: NextRequest) {
  const segments = new URL(req.url).pathname.split("/");
  const postId = segments[segments.indexOf("posts") + 1];
  if (!postId) throw new Error("Post ID required");
  return postId;
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = requireAuth(req);
    const postId = getPostId(req);

    const { data: post } = await supabaseServer
      .from("posts")
      .select("author_id")
      .eq("id", postId)
      .maybeSingle();
    if (!post) return json({ error: "Not found" }, 404);

    const { error } = await supabaseServer
      .from("likes")
      .insert({ user_id: userId, post_id: postId });
    if (error && !error.message.includes("duplicate key")) {
      return json({ error: error.message }, 400);
    }

    if (post.author_id !== userId) {
      await supabaseServer.from("notifications").insert({
        recipient_id: post.author_id,
        sender_id: userId,
        notification_type: "like",
        post_id: postId,
        message: "liked your post",
      });
    }

    return json({ ok: true });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unauthorized";
    return json({ error: message }, 401);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { userId } = requireAuth(req);
    const postId = getPostId(req);

    await supabaseServer
      .from("likes")
      .delete()
      .eq("user_id", userId)
      .eq("post_id", postId);

    return json({ ok: true });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unauthorized";
    return json({ error: message }, 401);
  }
}
