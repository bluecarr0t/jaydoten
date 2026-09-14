"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function AdminLoginForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    setLoading(false);

    if (!response.ok) {
      const data = (await response.json()) as { error?: string };
      setError(data.error ?? "Login failed");
      return;
    }

    router.push("/admin/gallery");
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto w-full max-w-sm space-y-6 border border-[#141414]/15 bg-[#f4f1eb] p-8"
    >
      <div>
        <h1 className="font-serif text-2xl text-[#141414]">Gallery admin</h1>
        <p className="mt-2 text-sm text-[#141414]/60">
          Local dev only. Upload frames and edit descriptions.
        </p>
      </div>

      <label className="block">
        <span className="font-mono text-[10px] tracking-[0.2em] text-[#141414]/50 uppercase">
          Password
        </span>
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="mt-2 w-full border border-[#141414]/20 bg-white px-3 py-2 text-sm text-[#141414] outline-none focus:border-[#141414]/50"
          autoComplete="current-password"
          required
        />
      </label>

      {error ? (
        <p className="text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-[#141414] px-4 py-2.5 font-mono text-[11px] tracking-[0.18em] text-[#f4f1eb] uppercase transition hover:bg-[#141414]/90 disabled:opacity-50"
      >
        {loading ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
