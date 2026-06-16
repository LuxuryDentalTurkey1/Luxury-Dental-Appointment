import { ImageResponse } from "next/og";

// Branded link-preview image (shown on WhatsApp, iMessage, social, etc.)
export const alt = "Luxury Dental Turkey";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#111111",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -190,
            left: -190,
            width: 700,
            height: 700,
            borderRadius: 9999,
            background: "radial-gradient(circle, rgba(197,162,83,0.5), rgba(17,17,17,0) 70%)",
            display: "flex",
          }}
        />
        <div style={{ display: "flex", alignItems: "center", fontSize: 84, fontWeight: 800, letterSpacing: -2 }}>
          <span style={{ color: "#ffffff" }}>Luxury Dental</span>
          <span style={{ color: "#c5a253", marginLeft: 22 }}>Turkey</span>
        </div>
        <div style={{ display: "flex", marginTop: 30, fontSize: 40, color: "#eaeaea" }}>
          Your new life is one consultation away.
        </div>
        <div style={{ display: "flex", alignItems: "center", marginTop: 48, fontSize: 27, color: "#c5a253" }}>
          <span>Face-to-face in Bournemouth</span>
          <span style={{ margin: "0 16px", color: "#857449" }}>•</span>
          <span>Online worldwide</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
