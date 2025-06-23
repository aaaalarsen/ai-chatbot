@echo off
cls
echo ==========================================
echo   Management Panel Test Mode
echo ==========================================
echo.
echo Setting ENABLE_MANAGEMENT=false
echo Starting Next.js development server...
echo.

set ENABLE_MANAGEMENT=false
set NODE_ENV=development

echo Environment variables:
echo ENABLE_MANAGEMENT=%ENABLE_MANAGEMENT%
echo NODE_ENV=%NODE_ENV%
echo.

npm run dev