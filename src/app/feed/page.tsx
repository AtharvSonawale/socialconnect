"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Navbar from "@/components/Navbar";
import { supabaseClient } from "@/lib/supabase-client";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, MessageCircle, Plus } from "lucide-react";

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

  const [modalOpen, setModalOpen] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

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
        setModalOpen(false); // close modal on success
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

  // Close modal on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        setModalOpen(false);
      }
    };
    if (modalOpen) document.addEventListener("mousedown", handleClickOutside);
    else document.removeEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [modalOpen]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <>
      <Navbar />

      <main className="max-w-xl mx-auto p-4 relative">
        {/* Top-right create post button */}
        <div className="flex justify-end mb-4">
          <Button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-1"
          >
            <Plus size={16} /> Create Post
          </Button>
        </div>

        {/* Modal */}
        {modalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div
              ref={modalRef}
              className="bg-background p-6 rounded-xl shadow-lg w-full max-w-md"
            >
              <h2 className="text-lg font-semibold mb-4">Create Post</h2>
              <form onSubmit={createPost} className="flex flex-col gap-4">
                <Textarea
                  placeholder="What's up?"
                  value={content}
                  onChange={(e) => setContent(e.currentTarget.value)}
                  className="mb-2"
                />

                {/* Image Upload Box */}
                <div
                  className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:border-gray-500 transition-colors"
                  onClick={() =>
                    document.getElementById("post-image-input")?.click()
                  }
                >
                  {image ? (
                    <div className="relative w-full h-48 rounded overflow-hidden">
                      <Image
                        src={URL.createObjectURL(image)}
                        alt="Preview"
                        fill
                        className="object-cover rounded"
                      />
                    </div>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 text-center">
                      Click or drop an image here (JPEG/PNG, max 2MB)
                    </p>
                  )}
                  <input
                    type="file"
                    id="post-image-input"
                    accept="image/png,image/jpeg"
                    className="hidden"
                    onChange={(e) => setImage(e.target.files?.[0] || null)}
                  />
                </div>

                <div className="flex justify-end gap-2 mt-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setModalOpen(false);
                      setImage(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Post</Button>
                </div>

                {err && <Badge variant="destructive">{err}</Badge>}
              </form>
            </div>
          </div>
        )}

        {/* Feed posts */}
        <div className="flex flex-col gap-4">
          {posts.map((p) => (
            <Card key={p.id}>
              <CardContent>
                {p.image_url && (
                  <div className="relative w-full h-64 mt-2">
                    <Image
                      src={p.image_url}
                      alt=""
                      fill
                      className="object-cover rounded-xl"
                    />
                  </div>
                )}

                <p className="whitespace-pre-wrap mt-4 -tracking-wider">
                  {p.content}
                </p>
                <a
                  href={`/post/${p.id}`}
                  className="hover:underline text-sm -tracking-wider"
                >
                  View Post
                </a>
                <div className="mt-2 flex items-center gap-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleLike(p.id, !!p.liked_by_me)}
                    className="flex items-center gap-1 px-2 py-1 text-sm"
                  >
                    <Heart
                      size={16}
                      className={
                        p.liked_by_me ? "text-red-500" : "text-gray-500"
                      }
                    />
                    <span>{p.like_count}</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1 px-2 py-1 text-sm cursor-default"
                  >
                    <MessageCircle size={16} className="text-gray-500" />
                    <span>{p.comment_count}</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </>
  );
}
