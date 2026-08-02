import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** Home-screen icon for iOS, generated from the same mark as icon.svg. */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #6366f1, #ec4899)",
        }}
      >
        <div
          style={{
            width: 84,
            height: 84,
            borderRadius: 999,
            border: "24px solid #ffffff",
          }}
        />
      </div>
    ),
    size
  );
}
