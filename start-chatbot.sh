#!/bin/bash

# 文字エンコーディング設定
export LANG=ja_JP.UTF-8

# 色の設定
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ヘッダー表示
clear
echo "=========================================="
echo "   AI チャットボット管理システム"
echo "=========================================="
echo

# 関数定義
show_error() {
    echo -e "${RED}[エラー]${NC} $1"
}

show_success() {
    echo -e "${GREEN}   ✓${NC} $1"
}

show_warning() {
    echo -e "${YELLOW}[警告]${NC} $1"
}

show_info() {
    echo -e "${BLUE}[情報]${NC} $1"
}

# エラーが発生した場合の終了処理
cleanup() {
    if [ ! -z "$DEV_PID" ]; then
        kill $DEV_PID 2>/dev/null
    fi
    exit 1
}

# シグナルハンドラー設定
trap cleanup SIGINT SIGTERM

# 1. システム環境チェック
echo "[1/6] システム環境をチェック中..."

# Node.js インストール確認
echo "[2/6] Node.js のインストール状況を確認中..."
if ! command -v node &> /dev/null; then
    echo
    show_error "Node.js がインストールされていません。"
    echo
    echo "以下のいずれかの方法でNode.js をインストールしてください："
    echo
    echo "【macOS の場合】"
    echo "1. 公式サイト: https://nodejs.org/"
    echo "2. Homebrew: brew install node"
    echo
    echo "【Linux の場合】"
    echo "1. 公式サイト: https://nodejs.org/"
    echo "2. パッケージマネージャー: sudo apt install nodejs npm (Ubuntu/Debian)"
    echo "                        sudo yum install nodejs npm (CentOS/RHEL)"
    echo
    echo "インストール後、このスクリプトを再度実行してください。"
    echo
    read -p "Enterキーを押して終了..."
    exit 1
else
    NODE_VERSION=$(node --version)
    show_success "Node.js が見つかりました (バージョン: $NODE_VERSION)"
fi

# npm 確認
if ! command -v npm &> /dev/null; then
    show_error "npm が見つかりません。Node.js を再インストールしてください。"
    read -p "Enterキーを押して終了..."
    exit 1
else
    NPM_VERSION=$(npm --version)
    show_success "npm が見つかりました (バージョン: $NPM_VERSION)"
fi

# プロジェクトディレクトリ確認
if [ ! -f "package.json" ]; then
    echo
    show_error "package.json が見つかりません。"
    echo "このファイルをプロジェクトのルートフォルダに配置してください。"
    echo
    read -p "Enterキーを押して終了..."
    exit 1
fi

# 依存関係のインストール
echo "[3/6] 依存関係を確認中..."
if [ ! -d "node_modules" ]; then
    echo "   依存関係をインストール中... (初回のみ時間がかかります)"
    if ! npm install; then
        echo
        show_error "依存関係のインストールに失敗しました。"
        echo "インターネット接続を確認し、再度実行してください。"
        echo
        read -p "Enterキーを押して終了..."
        exit 1
    fi
    show_success "依存関係のインストールが完了しました"
else
    show_success "依存関係は既にインストール済みです"
fi

# VOICEVOX 起動確認
echo "[4/6] VOICEVOX エンジンの起動を確認中..."
if ! curl -s http://localhost:50021/version > /dev/null 2>&1; then
    echo
    show_warning "VOICEVOX エンジンが起動していません。"
    echo
    echo "音声生成機能を使用するには、先にVOICEVOXを起動してください："
    echo "1. VOICEVOX をダウンロード: https://voicevox.hiroshiba.jp/"
    echo "2. VOICEVOX を起動"
    echo "3. このスクリプトを再実行"
    echo
    echo "VOICEVOXなしでも基本機能は使用できます。"
    echo -n "続行しますか？ (y/N): "
    read -r continue
    if [[ ! $continue =~ ^[Yy]$ ]]; then
        echo "処理を中止しました。"
        read -p "Enterキーを押して終了..."
        exit 1
    fi
    echo "   続行します..."
else
    show_success "VOICEVOX エンジンが正常に動作しています"
fi

# 開発サーバー起動準備
echo "[5/6] 開発サーバーを起動中..."
echo "   ポート 3000 で起動します..."
echo

echo "=========================================="
echo "   起動完了！"
echo "=========================================="
echo
echo "アプリケーションが以下のURLで利用可能です："
echo
echo "メインアプリ:     http://localhost:3000"
echo "管理画面:        http://localhost:3000/management"
echo
echo "5秒後に管理画面をブラウザで自動的に開きます..."
echo "手動で開く場合は上記URLをコピーしてブラウザに貼り付けてください。"
echo

echo "[6/6] ブラウザを起動中..."

# 5秒待機
sleep 5

# ブラウザで管理画面を開く（OS別）
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    open http://localhost:3000/management
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    if command -v xdg-open > /dev/null; then
        xdg-open http://localhost:3000/management
    elif command -v gnome-open > /dev/null; then
        gnome-open http://localhost:3000/management
    else
        show_info "ブラウザを手動で開いて http://localhost:3000/management にアクセスしてください"
    fi
fi

echo
echo "開発サーバーを起動しています..."
echo "終了するには Ctrl+C を押してください。"
echo

# 開発サーバー起動
if ! npm run dev; then
    echo
    show_error "開発サーバーの起動に失敗しました。"
    echo "package.json の scripts セクションに \"dev\" コマンドが定義されているか確認してください。"
    echo
    read -p "Enterキーを押して終了..."
    exit 1
fi