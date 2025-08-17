import { NextRequest } from "next/server";
import { json } from "@/lib/http";
import { supabaseServer } from "@/lib/supabase-server";
import { requireAuth } from "@/lib/auth-guard";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { postId: string } }
) {
  const { role } = requireAuth(req);
  if (role !== "Admin") return json({ error: "Forbidden" }, 403);
  await supabaseServer.from("posts").delete().eq("id", params.postId);
  return json({ ok: true });
}
