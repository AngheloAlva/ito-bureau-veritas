import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Local browser persistence does not need Cache Components or partial prefetching.
  reactCompiler: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
