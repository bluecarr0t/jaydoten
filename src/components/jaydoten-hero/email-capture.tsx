"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";

type CaptureStatus = "idle" | "submitting" | "success" | "error";

export function EmailCapture({
  onOpenChange,
}: {
  onOpenChange?: (open: boolean) => void;
}) {
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [status, setStatus] = useState<CaptureStatus>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    emailRef.current?.focus();
  }, [open]);

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
          className="relative z-20 w-full basis-full font-sans text-sm leading-relaxed text-[#D32F27]/85 lg:mt-10 lg:text-base"
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
        <>
          {open ? null : (
            <button
              type="button"
              aria-expanded={false}
              aria-controls="studio-email-form"
              onClick={() => {
                setOpen(true);
                onOpenChange?.(true);
              }}
              className="relative z-20 inline-flex items-center px-3.5 py-1.5 font-sans text-[0.8rem] leading-none text-[#D32F27] pointer-events-auto xl:hidden"
            >
              <span
                aria-hidden
                className="absolute inset-0 bg-[#FFD000] [clip-path:polygon(2%_32%,12%_0%,86%_6%,100%_22%,96%_78%,78%_100%,4%_94%,0%_48%)]"
              />
              <span
                aria-hidden
                className="absolute inset-[2.5px] bg-[#F4EBD8] [clip-path:polygon(2%_32%,12%_0%,86%_6%,100%_22%,96%_78%,78%_100%,4%_94%,0%_48%)]"
              />
              <span className="relative">Stay in the know</span>
            </button>
          )}
          <form
            id="studio-email-form"
            onSubmit={handleSubmit}
            className={
              open
                ? "relative z-20 mt-1 w-full basis-full pointer-events-auto"
                : "relative z-20 hidden w-full basis-full pointer-events-auto xl:mt-10 xl:block"
            }
          >
            <label htmlFor="studio-email" className="sr-only">
              Email address
            </label>
            <p className="font-sans text-sm leading-relaxed text-[#D32F27]/85 sm:text-base">
              Get updates on projects, launches, and more.
            </p>
            <div className="mt-3 flex min-w-0 items-center gap-2 sm:mt-4 sm:gap-3">
              <input
                ref={emailRef}
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
        </>
      );
    default: {
      const _exhaustive: never = status;
      return _exhaustive;
    }
  }
}
