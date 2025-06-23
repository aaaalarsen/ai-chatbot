/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // 本番ビルドでのTypeScriptエラーを無視
    ignoreBuildErrors: true,
  },
  eslint: {
    // 本番ビルドでのESLintエラーを無視
    ignoreDuringBuilds: true,
  },
  env: {
    ENABLE_MANAGEMENT: process.env.ENABLE_MANAGEMENT || 'false'
  }
}

export default nextConfig