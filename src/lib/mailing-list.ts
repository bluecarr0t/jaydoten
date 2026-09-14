import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { get, put } from "@vercel/blob";
import { isGalleryBlobStorage } from "@/lib/gallery-blob";

const DATA_DIR = path.join(process.cwd(), "data");
const LOCAL_PATH = path.join(DATA_DIR, "mailing-list.json");
const BLOB_PATHNAME = "studio/mailing-list.json";

type MailingListFile = {
  subscribers: Subscriber[];
};

export type Subscriber = {
  email: string;
  createdAt: string;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

export function isValidEmail(value: string): boolean {
  if (value.length < 5 || value.length > 254) {
    return false;
  }
  return EMAIL_PATTERN.test(value);
}

function emptyList(): MailingListFile {
  return { subscribers: [] };
}

function ensureDataDir(): void {
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readLocal(): MailingListFile {
  ensureDataDir();
  if (!existsSync(LOCAL_PATH)) {
    const seed = emptyList();
    writeFileSync(LOCAL_PATH, JSON.stringify(seed, null, 2), "utf8");
    return seed;
  }

  const parsed = JSON.parse(readFileSync(LOCAL_PATH, "utf8")) as MailingListFile;
  return {
    subscribers: Array.isArray(parsed.subscribers) ? parsed.subscribers : [],
  };
}

function writeLocal(file: MailingListFile): MailingListFile {
  ensureDataDir();
  writeFileSync(LOCAL_PATH, JSON.stringify(file, null, 2), "utf8");
  return file;
}

async function streamToText(stream: ReadableStream<Uint8Array>): Promise<string> {
  return new Response(stream).text();
}

async function readBlob(): Promise<MailingListFile> {
  const result = await get(BLOB_PATHNAME, {
    access: "private",
    useCache: false,
  });
  if (!result || result.statusCode !== 200 || !result.stream) {
    return emptyList();
  }

  try {
    const parsed = JSON.parse(await streamToText(result.stream)) as MailingListFile;
    return {
      subscribers: Array.isArray(parsed.subscribers) ? parsed.subscribers : [],
    };
  } catch {
    return emptyList();
  }
}

async function writeBlob(file: MailingListFile): Promise<MailingListFile> {
  await put(BLOB_PATHNAME, JSON.stringify(file, null, 2), {
    access: "private",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
  });
  return file;
}

export async function addSubscriber(
  email: string,
): Promise<{ email: string; created: boolean }> {
  const normalized = normalizeEmail(email);
  const list = isGalleryBlobStorage() ? await readBlob() : readLocal();
  const existing = list.subscribers.find(
    (subscriber) => subscriber.email === normalized,
  );
  if (existing) {
    return { email: normalized, created: false };
  }

  const next: MailingListFile = {
    subscribers: [
      ...list.subscribers,
      { email: normalized, createdAt: new Date().toISOString() },
    ],
  };

  if (isGalleryBlobStorage()) {
    await writeBlob(next);
  } else {
    writeLocal(next);
  }

  return { email: normalized, created: true };
}
