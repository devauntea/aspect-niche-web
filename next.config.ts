import type { NextConfig } from "next";

// Security headers on every response. Vercel already sends HSTS; these cover
// the rest of what a browser can be told without changing how pages render.
//
// The Content-Security-Policy is deliberately the baseline that cannot break a
// statically rendered Next.js page: it forbids being framed (clickjacking),
// plugins, a rewritten <base>, and forms posting off-site. It does not yet
// restrict scripts -- that needs per-request nonces, which means dynamic
// rendering, and is tracked as its own piece of work.
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()",
  },
  {
    key: "Content-Security-Policy",
    value: "frame-ancestors 'none'; base-uri 'self'; object-src 'none'; form-action 'self'",
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
