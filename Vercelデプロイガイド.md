# Vercel デプロイ機能ガイド

## 概要

この機能により、管理画面から直接Vercelにチャットボットアプリをデプロイできます。管理画面は除外され、音声ファイルを含む完全なエンドユーザー向けアプリがデプロイされます。

## ✨ 新機能の特徴

### 🚀 Vercel CLI経由デプロイ
- **ファイルサイズ制限なし**: 音声ファイルも含めて完全デプロイ
- **TypeScriptエラー回避**: 本番ビルド時の型チェックを最適化
- **自動環境設定**: 本番用の環境変数を自動設定

### 🔒 セキュリティ強化
- **管理画面完全除外**: `src/app/management` のみ精密除外
- **Vercel API除外**: `src/app/api/vercel` の除外
- **本番環境保護**: ミドルウェアによる管理画面アクセス拒否

## 事前準備

### 1. Vercelアカウントの作成
1. [Vercel](https://vercel.com/) にアクセス
2. 「Sign Up」でアカウント作成
3. GitHubアカウントでの登録推奨

### 2. Access Token の取得
1. Vercel Dashboard にログイン
2. [Account Settings → Tokens](https://vercel.com/account/tokens) にアクセス
3. 「Create Token」をクリック
4. Token名を入力（例：ChatBot Deploy）
5. **Expiration**: 無期限または長期間を選択推奨
6. 生成されたTokenをコピーして安全に保存

### 3. 音声ファイルの準備
1. VOICEVOXアプリケーションを起動
2. 管理画面の「音声生成」タブで音声ファイルを生成
3. `public/audio/ja/` に音声ファイルが保存されることを確認

## 使用方法

### Step 1: 管理画面でのデプロイ設定

1. **アプリケーション起動**
   ```bash
   # Windows
   start-chatbot.bat
   
   # macOS/Linux
   ./start-chatbot.sh
   ```

2. **管理画面にアクセス**
   - http://localhost:3000/management
   - 「デプロイ」タブをクリック

3. **Vercel設定**
   - **Access Token**: 取得したTokenを入力
   - **プロジェクト名**: デプロイするプロジェクト名
     - 英数字とハイフンのみ使用可能
     - 例: `my-chatbot-app`, `bank-atm-assistant`
   - 「接続テスト」で動作確認
   - ✅ 接続成功 が表示されることを確認
   - 「設定を保存」をクリック

### Step 2: デプロイ実行

1. **事前確認**
   - [ ] 音声ファイル生成が完了している
   - [ ] コンテンツ編集が完了している
   - [ ] VOICEVOX接続が正常

2. **デプロイ実行**
   - 「🚀 Vercelにデプロイ」をクリック
   - デプロイ進行状況が表示される
   - **所要時間**: 約2-5分

3. **完了確認**
   - デプロイ完了時に本番URLが表示される
   - URLをクリックして本番アプリにアクセス

## デプロイされる内容

### ✅ 含まれるもの
- **メインアプリ**: 完全なチャットボット機能
- **音声ファイル**: `public/audio/ja/*.wav` 全45ファイル
- **設定ファイル**: カスタマイズされたconfiguration.json
- **全コンポーネント**: Chat、Language、UI、hooks、services、utils
- **API機能**: convert-json、audio-files、translate等
- **スタイル**: globals.css、Tailwind設定

### ❌ 除外されるもの
- **管理画面**: `src/app/management` ディレクトリ
- **管理用コンポーネント**: `src/components/Management`
- **Vercel APIアクセス**: `src/app/api/vercel`
- **開発用設定**: デバッグ、テスト機能

## 🔄 デプロイフロー詳細

```
管理画面でデプロイ実行
    ↓
一時ディレクトリ作成
    ↓
プロジェクトファイルを選択的コピー
    ↓
本番用設定ファイル生成
    ↓
Vercel CLI経由でデプロイ
    ↓
本番URL取得・表示
    ↓
一時ファイル自動削除
```

### 技術的詳細

1. **ファイル選択**: 精密な除外パターンで必要ファイルのみコピー
2. **設定最適化**: TypeScriptエラー無視、ESLint無効化
3. **環境変数**: `ENABLE_MANAGEMENT=false` 自動設定
4. **Vercel CLI**: `npx vercel --prod` で直接デプロイ

## 本番環境の特徴

### セキュリティ
- 管理画面は完全に無効化
- `/management` へのアクセスは404エラー
- 管理用APIも無効化

### パフォーマンス
- 管理画面コードが除外され軽量
- 必要最小限のファイルのみ
- CDN経由での高速配信

### 環境変数
```bash
ENABLE_MANAGEMENT=false  # 管理画面無効
NODE_ENV=production     # 本番環境
```

## トラブルシューティング

### よくある問題

#### 1. Access Token エラー
**症状**: 「Invalid access token」エラー

**解決方法**:
- Tokenが正しく入力されているか確認
- Tokenの有効期限を確認
- Vercel Dashboard でTokenを再生成

#### 2. プロジェクト名エラー
**症状**: 「Invalid project name」エラー

**解決方法**:
- 英数字とハイフンのみ使用
- 既存プロジェクト名との重複確認
- 文字数制限（63文字以下）を確認

#### 3. デプロイファイルエラー
**症状**: 「Build failed」エラー

**解決方法**:
- 音声ファイルが正しく配置されているか確認
- configuration.json の内容を確認
- ローカルで `npm run build:production` でテスト

#### 4. 音声ファイルが反映されない
**症状**: デプロイ後に音声が再生されない

**解決方法**:
- 管理画面で音声ファイルを再生成
- public/audio/ フォルダの確認
- ファイル名の命名規則確認

### デバッグ方法

#### 1. ローカルテスト
```bash
# 本番環境と同じ状態でテスト
npm run test:management
```

#### 2. ビルドテスト
```bash
# 本番ビルドをテスト
npm run build:production
```

#### 3. 設定確認
```bash
# 環境変数確認
node scripts/test-management-block.js
```

## セキュリティ考慮事項

### Access Token の管理
- Tokenはローカルストレージに保存（暗号化なし）
- 定期的なToken更新を推奨
- 不要なTokenは削除

### アクセス制御
- 管理画面は開発環境のみ
- 本番環境では完全に無効化
- API endpoints も保護

## パフォーマンス最適化

### ファイルサイズ最適化
- 不要なファイルの除外
- 音声ファイルの圧縮
- 依存関係の最小化

### キャッシュ戦略
- 静的ファイルの長期キャッシュ
- Vercel Edge Network 活用
- 音声ファイルのCDN配信

## 運用のベストプラクティス

### 1. デプロイ前チェック
- [ ] 音声生成が完了している
- [ ] 設定内容が正しい
- [ ] ローカルでの動作確認済み

### 2. デプロイ後チェック
- [ ] 本番URLでアプリが動作する
- [ ] 音声再生が正常
- [ ] 管理画面が404エラーになる

### 3. 定期メンテナンス
- [ ] Vercel Tokenの更新
- [ ] 不要なデプロイメントの削除
- [ ] ログの確認

## サポート

### 問題が解決しない場合
1. ローカル環境での再現確認
2. エラーメッセージの詳細記録
3. デプロイ設定の確認
4. 必要に応じてサポートに連絡

このガイドに従って、簡単にチャットボットアプリをVercelにデプロイできます。