import { ImageResponse } from "next/og";

const RED = "#D32F27";
const CREAM = "#F4EBD8";

export function createJaydotenIcon(size: number) {
  const width = Math.round(size * 0.7);
  const height = Math.round(size * 0.86);
  const stem = Math.round(size * 0.3);
  const hook = Math.round(size * 0.24);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: CREAM,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            width,
            height,
          }}
        >
          <div
            style={{
              width: stem,
              height: height - hook,
              background: RED,
            }}
          />
          <div
            style={{
              width,
              height: hook,
              background: RED,
              borderBottomLeftRadius: hook,
              borderBottomRightRadius: Math.round(stem * 0.45),
            }}
          />
        </div>
      </div>
    ),
    {
      width: size,
      height: size,
    },
  );
}
