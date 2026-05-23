/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  transpilePackages: [
    "@ttotti/ui",
    "@ttotti/vision",
    "@ttotti/effects",
    "@ttotti/hand-particles",
  ],
}

export default nextConfig
