"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";

type Post = {
  id: string;
  content: string;
  image_url?: string;
  created_at: string;
  like_count: number;
  comment_count: number;
  author: {
    id: string;
    username: string;
    avatar_url?: string;
  };
};

type Comment = {
  id: string;
  content: string;
  created_at: string;
  author?: {
    username?: string;
    avatar_url?: string;
  };
};

export default function PostPage() {
  const { postId } = useParams() as { postId: string };
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [content, setContent] = useState("");

  const authHeaders = useCallback(
    () => ({
      Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      "Content-Type": "application/json",
    }),
    []
  );

  const load = useCallback(async () => {
    // Load post
    const res = await fetch(`/api/posts/${postId}`, { headers: authHeaders() });
    if (res.ok) {
      const data = await res.json();
      setPost(data);
    }

    // Load comments
    const rc = await fetch(`/api/posts/${postId}/comments`, {
      headers: authHeaders(),
    });
    if (rc.ok) {
      const dc = await rc.json();
      setComments(dc.comments);
    }
  }, [postId, authHeaders]);

  const addComment = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!content.trim()) return;

      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ content }),
      });

      if (res.ok) {
        setContent("");
        await load();
      }
    },
    [content, postId, authHeaders, load]
  );

  useEffect(() => {
    load();
  }, [load]);

  if (!post) return <div>Loading...</div>;

  return (
    <>
      <Navbar />
      <main className="max-w-xl mx-auto p-4">
        {/* Post Card */}
        <Card className="mb-4">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Avatar>
                {post.author.avatar_url ? (
                  <AvatarImage
                    src={post.author.avatar_url}
                    alt={post.author.username}
                  />
                ) : (
                  <AvatarFallback>
                    <User size={16} />
                  </AvatarFallback>
                )}
              </Avatar>
              <CardTitle>
                <a className="hover:underline" href={`/u/${post.author.id}`}>
                  {post.author.username}
                </a>
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap">{post.content}</p>
            {post.image_url && (
              <div className="relative w-full h-64 mt-2 rounded overflow-hidden">
                <Image
                  src={post.image_url}
                  alt="Post image"
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <div className="mt-2 text-sm opacity-70">
              {new Date(post.created_at).toLocaleString()}
            </div>
          </CardContent>
        </Card>

        {/* Comments Section */}
        <section className="mt-4">
          <h2 className="font-semibold mb-2">
            Comments ({post.comment_count})
          </h2>

          <form onSubmit={addComment} className="flex flex-col gap-2 mb-4">
            <Textarea
              placeholder="Write a comment..."
              value={content}
              onChange={(e) => setContent(e.currentTarget.value)}
              maxLength={200}
            />
            <Button className="self-end">Send</Button>
          </form>

          <div className="flex flex-col gap-2">
            {comments.map((c) => (
              <Card key={c.id} className="p-2">
                <div className="flex items-center">
                  <Avatar className="w-6 h-6">
                    {c.author?.avatar_url ? (
                      <AvatarImage
                        src={c.author.avatar_url}
                        alt={c.author.username}
                      />
                    ) : (
                      <AvatarFallback>
                        <User size={16} />
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <span className="text-sm font-medium">
                    {c.author?.username || "Anonymous"}
                  </span>
                  <span className="text-xs opacity-70 ml-auto">
                    {new Date(c.created_at).toLocaleString()}
                  </span>
                </div>
                <p>{c.content}</p>
              </Card>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
