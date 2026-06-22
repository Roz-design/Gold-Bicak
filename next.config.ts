import type { NextConfig } from "next";

const adminSecret = process.env.ADMIN_SECRET_PATH || "gb-panel-x7k9m2";

const nextConfig: NextConfig = {
  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.pexels.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: `/${adminSecret}`,
        destination: "/admin",
      },
      {
        source: `/${adminSecret}/:path*`,
        destination: "/admin/:path*",
      },
      {
        source: `/api/${adminSecret}/:path*`,
        destination: "/api/admin/:path*",
      },
    ];
  },
};

export default nextConfig;
