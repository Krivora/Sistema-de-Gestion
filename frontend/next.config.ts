import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/uploads/:path*",
        destination: "http://localhost:4000/uploads/:path*",
      },
    ];
  },
  // Solo aplica en desarrollo. Comodín por subnet para que un cambio de IP
  // por DHCP no tumbe el WebSocket de HMR.
  allowedDevOrigins: ['192.168.45.*'],
};

export default nextConfig;