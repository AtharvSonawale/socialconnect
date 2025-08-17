import { NextRequest } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import { json } from "@/lib/http";

// Helper to extract userId from the URL
function getUserId(req: NextRequest) {
  const segments = new URL(req.url).pathname.split("/");
  const userId = segments[segments.indexOf("users") + 1];
  if (!userId) throw new Error("User ID required");
  return userId;
}

export async function GET(req: NextRequest) {
  try {
    const uid = getUserId(req);

    const { data: user } = await supabaseServer
      .from("users")
      .select(
        "id, username, first_name, last_name, bio, avatar_url, website, location, profile_visibility"
      )
      .eq("id", uid)
      .maybeSingle();

    if (!user) return json({ error: "Not found" }, 404);

    const [
      { count: followers = 0 },
      { count: following = 0 },
      { count: posts = 0 },
    ] = await Promise.all([
      supabaseServer
        .from("follows")
        .select("*", { count: "exact", head: true })
        .eq("following_id", uid),
      supabaseServer
        .from("follows")
        .select("*", { count: "exact", head: true })
        .eq("follower_id", uid),
      supabaseServer
        .from("posts")
        .select("*", { count: "exact", head: true })
        .eq("author_id", uid),
    ]);

    return json({
      user,
      followers_count: followers,
      following_count: following,
      posts_count: posts,
    });
  } catch (e: unknown) {
    const err = e instanceof Error ? e.message : "Failed to fetch user";
    return json({ error: err }, 400);
  }
}
