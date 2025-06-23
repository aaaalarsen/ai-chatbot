import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Disable ESLint during builds for Vercel deployment
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Allow production builds with TypeScript errors (warnings only)
    ignoreBuildErrors: false,
  },
  
  // 管理画面の制御設定
  env: {
    ENABLE_MANAGEMENT: process.env.ENABLE_MANAGEMENT,
  },
  
  // リダイレクト設定
  async redirects() {
    const redirects = []
    
    // 本番環境で管理画面が無効の場合、404ページにリダイレクト
    if (process.env.ENABLE_MANAGEMENT !== 'true' && process.env.NODE_ENV === 'production') {
      redirects.push({
        source: '/management/:path*',
        destination: '/404',
        permanent: false,
      })
    }
    
    return redirects
  },
  
  // セキュリティヘッダー
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          }
        ]
      }
    ]
  }
};

export default nextConfig;
