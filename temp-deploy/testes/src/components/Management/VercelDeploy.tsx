'use client'

import { useState, useEffect } from 'react'
import { OptimizedChatFlow } from '@/types'

interface VercelDeployProps {
  flowData: OptimizedChatFlow
}

interface VercelSettings {
  accessToken: string
  projectName: string
  lastDeployUrl?: string
  lastDeployTime?: string
}

interface DeployStatus {
  status: 'idle' | 'preparing' | 'uploading' | 'building' | 'deploying' | 'success' | 'error'
  message: string
  url?: string
  error?: string
  progress?: number
}

export default function VercelDeploy({ flowData }: VercelDeployProps) {
  const [vercelSettings, setVercelSettings] = useState<VercelSettings>({
    accessToken: '',
    projectName: '',
  })
  const [deployStatus, setDeployStatus] = useState<DeployStatus>({
    status: 'idle',
    message: 'デプロイ準備完了'
  })
  const [showTokenInput, setShowTokenInput] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'connected' | 'error'>('unknown')

  // Load saved settings
  useEffect(() => {
    const saved = localStorage.getItem('vercel-settings')
    if (saved) {
      try {
        const settings = JSON.parse(saved)
        setVercelSettings(settings)
        if (settings.accessToken) {
          testConnection(settings.accessToken)
        }
      } catch (error) {
        console.error('Failed to load Vercel settings:', error)
      }
    }
  }, [])

  // Save settings
  const saveSettings = (settings: VercelSettings) => {
    localStorage.setItem('vercel-settings', JSON.stringify(settings))
    setVercelSettings(settings)
  }

  // Test Vercel connection
  const testConnection = async (token: string) => {
    try {
      const response = await fetch('/api/vercel/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken: token })
      })
      
      if (response.ok) {
        setConnectionStatus('connected')
      } else {
        setConnectionStatus('error')
      }
    } catch (error) {
      setConnectionStatus('error')
    }
  }

  // Handle deploy
  const handleDeploy = async () => {
    if (!vercelSettings.accessToken || !vercelSettings.projectName) {
      alert('Vercel Access Token とプロジェクト名を設定してください')
      return
    }

    setDeployStatus({ status: 'preparing', message: 'デプロイを準備中...', progress: 10 })

    try {
      console.log('🚀 Starting deployment...')
      
      // Deploy request
      const response = await fetch('/api/vercel/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accessToken: vercelSettings.accessToken,
          projectName: vercelSettings.projectName,
          flowData: flowData
        })
      })

      console.log('Response status:', response.status)

      if (!response.ok) {
        let errorData
        try {
          errorData = await response.json()
        } catch {
          const errorText = await response.text()
          errorData = { error: errorText || 'Unknown error' }
        }
        console.error('Server error details:', errorData)
        throw new Error(errorData.error || errorData.details || `HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      console.log('Deploy result:', result)
      
      setDeployStatus({
        status: 'success',
        message: 'デプロイが完了しました！',
        url: result.url,
        progress: 100
      })

      // Update settings with last deploy info
      saveSettings({
        ...vercelSettings,
        lastDeployUrl: result.url,
        lastDeployTime: new Date().toISOString()
      })

    } catch (error) {
      console.error('Deploy error:', error)
      setDeployStatus({
        status: 'error',
        message: 'デプロイに失敗しました',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="text-2xl">🚀</div>
          <h2 className="text-xl font-semibold text-gray-900">Vercelデプロイ</h2>
          <div className={`px-3 py-1 rounded-full text-sm ${
            connectionStatus === 'connected' 
              ? 'bg-green-100 text-green-800'
              : connectionStatus === 'error'
              ? 'bg-red-100 text-red-800'
              : 'bg-gray-100 text-gray-800'
          }`}>
            {connectionStatus === 'connected' ? '✅ 接続済み' : 
             connectionStatus === 'error' ? '❌ 接続エラー' : '⚪ 未接続'}
          </div>
        </div>

        <p className="text-gray-600 mb-6">
          チャットボットアプリをVercelに自動デプロイします。管理画面は除外され、エンドユーザー向けのアプリのみがデプロイされます。
        </p>
      </div>

      {/* Vercel Settings */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Vercel設定</h3>
        
        <div className="space-y-4">
          {/* Access Token */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Access Token
            </label>
            <div className="flex gap-2">
              <input
                type={showTokenInput ? 'text' : 'password'}
                value={vercelSettings.accessToken}
                onChange={(e) => setVercelSettings({
                  ...vercelSettings,
                  accessToken: e.target.value
                })}
                placeholder="vercel_xxxxxxxxxxxxxxxxxxxxxxxx"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={() => setShowTokenInput(!showTokenInput)}
                className="px-3 py-2 text-gray-500 hover:text-gray-700"
              >
                {showTokenInput ? '🙈' : '👁️'}
              </button>
              <button
                onClick={() => vercelSettings.accessToken && testConnection(vercelSettings.accessToken)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                disabled={!vercelSettings.accessToken}
              >
                接続テスト
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              <a href="https://vercel.com/account/tokens" target="_blank" rel="noopener noreferrer" 
                 className="text-blue-600 hover:underline">
                Vercel Dashboard
              </a> でAccess Tokenを作成してください
            </p>
          </div>

          {/* Project Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              プロジェクト名
            </label>
            <input
              type="text"
              value={vercelSettings.projectName}
              onChange={(e) => setVercelSettings({
                ...vercelSettings,
                projectName: e.target.value
              })}
              placeholder="my-chatbot-app"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              英数字とハイフンのみ使用可能
            </p>
          </div>

          {/* Save Settings */}
          <button
            onClick={() => saveSettings(vercelSettings)}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            設定を保存
          </button>
        </div>
      </div>

      {/* Deploy Section */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">デプロイ実行</h3>
        
        {/* Project Info */}
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <h4 className="font-medium text-gray-900 mb-2">デプロイ対象</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>✅ チャットボットアプリ (メインアプリ)</li>
            <li>✅ 音声ファイル ({Object.keys(flowData.languages).length}言語)</li>
            <li>✅ 設定ファイル</li>
            <li>❌ 管理画面 (除外)</li>
          </ul>
        </div>

        {/* Deploy Status */}
        {deployStatus.status !== 'idle' && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-3 h-3 rounded-full ${
                deployStatus.status === 'success' ? 'bg-green-500' :
                deployStatus.status === 'error' ? 'bg-red-500' :
                'bg-blue-500 animate-pulse'
              }`}></div>
              <span className="text-sm font-medium">{deployStatus.message}</span>
            </div>
            
            {deployStatus.progress && (
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${deployStatus.progress}%` }}
                ></div>
              </div>
            )}

            {deployStatus.url && (
              <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded">
                <p className="text-green-800 font-medium">🎉 デプロイ完了！</p>
                <a 
                  href={deployStatus.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline break-all"
                >
                  {deployStatus.url}
                </a>
              </div>
            )}

            {deployStatus.error && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded">
                <p className="text-red-800 font-medium">❌ エラー</p>
                <p className="text-red-600 text-sm">{deployStatus.error}</p>
              </div>
            )}
          </div>
        )}

        {/* Deploy Button */}
        <button
          onClick={handleDeploy}
          disabled={deployStatus.status !== 'idle' && deployStatus.status !== 'success' && deployStatus.status !== 'error'}
          className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
        >
          {deployStatus.status === 'idle' || deployStatus.status === 'success' || deployStatus.status === 'error' 
            ? '🚀 Vercelにデプロイ' 
            : 'デプロイ中...'}
        </button>

        {/* Last Deploy Info */}
        {vercelSettings.lastDeployUrl && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
            <p className="text-blue-800 font-medium text-sm">前回のデプロイ</p>
            <a 
              href={vercelSettings.lastDeployUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline text-sm break-all"
            >
              {vercelSettings.lastDeployUrl}
            </a>
            {vercelSettings.lastDeployTime && (
              <p className="text-blue-600 text-xs mt-1">
                {new Date(vercelSettings.lastDeployTime).toLocaleString('ja-JP')}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">💡 使用方法</h4>
        <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
          <li>Vercel Access Token を設定</li>
          <li>プロジェクト名を入力</li>
          <li>「接続テスト」で動作確認</li>
          <li>「設定を保存」をクリック</li>
          <li>「Vercelにデプロイ」を実行</li>
        </ol>
      </div>
    </div>
  )
}