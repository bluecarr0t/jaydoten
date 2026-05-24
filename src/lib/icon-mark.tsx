import { ImageResponse } from "next/og";

const INSTRUMENT_SERIF_ITALIC =
  "https://fonts.gstatic.com/s/instrumentserif/v5/jizHRFtNs2ka5fXjeivQ4LroWlx-6zATiw.ttf";

const palette = {
  mist: "#FBF5E9",
  peach: "#E89B6B",
  lilac: "#C9B8E2",
  sky: "#A6C9DE",
  ink: "#2A1B2E",
};

async function loadInstrumentSerif() {
  return fetch(INSTRUMENT_SERIF_ITALIC).then((res) => res.arrayBuffer());
}

export async function createJaydotenIcon(size: number) {
  const font = await loadInstrumentSerif();
  const fontSize = Math.round(size * 0.46);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "50%",
          background: `radial-gradient(circle at 32% 28%, ${palette.mist} 0%, ${palette.peach} 38%, ${palette.lilac} 68%, ${palette.sky} 100%)`,
        }}
      >
        <div
          style={{
            fontFamily: "Instrument Serif",
            fontStyle: "italic",
            fontSize,
            color: palette.ink,
            letterSpacing: "-0.03em",
            marginTop: size * 0.04,
          }}
        >
          J.N
        </div>
      </div>
    ),
    {
      width: size,
      height: size,
      fonts: [
        {
          name: "Instrument Serif",
          data: font,
          style: "italic",
          weight: 400,
        },
      ],
    },
  );
}
