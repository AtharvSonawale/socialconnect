import { NextRequest } from "next/server";
import { json } from "@/lib/http";
import { requireAuth } from "@/lib/auth-guard";
import { supabaseServer } from "@/lib/supabase-server";

interface NotificationRecord {
  id: string;
  sender_id: string;
  notification_type: "follow" | "like" | "comment";
  post_id: string | null;
  message: string;
  is_read: boolean;
  created_at: string;
}

export async function GET(req: NextRequest) {
  try {
    const { userId } = requireAuth(req);

    const { data, error } = await supabaseServer
      .from("notifications")
      .select(
        "id, sender_id, notification_type, post_id, message, is_read, created_at"
      )
      .eq("recipient_id", userId)
      .order("created_at", { ascending: false });

    if (error) return json({ error: error.message }, 400);

    return json({ notifications: (data || []) as NotificationRecord[] });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unauthorized";
    return json({ error: message }, 401);
  }
}
