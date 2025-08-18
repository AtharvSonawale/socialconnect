"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      setErr(data.error || "Login failed");
      return;
    }
    localStorage.setItem("accessToken", data.accessToken);
    localStorage.setItem("refreshToken", data.refreshToken);
    localStorage.setItem("me", JSON.stringify(data.user));
    router.push("/feed");
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-background text-foreground px-4">
      <div className="w-full max-w-sm bg-muted text-card-foreground p-6 rounded-xl shadow-md">
        <h2 className="text-2xl font-bold mb-6 tracking-tighter">Login</h2>
        <form className="flex flex-col gap-4" onSubmit={onSubmit}>
          <input
            className="border border-border rounded-lg px-3 py-2 bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="Email or Username"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
          />
          <input
            className="border border-border rounded-lg px-3 py-2 bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {err && <p className="text-destructive text-sm">{err}</p>}
          <button
            type="submit"
            className="bg-primary text-primary-foreground rounded-lg px-4 py-2 mt-2 hover:bg-primary/90 transition"
          >
            Login
          </button>
        </form>
        <p className="mt-4 text-sm text-muted-foreground text-center">
          Don’t have an account?{" "}
          <Link href="/auth/register" className="text-primary hover:underline">
            Register
          </Link>
        </p>
      </div>
    </main>
  );
}
