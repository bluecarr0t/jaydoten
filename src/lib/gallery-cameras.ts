export type GalleryCameraId = "leica-xe" | "polaroid-sx70";

/** Leica X2 / X-E APS-C sensor — landscape 3:2 (width × height). */
export const LEICA_3_2_WIDTH = 1800;
export const LEICA_3_2_HEIGHT = 1200;

export type GalleryCamera = {
  id: GalleryCameraId;
  label: string;
  year: number;
  /** Layout classes for real photographs (no color grading). */
  imageClass: string;
  /** Optional stylistic filters for Unsplash placeholders only. */
  mockImageClass?: string;
  /** Optional per-camera frame overrides (defaults to none). */
  frameClass?: string;
  /** Locks every frame to sensor aspect ratio (Leica 3:2). */
  frameAspectClass?: string;
};

export const galleryCameras: GalleryCamera[] = [
  {
    id: "leica-xe",
    label: "Leica X-E Typ 102",
    year: 2014,
    imageClass: "object-cover",
    mockImageClass:
      "object-cover contrast-[1.06] saturate-[0.82] sepia-[0.14]",
    frameAspectClass:
      "aspect-[3/2] h-[min(100cqh,calc(100cqw*2/3))] w-[min(100cqw,calc(100cqh*3/2))]",
  },
  {
    id: "polaroid-sx70",
    label: "Polaroid XS-70",
    year: 1977,
    imageClass: "object-cover",
    mockImageClass:
      "object-cover contrast-[1.1] saturate-[1.12] brightness-[1.04] sepia-[0.22]",
  },
];

/** Unsplash mock ids per camera (work id → photo id). */
export const cameraMockPhotoIds: Record<
  GalleryCameraId,
  Record<string, string>
> = {
  "leica-xe": {
    "sm-01": "1500530855697-b586d89ba3ee",
    "sm-02": "1516035069371-29a1b244cc32",
    "sm-03": "1507525428034-b723cf961d3e",
    "sm-04": "1558618666-fcd25c85cd64",
    "sm-05": "1469854523086-cc02fe5d8800",
    "sm-06": "1519501025264-65ba15a82390",
    "vb-01": "1529156069898-49953e39b3ac",
    "vb-02": "1516321497487-e288fb19713f",
    "vb-03": "1501594907352-04cda38ebc29",
    "vb-04": "1524661135-423995f22d0b",
    "vb-05": "1469474968028-56623f02e42e",
    "vb-06": "1469334031218-e382a71b716b",
  },
  "polaroid-sx70": {
    "sm-01": "1506905925346-21bda4d32df4",
    "sm-02": "1502920917128-1aa500764cbd",
    "sm-03": "1524661135-423995f22d0b",
    "sm-04": "1519501025264-65ba15a82390",
    "sm-05": "1501594907352-04cda38ebc29",
    "sm-06": "1558618666-fcd25c85cd64",
    "vb-01": "1469474968028-56623f02e42e",
    "vb-02": "1469334031218-e382a71b716b",
    "vb-03": "1516321497487-e288fb19713f",
    "vb-04": "1529156069898-49953e39b3ac",
    "vb-05": "1500530855697-b586d89ba3ee",
    "vb-06": "1516035069371-29a1b244cc32",
  },
};

export function galleryCameraLabel(camera: GalleryCamera): string {
  return `${camera.label} (${camera.year})`;
}

export function galleryLocalDir(cameraId: GalleryCameraId): string {
  return cameraId === "leica-xe" ? "leica-xe" : "polaroid-sx70";
}
