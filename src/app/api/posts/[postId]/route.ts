import { NextRequest } from "next/server";
import { json } from "@/lib/http";
import { supabaseServer } from "@/lib/supabase-server";
import { requireAuth } from "@/lib/auth-guard";
import { postCreateSchema } from "@/lib/validators";

export async function GET(
  _req: NextRequest,
  { params }: { params: { postId: string } }
) {
  const id = params.postId;
  const { data: post } = await supabaseServer
    .from("posts")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!post) return json({ error: "Not found" }, 404);

  const { data: author } = await supabaseServer
    .from("users")
    .select("id, username, first_name, last_name, avatar_url")
    .eq("id", post.author_id)
    .single();

  return json({ post, author });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    const { userId } = requireAuth(req);
    const body = await req.json();
    const parsed = postCreateSchema.partial().parse(body);

    const { data: existing } = await supabaseServer
      .from("posts")
      .select("author_id")
      .eq("id", params.postId)
      .single();

    if (!existing || existing.author_id !== userId) {
      return json({ error: "Forbidden" }, 403);
    }

    const { error } = await supabaseServer
      .from("posts")
      .update(parsed)
      .eq("id", params.postId);

    if (error) return json({ error: error.message }, 400);

    return json({ ok: true });
  } catch (e: unknown) {
    const message =
      e instanceof Error ? e.message : "Unauthorized";
    return json({ error: message }, 401);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    const { userId } = requireAuth(req);
    const { data: existing } = await supabaseServer
      .from("posts")
      .select("author_id")
      .eq("id", params.postId)
      .single();

    if (!existing || existing.author_id !== userId) {
      return json({ error: "Forbidden" }, 403);
    }

    await supabaseServer.from("posts").delete().eq("id", params.postId);
    return json({ ok: true });
  } catch (e: unknown) {
    const message =
      e instanceof Error ? e.message : "Unauthorized";
    return json({ error: message }, 401);
  }
}
