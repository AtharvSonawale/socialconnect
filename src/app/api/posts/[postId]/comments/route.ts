import { NextRequest } from "next/server";
import { json } from "@/lib/http";
import { requireAuth } from "@/lib/auth-guard";
import { supabaseServer } from "@/lib/supabase-server";
import { commentCreateSchema } from "@/lib/validators";

export async function GET(
  _req: NextRequest,
  { params }: { params: { postId: string } }
) {
  const { data, error } = await supabaseServer
    .from("comments")
    .select("id, author_id, content, created_at")
    .eq("post_id", params.postId)
    .order("created_at", { ascending: true });

  if (error) return json({ error: error.message }, 400);
  return json({ comments: data || [] });
}

export async function POST(
  req: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    const { userId } = requireAuth(req);
    const body = await req.json();
    const { content } = commentCreateSchema.parse(body);

    const { data: post } = await supabaseServer
      .from("posts")
      .select("author_id")
      .eq("id", params.postId)
      .maybeSingle();

    if (!post) return json({ error: "Not found" }, 404);

    await supabaseServer.from("comments").insert({
      post_id: params.postId,
      author_id: userId,
      content,
    });

    if (post.author_id !== userId) {
      await supabaseServer.from("notifications").insert({
        recipient_id: post.author_id,
        sender_id: userId,
        notification_type: "comment",
        post_id: params.postId,
        message: "commented on your post",
      });
    }

    return json({ ok: true }, 201);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unauthorized";
    return json({ error: message }, 401);
  }
}
