"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { GalleryCameraId } from "@/lib/gallery-cameras";
import type { GalleryLocation, GalleryWork } from "@/lib/gallery-content";
import { locationLabels } from "@/lib/gallery-content";

type AdminWork = GalleryWork & {
  hasFile: boolean;
  previewUrl: string | null;
};

type AdminCamera = {
  id: GalleryCameraId;
  label: string;
  year: number;
  works: AdminWork[];
};

const inputClass =
  "w-full border border-[#141414]/12 bg-white px-2 py-1.5 text-sm text-[#141414] outline-none focus:border-[#141414]/40";

function formatCapturedAt(value?: string): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function workMatchesQuery(work: GalleryWork, query: string): boolean {
  if (!query) return true;
  const haystack = [
    work.title,
    work.caption,
    work.filename,
    work.location,
    String(work.year),
    work.capturedAt ?? "",
    ...work.tags,
  ]
    .join(" ")
    .toLowerCase();
  return haystack.includes(query);
}

function parseTagsInput(value: string): string[] {
  const seen = new Set<string>();
  const tags: string[] = [];
  for (const part of value.split(/[,;]+/)) {
    const tag = part.trim().toLowerCase();
    if (!tag || seen.has(tag)) continue;
    seen.add(tag);
    tags.push(tag);
  }
  return tags;
}

export function GalleryAdminPanel() {
  const [works, setWorks] = useState<GalleryWork[]>([]);
  const [cameras, setCameras] = useState<AdminCamera[]>([]);
  const [cameraId, setCameraId] = useState<GalleryCameraId>("leica-xe");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [autoTag, setAutoTag] = useState(true);
  const [aiAvailable, setAiAvailable] = useState<boolean | null>(null);
  const [aiModel, setAiModel] = useState<string | null>(null);
  const [storage, setStorage] = useState<"blob" | "local" | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const response = await fetch("/api/admin/works");
    if (response.status === 401) {
      window.location.href = "/admin";
      return;
    }
    if (!response.ok) {
      setError("Could not load gallery data.");
      setLoading(false);
      return;
    }
    const data = (await response.json()) as {
      works: GalleryWork[];
      cameras: AdminCamera[];
      storage?: "blob" | "local";
    };
    setWorks(data.works);
    setCameras(data.cameras);
    setStorage(data.storage ?? null);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    void (async () => {
      const response = await fetch("/api/admin/ai-status");
      if (!response.ok) return;
      const data = (await response.json()) as {
        available: boolean;
        model: string;
      };
      setAiAvailable(data.available);
      setAiModel(data.model);
      if (!data.available) setAutoTag(false);
    })();
  }, []);

  const activeCamera = useMemo(
    () => cameras.find((camera) => camera.id === cameraId),
    [cameras, cameraId],
  );

  const cameraTags = useMemo(() => {
    if (!activeCamera) return [];
    const tagSet = new Set<string>();
    for (const row of activeCamera.works) {
      const editable = works.find((work) => work.id === row.id);
      for (const tag of editable?.tags ?? row.tags ?? []) {
        tagSet.add(tag);
      }
    }
    return [...tagSet].sort();
  }, [activeCamera, works]);

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const rows = useMemo(() => {
    if (!activeCamera) return [];
    return activeCamera.works
      .map((row) => {
        const editable = works.find((work) => work.id === row.id);
        return editable ? { row, editable } : null;
      })
      .filter((entry): entry is { row: AdminWork; editable: GalleryWork } =>
        Boolean(entry),
      )
      .filter(({ editable }) => {
        if (activeTag && !editable.tags.includes(activeTag)) return false;
        return workMatchesQuery(editable, normalizedQuery);
      });
  }, [activeCamera, works, normalizedQuery, activeTag]);

  const updateWork = useCallback((id: string, patch: Partial<GalleryWork>) => {
    setWorks((current) =>
      current.map((work) => (work.id === id ? { ...work, ...patch } : work)),
    );
  }, []);

  const handleSave = useCallback(async () => {
    setSaving(true);
    setMessage(null);
    setError(null);

    const response = await fetch("/api/admin/works", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ works }),
    });

    setSaving(false);

    if (!response.ok) {
      setError("Could not save descriptions.");
      return;
    }

    setMessage("Descriptions saved.");
    await load();
  }, [works, load]);

  const uploadFiles = useCallback(
    async (files: FileList | File[], targetWorkId?: string) => {
      const list = Array.from(files);
      if (list.length === 0) return;

      setUploading(true);
      setMessage(null);
      setError(null);

      const form = new FormData();
      form.set("cameraId", cameraId);
      form.set("autoTag", autoTag ? "true" : "false");
      if (targetWorkId) {
        form.set("workId", targetWorkId);
        form.append("files", list[0]!);
      } else {
        form.set("mode", "create");
        for (const file of list) {
          form.append("files", file);
        }
      }

      const response = await fetch("/api/admin/upload", {
        method: "POST",
        body: form,
      });

      setUploading(false);

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        setError(data.error ?? "Upload failed.");
        return;
      }

      const data = (await response.json()) as {
        uploaded: {
          workId: string;
          filename: string;
          ai?: {
            tagged: boolean;
            title?: string;
            tags?: string[];
            capturedAt?: string;
          };
        }[];
        skipped?: string[];
        tagErrors?: { workId: string; message: string }[];
      };

      const taggedCount = data.uploaded.filter(
        (entry) => entry.ai?.tagged,
      ).length;
      const skippedNote =
        data.skipped && data.skipped.length > 0
          ? ` Skipped ${data.skipped.length} unmatched file(s).`
          : "";
      const taggedNote =
        taggedCount > 0
          ? ` AI analyzed ${taggedCount} image(s) (tags, location, timestamp).`
          : autoTag && aiAvailable
            ? " EXIF metadata applied; set AI_GATEWAY_API_KEY for AI tagging."
            : " EXIF metadata applied where available.";
      const tagErrorNote =
        data.tagErrors && data.tagErrors.length > 0
          ? ` ${data.tagErrors.length} auto-tag error(s).`
          : "";

      setMessage(
        `Uploaded ${data.uploaded.length} image(s).${taggedNote}${skippedNote}${tagErrorNote}`,
      );
      if (data.tagErrors && data.tagErrors.length > 0) {
        setError(data.tagErrors.map((entry) => entry.message).join(" · "));
      }
      await load();
    },
    [autoTag, aiAvailable, cameraId, load],
  );

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "s") {
        event.preventDefault();
        void handleSave();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleSave]);

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.href = "/admin";
  }

  if (loading) {
    return (
      <p className="font-mono text-[11px] tracking-[0.2em] text-[#141414]/50 uppercase">
        Loading…
      </p>
    );
  }

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-start justify-between gap-4 border-b border-[#141414]/10 pb-4">
        <div>
          <Link
            href="/gallery"
            className="font-mono text-[11px] tracking-[0.2em] text-[#141414]/45 uppercase hover:text-[#141414]"
          >
            ← View gallery
          </Link>
          <h1 className="mt-2 font-serif text-2xl text-[#141414]">
            Gallery admin
          </h1>
          <p className="mt-1 text-xs text-[#141414]/55">
            Bulk upload creates new entries · AI tags location &amp; timestamp ·{" "}
            <kbd className="rounded border border-[#141414]/15 px-1 font-mono text-[10px]">
              ⌘S
            </kbd>{" "}
            to save
            {storage ? (
              <>
                {" "}
                · Storage:{" "}
                {storage === "blob" ? "Vercel Blob" : "local disk"}
              </>
            ) : null}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={saving || uploading}
            className="bg-[#141414] px-4 py-2 font-mono text-[10px] tracking-[0.16em] text-[#f4f1eb] uppercase disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save all"}
          </button>
          <button
            type="button"
            onClick={() => void handleLogout()}
            className="border border-[#141414]/20 px-4 py-2 font-mono text-[10px] tracking-[0.16em] text-[#141414]/70 uppercase"
          >
            Sign out
          </button>
        </div>
      </header>

      {message ? (
        <p className="text-xs text-[#141414]/70" role="status">
          {message}
        </p>
      ) : null}
      {error ? (
        <p className="text-xs text-red-700" role="alert">
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {cameras.map((camera) => (
            <button
              key={camera.id}
              type="button"
              onClick={() => {
                setCameraId(camera.id);
                setActiveTag(null);
              }}
              className={`rounded-md px-3 py-1.5 font-mono text-[10px] tracking-[0.14em] uppercase ${
                cameraId === camera.id
                  ? "bg-[#141414] text-[#f4f1eb]"
                  : "border border-[#141414]/15 text-[#141414]/55"
              }`}
            >
              {camera.label} ({camera.year})
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <label
            className={`flex items-center gap-2 font-mono text-[10px] tracking-[0.12em] uppercase ${
              aiAvailable === false
                ? "cursor-not-allowed text-[#141414]/35"
                : "cursor-pointer text-[#141414]/60"
            }`}
            title={
              aiAvailable === false
                ? "Set AI_GATEWAY_API_KEY in .env.local (vercel env pull)"
                : aiModel
                  ? `Model: ${aiModel}`
                  : undefined
            }
          >
            <input
              type="checkbox"
              checked={autoTag && aiAvailable !== false}
              disabled={uploading || aiAvailable === false}
              onChange={(event) => setAutoTag(event.target.checked)}
              className="size-3.5 accent-[#141414]"
            />
            Analyze with AI
          </label>
          <BulkUploadButton
            disabled={uploading}
            onFiles={(files) => void uploadFiles(files)}
          />
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <input
          type="search"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Search title, tags, location, date…"
          className={`${inputClass} max-w-md`}
          aria-label="Search gallery"
        />
        <p className="font-mono text-[10px] tracking-[0.1em] text-[#141414]/45 uppercase">
          {rows.length} image{rows.length === 1 ? "" : "s"}
          {normalizedQuery || activeTag ? " (filtered)" : ""}
        </p>
      </div>

      {cameraTags.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-[9px] tracking-[0.14em] text-[#141414]/40 uppercase">
            Categories
          </span>
          <button
            type="button"
            onClick={() => setActiveTag(null)}
            className={`rounded-full px-2.5 py-1 font-mono text-[9px] tracking-[0.08em] uppercase ${
              activeTag === null
                ? "bg-[#141414] text-[#f4f1eb]"
                : "border border-[#141414]/15 text-[#141414]/50"
            }`}
          >
            All
          </button>
          {cameraTags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => setActiveTag(activeTag === tag ? null : tag)}
              className={`rounded-full px-2.5 py-1 font-mono text-[9px] tracking-[0.08em] uppercase ${
                activeTag === tag
                  ? "bg-[#141414] text-[#f4f1eb]"
                  : "border border-[#141414]/15 text-[#141414]/50 hover:border-[#141414]/30"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-md border border-[#141414]/15 bg-white/40">
        <div className="max-h-[calc(100dvh-16rem)] overflow-auto">
          <table className="w-full min-w-[980px] border-collapse text-left">
            <thead className="sticky top-0 z-10 bg-[#ebe6dc] shadow-[0_1px_0_rgba(20,20,20,0.08)]">
              <tr className="font-mono text-[9px] tracking-[0.14em] text-[#141414]/50 uppercase">
                <th className="w-9 px-2 py-2.5">#</th>
                <th className="w-[100px] px-2 py-2.5">Thumb</th>
                <th className="w-[96px] max-w-[96px] px-2 py-2.5">Filename</th>
                <th className="w-[120px] px-2 py-2.5">Title</th>
                <th className="w-[160px] max-w-[160px] px-2 py-2.5">Description</th>
                <th className="w-[140px] px-2 py-2.5">Tags</th>
                <th className="w-[100px] px-2 py-2.5">Location</th>
                <th className="w-[120px] px-2 py-2.5">Captured</th>
                <th className="w-[56px] px-2 py-2.5">Year</th>
                <th className="w-[72px] px-2 py-2.5 text-right">Image</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={10}
                    className="px-4 py-8 text-center text-xs text-[#141414]/45"
                  >
                    {normalizedQuery || activeTag
                      ? "No images match your search."
                      : "No images yet — drop files on Bulk upload."}
                  </td>
                </tr>
              ) : (
                rows.map(({ row, editable }, index) => (
                  <tr
                    key={row.id}
                    className={`border-t border-[#141414]/8 align-top ${
                      row.hasFile ? "bg-white/60" : "bg-[#141414]/[0.02]"
                    }`}
                  >
                    <td className="px-2 py-2 font-mono text-[10px] text-[#141414]/35">
                      {String(index + 1).padStart(2, "0")}
                    </td>
                    <td className="px-2 py-2">
                      <div className="relative aspect-[3/2] w-[88px] overflow-hidden bg-[#1a1a1a]">
                        {row.previewUrl ? (
                          <Image
                            src={row.previewUrl}
                            alt=""
                            fill
                            className="object-cover"
                            sizes="88px"
                            unoptimized
                          />
                        ) : (
                          <span className="flex h-full items-center justify-center font-mono text-[7px] text-white/35 uppercase">
                            —
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="w-[96px] max-w-[96px] px-2 py-2">
                      <p className="font-mono text-[9px] leading-snug text-[#141414]/55 break-all">
                        {row.filename}
                      </p>
                      {row.hasFile ? (
                        <span className="mt-0.5 inline-block font-mono text-[8px] tracking-[0.1em] text-emerald-800/70 uppercase">
                          ok
                        </span>
                      ) : null}
                    </td>
                    <td className="px-2 py-2">
                      <input
                        value={editable.title}
                        onChange={(event) =>
                          updateWork(row.id, { title: event.target.value })
                        }
                        className={inputClass}
                        aria-label={`Title for ${row.filename}`}
                      />
                    </td>
                    <td className="w-[160px] max-w-[160px] px-2 py-2">
                      <textarea
                        value={editable.caption}
                        onChange={(event) =>
                          updateWork(row.id, { caption: event.target.value })
                        }
                        rows={2}
                        placeholder="Lightbox description…"
                        className={`${inputClass} min-h-[2.75rem] resize-y leading-snug`}
                        aria-label={`Description for ${row.filename}`}
                      />
                    </td>
                    <td className="px-2 py-2">
                      <input
                        value={editable.tags.join(", ")}
                        onChange={(event) =>
                          updateWork(row.id, {
                            tags: parseTagsInput(event.target.value),
                          })
                        }
                        placeholder="sunset, boardwalk…"
                        className={inputClass}
                        aria-label={`Tags for ${row.filename}`}
                      />
                      {editable.tags.length > 0 ? (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {editable.tags.slice(0, 4).map((tag) => (
                            <span
                              key={tag}
                              className="rounded bg-[#141414]/6 px-1 py-0.5 font-mono text-[8px] text-[#141414]/55"
                            >
                              {tag}
                            </span>
                          ))}
                          {editable.tags.length > 4 ? (
                            <span className="font-mono text-[8px] text-[#141414]/35">
                              +{editable.tags.length - 4}
                            </span>
                          ) : null}
                        </div>
                      ) : null}
                    </td>
                    <td className="px-2 py-2">
                      <select
                        value={editable.location}
                        onChange={(event) =>
                          updateWork(row.id, {
                            location: event.target.value as GalleryLocation,
                          })
                        }
                        className={inputClass}
                        aria-label={`Location for ${row.filename}`}
                      >
                        {Object.entries(locationLabels).map(([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-2 py-2">
                      <p className="font-mono text-[9px] leading-snug text-[#141414]/55">
                        {formatCapturedAt(editable.capturedAt)}
                      </p>
                    </td>
                    <td className="px-2 py-2">
                      <input
                        type="number"
                        value={editable.year}
                        onChange={(event) =>
                          updateWork(row.id, {
                            year: Number(event.target.value),
                          })
                        }
                        className={inputClass}
                        aria-label={`Year for ${row.filename}`}
                      />
                    </td>
                    <td className="px-2 py-2 text-right">
                      <label className="inline-block cursor-pointer font-mono text-[9px] tracking-[0.12em] text-[#141414]/55 uppercase hover:text-[#141414]">
                        Replace
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          disabled={uploading}
                          className="sr-only"
                          onChange={(event) => {
                            const file = event.target.files?.[0];
                            if (file) void uploadFiles([file], row.id);
                            event.target.value = "";
                          }}
                        />
                      </label>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function BulkUploadButton({
  disabled,
  onFiles,
}: {
  disabled: boolean;
  onFiles: (files: FileList) => void;
}) {
  const [dragOver, setDragOver] = useState(false);

  return (
    <label
      className={`inline-flex cursor-pointer items-center gap-2 border border-dashed px-3 py-1.5 font-mono text-[10px] tracking-[0.14em] uppercase transition ${
        dragOver
          ? "border-[#141414] bg-[#141414]/5 text-[#141414]"
          : "border-[#141414]/25 text-[#141414]/55 hover:border-[#141414]/40"
      } ${disabled ? "pointer-events-none opacity-50" : ""}`}
      onDragOver={(event) => {
        event.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(event) => {
        event.preventDefault();
        setDragOver(false);
        if (event.dataTransfer.files.length > 0) {
          onFiles(event.dataTransfer.files);
        }
      }}
    >
      Bulk upload
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        disabled={disabled}
        className="sr-only"
        onChange={(event) => {
          if (event.target.files) onFiles(event.target.files);
          event.target.value = "";
        }}
      />
    </label>
  );
}
