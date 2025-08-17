import { NextRequest } from "next/server";
import { json } from "@/lib/http";
import { requireAuth } from "@/lib/auth-guard";
import { supabaseServer } from "@/lib/supabase-server";

export async function POST(
  req: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    const { userId } = requireAuth(req);
    const postId = params.postId;

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
    if (e instanceof Error) {
      return json({ error: e.message }, 401);
    }
    return json({ error: "Unauthorized" }, 401);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    const { userId } = requireAuth(req);
    await supabaseServer
      .from("likes")
      .delete()
      .eq("user_id", userId)
      .eq("post_id", params.postId);
    return json({ ok: true });
  } catch (e: unknown) {
    if (e instanceof Error) {
      return json({ error: e.message }, 401);
    }
    return json({ error: "Unauthorized" }, 401);
  }
}
