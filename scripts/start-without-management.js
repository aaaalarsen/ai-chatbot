#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🚫 管理画面無効モードでアプリを起動します...\n');

// 環境変数を設定
process.env.ENABLE_MANAGEMENT = 'false';

console.log('📋 設定:');
console.log(`ENABLE_MANAGEMENT: ${process.env.ENABLE_MANAGEMENT}`);
console.log('管理画面: ❌ 無効 (404エラー)\n');

console.log('🚀 Next.js開発サーバーを起動中...');
console.log('http://localhost:3000 でアプリが利用可能です');
console.log('http://localhost:3000/management は404エラーになります\n');

// Next.js開発サーバーを起動
const isWindows = process.platform === 'win32';
const devProcess = spawn('npm', ['run', 'dev'], {
  stdio: 'inherit',
  shell: isWindows, // Windows では shell: true が必要
  env: {
    ...process.env,
    ENABLE_MANAGEMENT: 'false'
  }
});

// プロセス終了時の処理
devProcess.on('close', (code) => {
  console.log(`\n開発サーバーが終了しました (終了コード: ${code})`);
});

// Ctrl+C でプロセス終了
process.on('SIGINT', () => {
  console.log('\n管理画面無効モードを終了します...');
  devProcess.kill('SIGINT');
  process.exit(0);
});

process.on('SIGTERM', () => {
  devProcess.kill('SIGTERM');
  process.exit(0);
});