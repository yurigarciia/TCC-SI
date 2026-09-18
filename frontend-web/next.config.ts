import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Output leve pro Docker (Cloud Run) — empacota só o necessário pra rodar, sem o node_modules
  // inteiro. Ver Dockerfile.
  output: "standalone",
};

export default nextConfig;
