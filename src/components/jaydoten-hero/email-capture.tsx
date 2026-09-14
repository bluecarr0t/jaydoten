"use client";

import { useState, type FormEvent } from "react";

type CaptureStatus = "idle" | "submitting" | "success" | "error";

export function EmailCapture() {
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [status, setStatus] = useState<CaptureStatus>("idle");
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    setMessage(null);

    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, website }),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as {
          error?: string;
        };
        setStatus("error");
        setMessage(data.error ?? "Could not subscribe. Try again.");
        return;
      }

      setStatus("success");
    } catch {
      setStatus("error");
      setMessage("Could not subscribe. Try again.");
    }
  }

  switch (status) {
    case "success":
      return (
        <p
          className="relative z-20 mt-4 max-w-xl font-sans text-sm leading-relaxed text-[#D32F27]/85 lg:mt-10 lg:text-base"
          role="status"
        >
          You’re on the list. We’ll write when there is something worth
          sending.
        </p>
      );
    case "idle":
    case "submitting":
    case "error":
      return (
        <form
          onSubmit={handleSubmit}
          className="relative z-20 mt-4 w-full max-w-xl pointer-events-auto lg:mt-10"
        >
          <label htmlFor="studio-email" className="sr-only">
            Email address
          </label>
          <p className="font-sans text-sm leading-relaxed text-[#D32F27]/85 sm:text-base">
            Get updates on projects, launches, and more.
          </p>
          <div className="mt-3 flex min-w-0 items-center gap-2 sm:mt-4 sm:gap-3">
            <input
              id="studio-email"
              type="email"
              name="email"
              autoComplete="email"
              inputMode="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Email"
              disabled={status === "submitting"}
              className="min-h-11 min-w-0 flex-1 border border-[#D32F27]/35 bg-[#F4EBD8] px-3.5 py-3 font-sans text-base text-[#D32F27] outline-none placeholder:text-[#D32F27]/40 focus:border-[#D32F27] disabled:opacity-60 lg:flex-none lg:w-64"
            />
            <input
              type="text"
              name="website"
              tabIndex={-1}
              autoComplete="off"
              value={website}
              onChange={(event) => setWebsite(event.target.value)}
              className="absolute -left-[9999px] h-0 w-0 opacity-0"
              aria-hidden
            />
            <button
              type="submit"
              disabled={status === "submitting"}
              className="min-h-11 min-w-[4.75rem] shrink-0 bg-[#FFD000] px-5 py-3 font-display text-base tracking-[0.12em] text-[#D32F27] [clip-path:polygon(0_18%,74%_0,100%_30%,90%_100%,8%_86%)] transition-transform hover:scale-[1.04] disabled:opacity-60 lg:px-6"
            >
              {status === "submitting" ? "Sending" : "Join"}
            </button>
          </div>
          {status === "error" && message ? (
            <p className="mt-2 font-sans text-sm text-[#D32F27]" role="alert">
              {message}
            </p>
          ) : null}
        </form>
      );
    default: {
      const _exhaustive: never = status;
      return _exhaustive;
    }
  }
}
