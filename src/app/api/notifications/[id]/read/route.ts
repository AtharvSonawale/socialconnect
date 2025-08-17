import { NextRequest } from "next/server";
import { json } from "@/lib/http";
import { requireAuth } from "@/lib/auth-guard";
import { supabaseServer } from "@/lib/supabase-server";

export async function POST(req: NextRequest) {
  try {
    const { userId } = requireAuth(req);

    // Extract 'id' from the URL
    const url = new URL(req.url);
    const segments = url.pathname.split("/");
    // ["", "api", "notifications", "<id>", "read"]
    const id = segments.at(-2); // second to last segment
    if (!id) return json({ error: "Notification ID required" }, 400);

    const { error } = await supabaseServer
      .from("notifications")
      .update({ is_read: true })
      .eq("id", id)
      .eq("recipient_id", userId);

    if (error) return json({ error: error.message }, 400);

    return json({ ok: true });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unauthorized";
    return json({ error: message }, 401);
  }
}
