"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabaseClient } from "@/lib/supabase-client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Bell, User, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";

interface Notification {
  id: string;
  recipient_id: string;
  is_read: boolean;
  message: string;
  sender_id: string;
  post_id?: string | null;
}

interface Me {
  id: string;
  avatar_url?: string | null;
}

export default function Navbar() {
  const [count, setCount] = useState(0);
  const [me, setMe] = useState<Me | null>(null);

  const { theme, setTheme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Mark as mounted after client hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  const currentTheme = theme === "system" ? systemTheme : theme;

  // Load user info from localStorage client-side
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("me");
      if (stored) setMe(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    if (!me) return;

    const fetchCount = async () => {
      try {
        const res = await fetch("/api/notifications", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        });
        if (!res.ok) return;

        const data: { notifications: Notification[] } = await res.json();
        const unread = (data.notifications || []).filter(
          (n) => !n.is_read
        ).length;
        setCount(unread);
      } catch (err) {
        console.error("Failed to fetch notifications:", err);
      }
    };
    fetchCount();

    const channel = supabaseClient
      .channel("public:notifications")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications" },
        (payload) => {
          const row = payload.new as Notification;
          if (row.recipient_id === me.id) setCount((c) => c + 1);
        }
      )
      .subscribe();

    return () => {
      supabaseClient.removeChannel(channel);
    };
  }, [me]);

  return (
    <nav className="border-b bg-background text-foreground">
      <div className="container mx-auto h-14 flex items-center justify-between px-4">
        <Link href="/feed" className="text-lg -tracking-wider font-semibold">
          SocialConnect
        </Link>

        <div className="flex items-center gap-4">
          {/* Theme toggle button */}
          {mounted && (
            <button
              onClick={() =>
                setTheme(currentTheme === "dark" ? "light" : "dark")
              }
              className="p-2 rounded-xl border hover:bg-muted hover:text-foreground transition flex items-center justify-center"
              aria-label="Toggle Theme"
            >
              {currentTheme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          )}

          {/* Notifications */}
          <Link href="/notifications" className="relative">
            <Bell className="text-xl" />
            {count > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-2 -right-2 text-xs rounded-full"
              >
                {count}
              </Badge>
            )}
          </Link>

          {/* User Avatar */}
          <Link
            href={`/u/${me?.id || ""}`}
            className="w-10 h-10 rounded-full overflow-hidden"
          >
            <Avatar className="w-10 h-10">
              {me?.avatar_url ? (
                <AvatarImage
                  src={me.avatar_url}
                  alt="avatar"
                  className="object-cover"
                />
              ) : (
                <AvatarFallback>
                  <User className="w-6 h-6 text-foreground" />
                </AvatarFallback>
              )}
            </Avatar>
          </Link>
        </div>
      </div>
    </nav>
  );
}
