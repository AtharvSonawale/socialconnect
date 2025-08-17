import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth-guard";
import { supabaseServer } from "@/lib/supabase-server";
import { json } from "@/lib/http";

// Helper to extract userId from URL
function getUserId(req: NextRequest) {
  const segments = new URL(req.url).pathname.split("/");
  const userId = segments[segments.indexOf("users") + 1];
  if (!userId) throw new Error("User ID required");
  return userId;
}

export async function POST(req: NextRequest) {
  try {
    const { userId: me } = requireAuth(req);
    const target = getUserId(req);

    if (me === target) return json({ error: "Cannot follow self" }, 400);

    const { error } = await supabaseServer
      .from("follows")
      .insert({ follower_id: me, following_id: target });

    if (error && !error.message.includes("duplicate key")) {
      return json({ error: error.message }, 400);
    }

    // create notification
    await supabaseServer.from("notifications").insert({
      recipient_id: target,
      sender_id: me,
      notification_type: "follow",
      post_id: null,
      message: "started following you",
    });

    return json({ ok: true });
  } catch (e: unknown) {
    const err = e instanceof Error ? e.message : "Unauthorized";
    return json({ error: err }, 401);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { userId: me } = requireAuth(req);
    const target = getUserId(req);

    await supabaseServer
      .from("follows")
      .delete()
      .eq("follower_id", me)
      .eq("following_id", target);

    return json({ ok: true });
  } catch (e: unknown) {
    const err = e instanceof Error ? e.message : "Unauthorized";
    return json({ error: err }, 401);
  }
}
