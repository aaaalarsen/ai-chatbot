import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  
  // 管理画面へのアクセスをチェック
  if (pathname.startsWith('/management')) {
    // 開発環境の判定を厳密に行う
    const isDevelopment = process.env.NODE_ENV === 'development'
    const enableManagement = process.env.ENABLE_MANAGEMENT
    
    // 管理画面アクセス許可の判定
    let managementEnabled = false
    
    if (isDevelopment && enableManagement !== 'false') {
      // 開発環境で明示的にfalseでない場合は許可
      managementEnabled = true
    } else if (enableManagement === 'true') {
      // 明示的にtrueの場合は許可
      managementEnabled = true
    }
    
    console.log('🔍 Middleware check:', {
      pathname,
      NODE_ENV: process.env.NODE_ENV,
      ENABLE_MANAGEMENT: process.env.ENABLE_MANAGEMENT,
      isDevelopment,
      managementEnabled
    })
    
    // アクセスブロック
    if (!managementEnabled) {
      console.log('🚫 Management panel access BLOCKED:', pathname)
      return new NextResponse(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>404 - Page Not Found</title>
            <style>
              body { font-family: system-ui, sans-serif; text-align: center; padding: 50px; }
              h1 { color: #666; }
            </style>
          </head>
          <body>
            <h1>404 - Page Not Found</h1>
            <p>This page could not be found.</p>
            <p><a href="/">← Back to Home</a></p>
          </body>
        </html>
      `, { 
        status: 404,
        headers: {
          'content-type': 'text/html',
        }
      })
    }
    
    // アクセス許可
    console.log('✅ Management panel access ALLOWED:', pathname)
  }
  
  // 管理画面以外は通常通り処理
  return NextResponse.next()
}

export const config = {
  // 管理画面のパスにのみミドルウェアを適用
  matcher: [
    '/management/:path*',
    // Vercel API も本番環境では保護
    '/api/vercel/:path*',
    // 管理用API も保護
    '/api/management/:path*'
  ]
}