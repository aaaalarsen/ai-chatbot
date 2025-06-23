#!/usr/bin/env node

const fs = require('fs');
const http = require('http');

console.log('🔍 環境チェックを実行中...\n');

// Node.js バージョンチェック
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.split('.')[0].substring(1));

console.log(`✓ Node.js: ${nodeVersion}`);

if (majorVersion < 18) {
    console.error('❌ Node.js v18 以上が必要です。現在のバージョン:', nodeVersion);
    process.exit(1);
}

// package.json の存在確認
if (!fs.existsSync('package.json')) {
    console.error('❌ package.json が見つかりません');
    process.exit(1);
}

console.log('✓ package.json が見つかりました');

// node_modules の存在確認
if (!fs.existsSync('node_modules')) {
    console.log('📦 依存関係をインストール中...');
    const { exec } = require('child_process');
    
    exec('npm install', (error, stdout, stderr) => {
        if (error) {
            console.error('❌ 依存関係のインストールに失敗しました:', error);
            process.exit(1);
        }
        console.log('✓ 依存関係のインストールが完了しました');
        checkVoicevox();
    });
} else {
    console.log('✓ 依存関係は既にインストール済みです');
    checkVoicevox();
}

function checkVoicevox() {
    console.log('\n🎤 VOICEVOX エンジンの確認中...');
    
    const req = http.get('http://localhost:50021/version', (res) => {
        console.log('✓ VOICEVOX エンジンが起動しています');
        console.log('\n🚀 環境チェック完了！開発サーバーを起動します...\n');
    });

    req.on('error', () => {
        console.log('⚠️  VOICEVOX エンジンが起動していません');
        console.log('   音声生成機能を使用するには VOICEVOX を起動してください');
        console.log('   ダウンロード: https://voicevox.hiroshiba.jp/');
        console.log('\n🚀 基本機能で開発サーバーを起動します...\n');
    });

    req.setTimeout(3000, () => {
        req.destroy();
        console.log('⚠️  VOICEVOX エンジンの確認がタイムアウトしました');
        console.log('\n🚀 基本機能で開発サーバーを起動します...\n');
    });
}