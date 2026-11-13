import { ImageResponse } from "next/og";

export const shareSize = { width: 1200, height: 630 };
export const shareContentType = "image/png";
export const shareAlt =
  "Ram Ganga Agro. Good food begins long before the table.";

/** The sharing card. It uses the approved line and no photograph. */
export function shareImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#F4EFE6",
          padding: "72px",
          color: "#1C1915",
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <div
            style={{
              width: "48px",
              height: "2px",
              background: "#6E2A32",
              marginRight: "18px",
            }}
          />
          <div
            style={{
              fontSize: 22,
              letterSpacing: "0.18em",
              color: "#1C3328",
            }}
          >
            RAM GANGA AGRO
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 68,
              lineHeight: 1.05,
              letterSpacing: "-0.02em",
              maxWidth: "920px",
            }}
          >
            Good food begins long before the table.
          </div>
          <div
            style={{
              fontSize: 28,
              lineHeight: 1.4,
              color: "#3A342C",
              marginTop: "24px",
              maxWidth: "760px",
            }}
          >
            A farm, its crops, and the journey from the land to the table.
          </div>
        </div>
      </div>
    ),
    shareSize,
  );
}
