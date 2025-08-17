import { NextRequest } from "next/server";
import { json } from "@/lib/http";
import { requireAuth } from "@/lib/auth-guard";
import { supabaseServer } from "@/lib/supabase-server";

export async function GET(
  req: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    const { userId } = requireAuth(req);
    const { data } = await supabaseServer
      .from("likes")
      .select("id")
      .eq("user_id", userId)
      .eq("post_id", params.postId)
      .maybeSingle();
    return json({ liked: !!data });
  } catch {
    return json({ liked: false });
  }
}
