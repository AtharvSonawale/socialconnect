"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type User = {
  id: string;
  username: string;
  first_name?: string;
  last_name?: string;
  bio?: string;
  avatar_url?: string;
};

type UserData = {
  user: User;
  followers_count: number;
  following_count: number;
  posts_count: number;
  is_following: boolean;
};

export default function UserPage() {
  const { userId } = useParams() as { userId: string };
  const [data, setData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(false);

  const authHeaders = useCallback(() => ({
    Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
  }), []);

  const loadUser = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/users/${userId}`, { headers: authHeaders() });
      if (!res.ok) throw new Error("Failed to load user");
      const d: UserData = await res.json();
      setData(d);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [userId, authHeaders]);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const follow = async () => {
    if (!data) return;
    await fetch(`/api/users/${userId}/follow`, {
      method: "POST",
      headers: authHeaders(),
    });
    await loadUser();
  };

  const unfollow = async () => {
    if (!data) return;
    await fetch(`/api/users/${userId}/follow`, {
      method: "DELETE",
      headers: authHeaders(),
    });
    await loadUser();
  };

  if (!data || loading) return <div>Loading...</div>;

  const { user, followers_count, following_count, posts_count, is_following } = data;

  return (
    <>
      <Navbar />
      <main className="max-w-xl mx-auto p-4">
        <Card className="mb-4">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Avatar className="w-16 h-16">
                {user.avatar_url ? (
                  <AvatarImage src={user.avatar_url} alt={user.username} />
                ) : (
                  <AvatarFallback>{user.username[0]}</AvatarFallback>
                )}
              </Avatar>
              <div>
                <CardTitle className="text-lg">@{user.username}</CardTitle>
                <div className="text-sm opacity-70">
                  {user.first_name} {user.last_name}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {user.bio && <p className="mb-2">{user.bio}</p>}
            <div className="flex gap-4 text-sm mb-2">
              <div>Followers: {followers_count}</div>
              <div>Following: {following_count}</div>
              <div>Posts: {posts_count}</div>
            </div>
            <div className="flex gap-2">
              {is_following ? (
                <Button variant="outline" onClick={unfollow}>
                  Unfollow
                </Button>
              ) : (
                <Button onClick={follow}>Follow</Button>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
