"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabaseClient } from "@/lib/supabase-client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

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

  const me: Me | null =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("me") || "null")
      : null;

  useEffect(() => {
    if (!me) return;

    // Initial fetch
    const fetchCount = async () => {
      const res = await fetch("/api/notifications", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      const data: { notifications: Notification[] } = await res.json();
      if (res.ok) {
        const unread = (data.notifications || []).filter(
          (n) => !n.is_read
        ).length;
        setCount(unread);
      }
    };
    fetchCount();

    // Realtime subscription
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
    <nav className="border-b bg-background">
      <div className="container mx-auto h-14 flex items-center justify-between px-4">
        <Link href="/feed" className="font-bold">
          socialconnect
        </Link>

        <div className="flex items-center gap-4">
          <Link href="/notifications" className="relative">
            <span className="text-xl">🔔</span>
            {count > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-2 -right-2 text-xs rounded-full"
              >
                {count}
              </Badge>
            )}
          </Link>

          <Link
            href={`/u/${me?.id || ""}`}
            className="w-8 h-8 rounded-full overflow-hidden"
          >
            <Avatar>
              {me?.avatar_url ? (
                <AvatarImage
                  src={me.avatar_url}
                  alt="avatar"
                  className="w-8 h-8 object-cover"
                />
              ) : (
                <AvatarFallback>👤</AvatarFallback>
              )}
            </Avatar>
          </Link>
        </div>
      </div>
    </nav>
  );
}
