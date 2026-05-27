import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  cacheComponents: true,

  async headers () {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=()",
          },
          {
            key: "Content-Security-Policy",
            value: [
                "default-src 'self'",
                "script-src 'self' 'unsafe-inline' https://clerk.com https://*.clerk.accounts.dev https://*.clerk.com",
                "style-src 'self' 'unsafe-inline'",
                "img-src 'self' data: https: blob:",
                "font-src 'self' data:",
                "connect-src 'self' https://api.clerk.com https://*.clerk.accounts.dev https://clerk.com https://*.uploadthing.com https://api.inngest.com wss://*.clerk.accounts.dev",
                "frame-src https://clerk.com https://*.clerk.accounts.dev",
                "frame-ancestors 'none'",
                "base-uri 'self'",
                "form-action 'self'"
            ].join("; ")
          }
        ]
      }
    ]
  }
};

export default nextConfig;
