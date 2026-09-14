# Gallery assets

JPEG or WebP files for the Pacific Walk gallery. Each camera has its own folder:

- `leica-xe/` — Leica X-E Typ 102 (2014)
- `polaroid-sx70/` — Polaroid XS-70 (1977)

## Storage

| Environment | Images | Metadata (`titles`, captions, …) |
|-------------|--------|----------------------------------|
| **Local dev** (no Blob token) | `public/gallery/<camera>/` (gitignored) | `data/gallery-works.json` (gitignored) |
| **Vercel** (with `BLOB_READ_WRITE_TOKEN`) | Vercel Blob at `gallery/<camera>/<filename>` | Blob at `gallery/meta/gallery-works.json` |

When Blob is configured, `/gallery` and `/admin` work on production previews and prod—not only `next dev`.

## File names

Match filenames in gallery metadata (e.g. `santa-monica-01.jpg`). Uploaded files override Unsplash mocks for that slot.

## Admin

1. Copy `.env.example` → `.env.local` and set `GALLERY_ADMIN_PASSWORD`
2. For Blob (local or Vercel): set `BLOB_READ_WRITE_TOKEN` (`vercel env pull` after creating a Blob store)
3. Open `/admin` → upload and edit at `/admin/gallery`

Optional: `AI_GATEWAY_API_KEY` for auto-tag on upload.

## Migrate local files to Blob

With `BLOB_READ_WRITE_TOKEN` in `.env.local`:

```bash
node scripts/sync-gallery-to-blob.mjs
```

Uploads images from `public/gallery/` and copies `data/gallery-works.json` if present.
