import { NextRequest } from "next/server";
import { json } from "@/lib/http";
import { requireAuth } from "@/lib/auth-guard";
import { supabaseServer } from "@/lib/supabase-server";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { commentId: string } }
) {
  try {
    const { userId } = requireAuth(req);
    const { data: c } = await supabaseServer
      .from("comments")
      .select("author_id")
      .eq("id", params.commentId)
      .maybeSingle();

    if (!c || c.author_id !== userId) {
      return json({ error: "Forbidden" }, 403);
    }

    await supabaseServer.from("comments").delete().eq("id", params.commentId);
    return json({ ok: true });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unauthorized";
    return json({ error: message }, 401);
  }
}
