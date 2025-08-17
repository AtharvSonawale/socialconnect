import { NextRequest } from "next/server";
import { json } from "@/lib/http";
import { requireAuth } from "@/lib/auth-guard";
import { supabaseServer } from "@/lib/supabase-server";
import { commentCreateSchema } from "@/lib/validators";

function getPostId(req: NextRequest) {
  const url = new URL(req.url);
  const segments = url.pathname.split("/");
  // ["", "api", "posts", "<postId>", "comments"]
  const postId = segments[segments.indexOf("posts") + 1];
  if (!postId) throw new Error("Post ID required");
  return postId;
}

export async function GET(req: NextRequest) {
  try {
    const postId = getPostId(req);

    const { data, error } = await supabaseServer
      .from("comments")
      .select("id, author_id, content, created_at")
      .eq("post_id", postId)
      .order("created_at", { ascending: true });

    if (error) return json({ error: error.message }, 400);
    return json({ comments: data || [] });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Failed to fetch comments";
    return json({ error: message }, 400);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = requireAuth(req);
    const postId = getPostId(req);
    const body = await req.json();
    const { content } = commentCreateSchema.parse(body);

    const { data: post, error: postError } = await supabaseServer
      .from("posts")
      .select("author_id")
      .eq("id", postId)
      .maybeSingle();

    if (postError) return json({ error: postError.message }, 400);
    if (!post) return json({ error: "Post not found" }, 404);

    await supabaseServer.from("comments").insert({
      post_id: postId,
      author_id: userId,
      content,
    });

    if (post.author_id !== userId) {
      await supabaseServer.from("notifications").insert({
        recipient_id: post.author_id,
        sender_id: userId,
        notification_type: "comment",
        post_id: postId,
        message: "commented on your post",
      });
    }

    return json({ ok: true }, 201);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unauthorized";
    return json({ error: message }, 401);
  }
}
