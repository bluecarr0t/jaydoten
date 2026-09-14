/** Build a hotlink URL for images.unsplash.com (dev mock frames only). */
export function unsplashImageUrl(
  photoId: string,
  options: { width?: number; height?: number } = {},
): string {
  const { width = 1400, height } = options;
  const params = new URLSearchParams({
    auto: "format",
    fit: "crop",
    w: String(width),
    q: "85",
  });
  if (height) params.set("h", String(height));
  return `https://images.unsplash.com/photo-${photoId}?${params.toString()}`;
}
