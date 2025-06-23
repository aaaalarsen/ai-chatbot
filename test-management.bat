@echo off
echo ==========================================
echo   Management Panel Disabled Mode
echo ==========================================
echo.
echo 🚫 管理画面無効モードでアプリを起動します...
echo.
echo 📋 設定:
echo ENABLE_MANAGEMENT: false
echo 管理画面: ❌ 無効 (404エラー)
echo.
echo 🚀 Next.js開発サーバーを起動中...
echo http://localhost:3000 でアプリが利用可能です
echo http://localhost:3000/management は404エラーになります
echo.

:: 環境変数を設定してNext.jsを起動
set ENABLE_MANAGEMENT=false
set NODE_ENV=development
echo.
echo 実際の環境変数:
echo ENABLE_MANAGEMENT=%ENABLE_MANAGEMENT%
echo NODE_ENV=%NODE_ENV%
echo.
npm run dev

pause