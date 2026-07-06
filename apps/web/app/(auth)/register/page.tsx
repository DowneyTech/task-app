"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth";

export default function RegisterPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.auth.register({ name, email, password });
      setAuth(res.token, res.user);
      router.push("/today");
    } catch (err) {
      setError(err instanceof Error ? err.message : "登録に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-subtle flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-brand rounded-xl mb-3">
            <svg viewBox="0 0 24 24" className="w-7 h-7 fill-white">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-text">TaskApp</h1>
          <p className="text-sm text-text-secondary mt-1">新規アカウントを作成</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-border p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-text-secondary block mb-1">名前</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="山田 太郎"
                className="input"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-text-secondary block mb-1">メールアドレス</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="input"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-text-secondary block mb-1">パスワード（8文字以上）</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input"
                required
                minLength={8}
              />
            </div>
            {error && (
              <p className="text-sm text-red-500 bg-red-50 rounded-md px-3 py-2">{error}</p>
            )}
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-2.5">
              {loading ? "作成中..." : "アカウントを作成"}
            </button>
          </form>

          <p className="text-center text-sm text-text-muted mt-4">
            すでにアカウントをお持ちの方は{" "}
            <Link href="/login" className="text-brand hover:underline font-medium">
              サインイン
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
