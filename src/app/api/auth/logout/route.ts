import { NextRequest } from "next/server";
import { json } from "@/lib/http";
import { supabaseServer } from "@/lib/supabase-server";

export async function POST(req: NextRequest) {
  try {
    const { refreshToken } = (await req.json()) as { refreshToken: string };
    if (refreshToken) {
      await supabaseServer
        .from("refresh_tokens")
        .update({ blacklisted: true })
        .eq("token", refreshToken);
    }
    return json({ ok: true });
  } catch {
    return json({ ok: true });
  }
}
