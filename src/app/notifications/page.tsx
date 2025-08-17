"use client";

import { useState, useEffect, useCallback } from "react";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type Notification = {
  id: string;
  message: string;
  post_id?: string;
  is_read: boolean;
  created_at: string;
};

export default function NotificationsPage() {
  const [items, setItems] = useState<Notification[]>([]);

  const authHeaders = useCallback(
    () => ({
      Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
    }),
    []
  );

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications", { headers: authHeaders() });
      if (!res.ok) throw new Error("Failed to load notifications");
      const data: { notifications: Notification[] } = await res.json();
      setItems(data.notifications);
    } catch (err) {
      console.error(err);
    }
  }, [authHeaders]);

  useEffect(() => {
    load();
  }, [load]);

  const markAll = async () => {
    try {
      await fetch("/api/notifications/mark-all-read", {
        method: "POST",
        headers: authHeaders(),
      });
      load();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <Navbar />
      <main className="max-w-xl mx-auto p-4">
        <div className="flex justify-between items-center mb-3">
          <h1 className="text-xl font-bold">Notifications</h1>
          <Button variant="outline" size="sm" onClick={markAll}>
            Mark all read
          </Button>
        </div>
        <div className="flex flex-col gap-2">
          {items.map((n) => (
            <Card key={n.id}>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>{n.message}</span>
                  {!n.is_read && (
                    <Badge variant="destructive" className="ml-2">
                      new
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex justify-between items-center">
                {n.post_id && (
                  <a className="underline text-sm" href={`/post/${n.post_id}`}>
                    View
                  </a>
                )}
                <span className="text-xs opacity-70">
                  {formatTimeAgo(n.created_at)}
                </span>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </>
  );
}

function formatTimeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const d = Math.floor(hr / 24);
  if (d === 1) return "yesterday";
  return new Date(iso).toLocaleDateString();
}
