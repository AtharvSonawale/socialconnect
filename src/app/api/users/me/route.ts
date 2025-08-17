import { NextRequest } from "next/server";
import { json } from "@/lib/http";
import { requireAuth } from "@/lib/auth-guard";
import { supabaseServer } from "@/lib/supabase-server";
import { profileUpdateSchema } from "@/lib/validators";

export async function GET(req: NextRequest) {
  try {
    const { userId } = requireAuth(req);

    const { data, error } = await supabaseServer.rpc(
      "get_user_profile_counts",
      { p_user_id: userId }
    );

    if (error) {
      // fallback if rpc not defined yet
      const { data: user, error: userError } = await supabaseServer
        .from("users")
        .select(
          "id, email, username, first_name, last_name, bio, avatar_url, website, location, role, profile_visibility"
        )
        .eq("id", userId)
        .single();

      if (userError || !user) {
        return json({ error: "User not found" }, 404);
      }

      const [
        { count: followers = 0 },
        { count: following = 0 },
        { count: posts = 0 },
      ] = await Promise.all([
        supabaseServer
          .from("follows")
          .select("*", { count: "exact", head: true })
          .eq("following_id", userId),
        supabaseServer
          .from("follows")
          .select("*", { count: "exact", head: true })
          .eq("follower_id", userId),
        supabaseServer
          .from("posts")
          .select("*", { count: "exact", head: true })
          .eq("author_id", userId),
      ]);

      return json({
        user,
        followers_count: followers,
        following_count: following,
        posts_count: posts,
      });
    }

    return json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unauthorized";
    return json({ error: message }, 401);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { userId } = requireAuth(req);
    const body = await req.json();
    const parsed = profileUpdateSchema.parse(body);

    const { error } = await supabaseServer
      .from("users")
      .update(parsed)
      .eq("id", userId);

    if (error) {
      return json({ error: error.message }, 400);
    }

    return json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Bad Request";
    return json({ error: message }, 400);
  }
}
