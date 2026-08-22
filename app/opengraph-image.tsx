import { ImageResponse } from "next/og";
import { site } from "@/lib/content";

export const alt = `${site.name} — media production, advertising and social media`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * The share card, in the site's own language: drenched black, the bolt cut
 * through the corner, slate metadata along the bottom.
 *
 * Deliberately no remote font fetch — a share card that fails to render because
 * a font host was slow is worse than one set in the platform default.
 */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#050505",
          color: "#ffffff",
          padding: "72px 80px",
          position: "relative",
        }}
      >
        {/* The bolt, cut by the right edge. */}
        <svg
          viewBox="0 0 100 160"
          width="420"
          height="672"
          style={{ position: "absolute", right: -60, top: -30, opacity: 0.07 }}
        >
          <path d="M62 0 L12 88 L40 82 L32 160 L88 68 L58 74 Z" fill="#ffffff" />
        </svg>

        <div style={{ display: "flex", fontSize: 26, letterSpacing: 6, opacity: 0.62 }}>
          KICKSTART CREATIVE STUDIO
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 96,
            fontWeight: 800,
            lineHeight: 1.02,
            letterSpacing: -3,
            maxWidth: 900,
          }}
        >
          We make brands look remarkable.
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 24,
            letterSpacing: 5,
            opacity: 0.62,
            borderTop: "1px solid rgba(255,255,255,0.16)",
            paddingTop: 28,
          }}
        >
          <span>MEDIA PRODUCTION</span>
          <span>ADVERTISING</span>
          <span>SOCIAL</span>
        </div>
      </div>
    ),
    size,
  );
}
