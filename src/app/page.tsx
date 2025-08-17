import Link from "next/link";

export default function Hero() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6">
      <h1 className="text-4xl font-bold">SocialConnect</h1>
      <p className="opacity-80">Share images. Follow people. Stay updated.</p>
      <div className="flex gap-3">
        <Link href="/auth/login" className="px-4 py-2 border rounded">
          Login
        </Link>
        <Link href="/auth/register" className="px-4 py-2 border rounded">
          Register
        </Link>
      </div>
    </main>
  );
}
