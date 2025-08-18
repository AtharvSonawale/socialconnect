"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [first, setFirst] = useState("");
  const [last, setLast] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        username,
        password,
        first_name: first,
        last_name: last,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setErr(data.error || "Failed");
      return;
    }
    router.push("/auth/login");
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-background text-foreground px-4">
      <div className="w-full max-w-sm bg-muted text-card-foreground p-6 rounded-xl shadow-md">
        <h2 className="text-2xl mb-6 font-bold tracking-tighter">Register</h2>
        <form className="flex flex-col gap-4" onSubmit={onSubmit}>
          <input
            className="border border-border rounded-lg px-3 py-2 bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="border border-border rounded-lg px-3 py-2 bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            className="border border-border rounded-lg px-3 py-2 bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <input
            className="border border-border rounded-lg px-3 py-2 bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="First name"
            value={first}
            onChange={(e) => setFirst(e.target.value)}
          />
          <input
            className="border border-border rounded-lg px-3 py-2 bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="Last name"
            value={last}
            onChange={(e) => setLast(e.target.value)}
          />
          {err && <p className="text-destructive text-sm">{err}</p>}
          <button
            type="submit"
            className="bg-primary text-primary-foreground rounded-lg px-4 py-2 mt-2 hover:bg-primary/90 transition"
          >
            Create Account
          </button>
        </form>
        <p className="mt-4 text-sm text-muted-foreground text-center">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-primary hover:underline">
            Login
          </Link>
        </p>
      </div>
    </main>
  );
}
