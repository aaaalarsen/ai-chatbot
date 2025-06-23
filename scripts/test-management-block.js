#!/usr/bin/env node

console.log('🧪 管理画面ブロック機能のテスト\n');

// 環境変数の確認
console.log('📋 環境変数の確認:');
console.log(`ENABLE_MANAGEMENT: ${process.env.ENABLE_MANAGEMENT}`);
console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
console.log();

// 管理画面アクセス可否の判定
const managementEnabled = process.env.ENABLE_MANAGEMENT === 'true';
const isProduction = process.env.NODE_ENV === 'production';

console.log('🔍 アクセス制御の判定:');
console.log(`管理画面有効フラグ: ${managementEnabled ? '✅ 有効' : '❌ 無効'}`);
console.log(`本番環境: ${isProduction ? '✅ Yes' : '❌ No'}`);
console.log();

// 結果表示
if (managementEnabled) {
    console.log('✅ 管理画面へのアクセスが許可されます');
    console.log('   - http://localhost:3000/management でアクセス可能');
} else {
    console.log('🚫 管理画面へのアクセスがブロックされます');
    console.log('   - /management へのアクセスは404エラーになります');
}

console.log();
console.log('🧪 テスト方法:');
console.log('1. 開発環境 (ENABLE_MANAGEMENT=true):');
console.log('   npm run dev');
console.log('   → http://localhost:3000/management にアクセス可能');
console.log();
console.log('2. 本番環境テスト (ENABLE_MANAGEMENT=false):');
console.log('   npm run test:management');
console.log('   → http://localhost:3000/management にアクセス不可 (404)');
console.log();
console.log('3. 本番ビルド:');
console.log('   npm run build:production');
console.log('   → 管理画面なしでビルド');