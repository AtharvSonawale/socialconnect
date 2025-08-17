"use client";

import { useEffect, useState, useCallback } from "react";
import Navbar from "@/components/Navbar";
import { supabaseClient } from "@/lib/supabase-client";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type Post = {
  id: string;
  author_id: string;
  content: string;
  image_url?: string;
  like_count: number;
  comment_count: number;
  created_at: string;
  liked_by_me?: boolean;
};

export default function FeedPage() {
  const [content, setContent] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [err, setErr] = useState<string | null>(null);

  const authHeaders = useCallback(
    () => ({
      Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      "Content-Type": "application/json",
    }),
    []
  );

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/feed", { headers: authHeaders() });
      const data = await res.json();
      if (res.ok) setPosts(data.posts);
      else setErr(data.error || "Failed to load");
    } catch (e: unknown) {
      if (e instanceof Error) setErr(e.message);
      else setErr("Failed to load");
    }
  }, [authHeaders]);

  const uploadToStorage = useCallback(async (file: File): Promise<string> => {
    const path = `post-${Date.now()}-${file.name}`;
    const { error } = await supabaseClient.storage
      .from("post-images")
      .upload(path, file, { upsert: false });
    if (error) throw new Error(error.message);

    const { data: pub } = supabaseClient.storage
      .from("post-images")
      .getPublicUrl(path);
    return pub.publicUrl;
  }, []);

  const createPost = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setErr(null);
      try {
        let image_url: string | undefined;
        if (image) {
          if (!["image/jpeg", "image/png"].includes(image.type))
            throw new Error("JPEG/PNG only");
          if (image.size > 2_097_152) throw new Error("Max 2MB");
          image_url = await uploadToStorage(image);
        }
        const res = await fetch("/api/posts", {
          method: "POST",
          headers: authHeaders(),
          body: JSON.stringify({ content, image_url }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed");
        setContent("");
        setImage(null);
        await load();
      } catch (e: unknown) {
        if (e instanceof Error) setErr(e.message);
        else setErr("Unknown error");
      }
    },
    [content, image, authHeaders, load, uploadToStorage]
  );

  const toggleLike = useCallback(
    async (id: string, liked: boolean) => {
      const method = liked ? "DELETE" : "POST";
      const res = await fetch(`/api/posts/${id}/like`, {
        method,
        headers: authHeaders(),
      });
      if (res.ok) load();
    },
    [authHeaders, load]
  );

  useEffect(() => {
    load();
  }, [load]); // ✅ ESLint-friendly

  return (
    <>
      <Navbar />
      <main className="max-w-xl mx-auto p-4">
        <form onSubmit={createPost} className="mb-4">
          <Textarea
            placeholder="What's up?"
            value={content}
            onChange={(e) => setContent(e.currentTarget.value)}
            className="mb-2"
          />
          <input
            type="file"
            accept="image/png,image/jpeg"
            onChange={(e) => setImage(e.target.files?.[0] || null)}
          />
          <Button className="mt-2">Post</Button>
          {err && (
            <Badge variant="destructive" className="mt-2">
              {err}
            </Badge>
          )}
        </form>

        <div className="flex flex-col gap-4">
          {posts.map((p) => (
            <Card key={p.id}>
              <CardHeader>
                <CardTitle>
                  <a href={`/post/${p.id}`} className="hover:underline">
                    View Post
                  </a>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{p.content}</p>
                {p.image_url && (
                  <div className="relative w-full h-64 mt-2">
                    <Image
                      src={p.image_url}
                      alt=""
                      fill
                      className="object-cover rounded"
                    />
                  </div>
                )}
                <div className="mt-2 flex items-center gap-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleLike(p.id, !!p.liked_by_me)}
                  >
                    ❤️ {p.like_count} {p.liked_by_me ? "(you)" : ""}
                  </Button>
                  <Badge variant="secondary">💬 {p.comment_count}</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </>
  );
}
