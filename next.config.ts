import type { NextConfig } from "next";
const config: NextConfig = {
  agentRules: false,
  devIndicators: false,
  distDir: process.env.SMF_NEXT_DIST_DIR || ".next",
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com", pathname: "/**" },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Content-Security-Policy",
            value:
              "object-src 'none'; base-uri 'self'; frame-ancestors 'none'; frame-src https://www.youtube-nocookie.com https://www.google.com/maps/embed https://www.google.com/maps; form-action 'self'",
          },
        ],
      },
    ];
  },
};
export default config;
