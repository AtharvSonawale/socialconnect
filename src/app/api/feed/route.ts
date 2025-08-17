import { NextRequest } from "next/server";
import { json } from "@/lib/http";
import { requireAuth } from "@/lib/auth-guard";
import { supabaseServer } from "@/lib/supabase-server";

interface LikeRecord {
  post_id: string;
}

export async function GET(req: NextRequest) {
  try {
    const { userId } = requireAuth(req);
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page") || 1);
    const limit = Math.min(20, Number(searchParams.get("limit") || 20));
    const offset = (page - 1) * limit;

    // get followed + self
    const { data: following } = await supabaseServer
      .from("follows")
      .select("following_id")
      .eq("follower_id", userId);

    const ids = new Set<string>([
      userId,
      ...(following?.map((f) => f.following_id) || []),
    ]);

    const { data: posts } = await supabaseServer
      .from("posts")
      .select(
        "id, author_id, content, image_url, category, like_count, comment_count, created_at"
      )
      .in("author_id", Array.from(ids))
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    // compute interaction status for this user
    const postIds = posts?.map((p) => p.id) || [];
    const likesRes = await supabaseServer
      .from("likes")
      .select("post_id")
      .eq("user_id", userId)
      .in("post_id", postIds);

    const likedSet = new Set<string>(
      (likesRes.data as LikeRecord[] | null)?.map((r) => r.post_id) || []
    );

    return json({
      posts: (posts || []).map((p) => ({
        ...p,
        liked_by_me: likedSet.has(p.id),
      })),
      page,
      limit,
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unauthorized";
    return json({ error: message }, 401);
  }
}
