#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('📋 依存関係チェックを実行中...\n');

// package.json を読み込み
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };

// node_modules の確認
const nodeModulesPath = 'node_modules';
let missingPackages = [];

if (!fs.existsSync(nodeModulesPath)) {
    console.log('❌ node_modules フォルダが存在しません');
    console.log('📦 npm install を実行してください\n');
    process.exit(1);
}

// 各パッケージの確認
for (const [packageName, version] of Object.entries(dependencies)) {
    const packagePath = path.join(nodeModulesPath, packageName);
    if (fs.existsSync(packagePath)) {
        console.log(`✓ ${packageName}`);
    } else {
        console.log(`❌ ${packageName} が見つかりません`);
        missingPackages.push(packageName);
    }
}

if (missingPackages.length > 0) {
    console.log('\n⚠️  不足しているパッケージがあります:');
    missingPackages.forEach(pkg => console.log(`   - ${pkg}`));
    console.log('\n📦 npm install を実行してください');
    process.exit(1);
} else {
    console.log('\n✅ すべての依存関係が正常にインストールされています');
}

// 必要なディレクトリの確認
const requiredDirs = ['public', 'src', 'src/app'];
requiredDirs.forEach(dir => {
    if (fs.existsSync(dir)) {
        console.log(`✓ ${dir} ディレクトリが存在します`);
    } else {
        console.log(`❌ ${dir} ディレクトリが見つかりません`);
    }
});

// 設定ファイルの確認
const configFiles = ['next.config.ts', 'tailwind.config.ts', 'tsconfig.json'];
configFiles.forEach(file => {
    if (fs.existsSync(file)) {
        console.log(`✓ ${file} が存在します`);
    } else {
        console.log(`⚠️  ${file} が見つかりません（オプション）`);
    }
});

console.log('\n🎉 依存関係チェック完了！');