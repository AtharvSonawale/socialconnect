import { NextRequest } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import { json } from "@/lib/http";
import { requireAuth } from "@/lib/auth-guard";
import { postCreateSchema } from "@/lib/validators";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = Number(searchParams.get("page") || 1);
  const limit = Math.min(20, Number(searchParams.get("limit") || 20));
  const offset = (page - 1) * limit;

  const { data, error } = await supabaseServer
    .from("posts")
    .select(
      "id, author_id, content, image_url, category, like_count, comment_count, created_at"
    )
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) return json({ error: error.message }, 400);
  return json({ posts: data || [], page, limit });
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = requireAuth(req);
    const body = await req.json();
    const parsed = postCreateSchema.parse(body);

    const { data, error } = await supabaseServer
      .from("posts")
      .insert({
        author_id: userId,
        content: parsed.content,
        image_url: parsed.image_url || null,
        category: parsed.category || "general",
      })
      .select("id")
      .single();

    if (error) return json({ error: error.message }, 400);
    return json({ id: data.id }, 201);
  } catch (e: unknown) {
    if (e instanceof Error) {
      return json({ error: e.message }, 401);
    }
    return json({ error: "Unauthorized" }, 401);
  }
}
