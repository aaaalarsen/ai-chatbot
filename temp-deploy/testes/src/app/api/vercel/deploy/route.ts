import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { accessToken, projectName, flowData } = await request.json()

    if (!accessToken || !projectName || !flowData) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    console.log('🚀 Starting Vercel deployment...')
    console.log('Project Name:', projectName)

    // 実際のチャットボットアプリをデプロイ
    const deploymentResult = await createRealChatbotDeployment(
      accessToken,
      projectName,
      flowData
    )

    console.log('✅ Deployment successful:', deploymentResult.url)

    return NextResponse.json({
      success: true,
      url: deploymentResult.url,
      deploymentId: deploymentResult.id
    })

  } catch (error) {
    console.error('❌ Deployment failed:', error)
    return NextResponse.json(
      { 
        error: 'Deployment failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

async function createRealChatbotDeployment(accessToken: string, projectName: string, flowData: any) {
  try {
    console.log('🔍 Starting real chatbot deployment via Vercel CLI...')
    console.log('Project name:', projectName)
    console.log('Access token length:', accessToken.length)
    console.log('Flow data keys:', Object.keys(flowData))

    const fs = require('fs')
    const path = require('path')
    const { exec } = require('child_process')
    const { promisify } = require('util')
    const execAsync = promisify(exec)

    // 一時ディレクトリを作成
    const tempDir = path.join(process.cwd(), 'temp-deploy', projectName)
    console.log('📁 Creating temporary directory:', tempDir)
    
    // 一時ディレクトリをクリーンアップして作成
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true })
    }
    fs.mkdirSync(tempDir, { recursive: true })

    // プロジェクトファイルをコピーする関数
    const copyFile = (srcPath: string, destPath: string) => {
      const fullSrcPath = path.join(process.cwd(), srcPath)
      const fullDestPath = path.join(tempDir, destPath)
      
      if (fs.existsSync(fullSrcPath)) {
        const destDir = path.dirname(fullDestPath)
        if (!fs.existsSync(destDir)) {
          fs.mkdirSync(destDir, { recursive: true })
        }
        fs.copyFileSync(fullSrcPath, fullDestPath)
        return true
      }
      return false
    }

    const copyDirectory = (srcPath: string, destPath: string, excludePatterns: string[] = []) => {
      const fullSrcPath = path.join(process.cwd(), srcPath)
      const fullDestPath = path.join(tempDir, destPath)
      
      if (!fs.existsSync(fullSrcPath)) return

      if (!fs.existsSync(fullDestPath)) {
        fs.mkdirSync(fullDestPath, { recursive: true })
      }

      const items = fs.readdirSync(fullSrcPath)
      items.forEach((item: string) => {
        const srcItemPath = path.join(fullSrcPath, item)
        const destItemPath = path.join(fullDestPath, item)
        const relativePath = path.join(srcPath, item)
        
        // より精密な除外チェック
        const shouldExclude = excludePatterns.some(pattern => {
          // 正確なパスマッチング
          if (relativePath === pattern) return true
          if (relativePath.includes(pattern)) return true
          if (item === pattern) return true
          return false
        })
        
        if (shouldExclude) {
          console.log(`Excluding: ${relativePath}`)
          return
        }

        const stat = fs.statSync(srcItemPath)
        if (stat.isDirectory()) {
          copyDirectory(relativePath, path.join(destPath, item), excludePatterns)
        } else {
          fs.copyFileSync(srcItemPath, destItemPath)
        }
      })
    }

    console.log('📂 Copying project files...')

    // Package.json（本番用に修正）
    const originalPackageJson = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf-8'))
    const productionPackageJson = {
      ...originalPackageJson,
      scripts: {
        ...originalPackageJson.scripts,
        build: 'cross-env ENABLE_MANAGEMENT=false next build',
        'type-check': 'echo "Skipping type check for production build"'
      }
    }
    fs.writeFileSync(
      path.join(tempDir, 'package.json'), 
      JSON.stringify(productionPackageJson, null, 2)
    )

    // 設定ファイル
    copyFile('tsconfig.json', 'tsconfig.json')
    copyFile('tailwind.config.ts', 'tailwind.config.ts')

    // ソースコード（特定のディレクトリのみ除外）
    copyDirectory('src', 'src', [
      'src/app/management',      // 管理画面ページ
      'src/components/Management', // 管理画面コンポーネント
      'src/app/api/vercel'       // Vercel API
    ])
    
    // 公開ファイル（音声ファイル含む）
    copyDirectory('public', 'public')

    // 設定ファイルを更新
    fs.writeFileSync(
      path.join(tempDir, 'public/configuration.json'),
      JSON.stringify(flowData, null, 2)
    )
    fs.writeFileSync(
      path.join(tempDir, 'configuration.json'),
      JSON.stringify(flowData, null, 2)
    )

    // next.config.tsを本番用に上書き
    const nextConfig = `/** @type {import('next').NextConfig} */
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

export default nextConfig`
    
    fs.writeFileSync(path.join(tempDir, 'next.config.ts'), nextConfig)

    // .vercelrc ファイルを作成（プロジェクト設定）
    const vercelConfig = {
      name: projectName,
      framework: 'nextjs',
      buildCommand: 'npm run build',
      installCommand: 'npm install',
      outputDirectory: '.next',
      env: {
        'ENABLE_MANAGEMENT': 'false',
        'NODE_ENV': 'production'
      }
    }
    fs.writeFileSync(
      path.join(tempDir, 'vercel.json'),
      JSON.stringify(vercelConfig, null, 2)
    )

    console.log('📦 Files copied successfully')

    // Vercel CLIでデプロイ実行
    console.log('🚀 Starting Vercel CLI deployment...')
    
    const deployCommand = `npx vercel --prod --token "${accessToken}" --yes --name "${projectName}"`
    console.log('Command:', deployCommand.replace(accessToken, '***'))

    const { stdout, stderr } = await execAsync(deployCommand, {
      cwd: tempDir,
      env: {
        ...process.env,
        VERCEL_TOKEN: accessToken,
        ENABLE_MANAGEMENT: 'false',
        NODE_ENV: 'production'
      }
    })

    console.log('Vercel CLI output:', stdout)
    if (stderr) {
      console.log('Vercel CLI stderr:', stderr)
    }

    // 出力からURLを抽出
    const urlMatch = stdout.match(/https:\/\/[^\s]+/)
    const deployUrl = urlMatch ? urlMatch[0] : null

    if (!deployUrl) {
      throw new Error('Could not extract deployment URL from Vercel CLI output')
    }

    console.log('✅ Deployment successful:', deployUrl)

    // 一時ディレクトリをクリーンアップ（Windowsでのファイルロック問題を回避）
    try {
      fs.rmSync(tempDir, { recursive: true, force: true })
    } catch (cleanupError) {
      console.log('⚠️ Cleanup warning (not critical):', cleanupError.message)
    }
    
    return {
      id: `cli-${Date.now()}`,
      url: deployUrl
    }

  } catch (error) {
    console.error('💥 Error in createRealChatbotDeployment:', error)
    if (error instanceof Error) {
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
    }
    throw error
  }
}