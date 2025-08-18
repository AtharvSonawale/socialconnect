"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Hero() {
  const { theme, setTheme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Prevent rendering until after hydration
  useEffect(() => setMounted(true), []);

  // Determine current theme
  const currentTheme = theme === "system" ? systemTheme : theme;

  if (!mounted) {
    // Avoid rendering theme-dependent content on server
    return null;
  }

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div className="text-xl font-medium -tracking-wide">
          <Link href="/">SocialConnect</Link>
        </div>

        <div className="flex items-center gap-3">
          {/* Theme toggler */}
          <button
            onClick={() => setTheme(currentTheme === "dark" ? "light" : "dark")}
            className="p-2 rounded-xl border hover:bg-muted hover:text-foreground transition flex items-center justify-center"
            aria-label="Toggle Theme"
          >
            {currentTheme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          <Link
            href="/auth/login"
            className="px-4 py-2 border rounded-xl hover:bg-primary hover:text-primary-foreground transition"
          >
            Login
          </Link>
        </div>
      </nav>

      {/* Hero Content */}
      <section className="flex flex-col items-center justify-center flex-1 gap-4 text-center">
        <h1 className="text-9xl -tracking-wider text-primary">SocialConnect</h1>
        <p className="text-md opacity-80 max-w-lg -tracking-wider">
          Share images. Follow people. Stay updated.
        </p>
        <div className="flex gap-6">
          <Link
            href="/auth/login"
            className="px-4 py-2 border border-border rounded-xl hover:bg-primary hover:text-primary-foreground transition"
          >
            Login
          </Link>
          <Link
            href="/auth/register"
            className="px-4 py-2 border border-border rounded-xl hover:bg-secondary hover:text-secondary-foreground transition"
          >
            Register
          </Link>
        </div>
      </section>
    </main>
  );
}
