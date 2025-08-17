import { NextRequest } from "next/server";
import { json } from "@/lib/http";
import { supabaseServer } from "@/lib/supabase-server";
import { requireAuth } from "@/lib/auth-guard";
import { postCreateSchema } from "@/lib/validators";

// GET /api/admin/posts/[postId]
export async function GET(
  req: NextRequest,
  { params }: { params: { postId: string } }
) {
  const postId = params.postId;
  const { data: post } = await supabaseServer
    .from("posts")
    .select("*")
    .eq("id", postId)
    .maybeSingle();
  if (!post) return json({ error: "Not found" }, 404);
  const { data: author } = await supabaseServer
    .from("users")
    .select("id, username, first_name, last_name, avatar_url")
    .eq("id", post.author_id)
    .single();
  return json({ post, author });
}

// PATCH /api/admin/posts/[postId]
export async function PATCH(
  req: NextRequest,
  { params }: { params: { postId: string } }
) {
  const postId = params.postId;
  try {
    const { userId } = requireAuth(req);
    const body = await req.json();
    const parsed = postCreateSchema.partial().parse(body);
    const { data: existing } = await supabaseServer
      .from("posts")
      .select("author_id")
      .eq("id", postId)
      .single();
    if (!existing || existing.author_id !== userId) {
      return json({ error: "Forbidden" }, 403);
    }
    const { error } = await supabaseServer
      .from("posts")
      .update(parsed)
      .eq("id", postId);
    if (error) return json({ error: error.message }, 400);
    return json({ ok: true });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unauthorized";
    return json({ error: message }, 401);
  }
}

// DELETE /api/admin/posts/[postId]
export async function DELETE(
  req: NextRequest,
  { params }: { params: { postId: string } }
) {
  const postId = params.postId;
  try {
    const { userId } = requireAuth(req);
    const { data: existing } = await supabaseServer
      .from("posts")
      .select("author_id")
      .eq("id", postId)
      .single();
    if (!existing || existing.author_id !== userId) {
      return json({ error: "Forbidden" }, 403);
    }
    await supabaseServer.from("posts").delete().eq("id", postId);
    return json({ ok: true });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unauthorized";
    return json({ error: message }, 401);
  }
}
