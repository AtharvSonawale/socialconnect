import { NextRequest } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import { json } from "@/lib/http";
import { registerSchema } from "@/lib/validators";
import { hashPassword } from "@/lib/hash";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = registerSchema.parse(body);

    const { data: existingEmail } = await supabaseServer
      .from("users")
      .select("id")
      .eq("email", parsed.email)
      .maybeSingle();

    if (existingEmail) {
      return json({ error: "Email already in use" }, 400);
    }

    const { data: existingUser } = await supabaseServer
      .from("users")
      .select("id")
      .eq("username", parsed.username)
      .maybeSingle();

    if (existingUser) {
      return json({ error: "Username already exists" }, 400);
    }

    const password_hash = await hashPassword(parsed.password);

    const { data, error } = await supabaseServer
      .from("users")
      .insert({
        email: parsed.email,
        username: parsed.username,
        password_hash,
        first_name: parsed.first_name || null,
        last_name: parsed.last_name || null,
        email_verified: true, // MVP: mark verified
        last_login: null,
      })
      .select("id, email, username, first_name, last_name, role")
      .single();

    if (error) {
      return json({ error: error.message }, 500);
    }

    return json({ user: data }, 201);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Bad Request";
    return json({ error: message }, 400);
  }
}
