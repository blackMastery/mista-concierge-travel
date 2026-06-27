import { ImageResponse } from "next/og";

// Generated favicon — brand "M" mark. Next.js auto-injects the icon link.
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          background: "#1B7A5C",
          color: "#F7F3EA",
          fontSize: 22,
          fontWeight: 700,
          fontFamily: "sans-serif",
          borderRadius: 6,
        }}
      >
        M
      </div>
    ),
    { ...size },
  );
}
