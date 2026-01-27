import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  allowedDevOrigins: [
    'http://10.33.33.5:3012',
    'https://capstone.lab.if.unismuh.ac.id',
    'https://capston.lab.if.unismuh.ac.id',
  ],
};

export default nextConfig;
