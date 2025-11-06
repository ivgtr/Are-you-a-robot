# 🤖 Are You a Robot? - パロディコンポーネント集

実際には人間であることを証明できない、ジョーク目的のCAPTCHAパロディコンポーネント集です。

## ⚠️ 注意

これらのコンポーネントは**純粋にジョーク目的**で作成されています。実際のプロダクションでは絶対に使用しないでください。

## 🎭 コンポーネント一覧

### 1. 逃げるチェックボックス (`<escaping-checkbox>`)
マウスカーソルが近づくと逃げていきます。クリックすることは実質不可能です。

### 2. フォーカス不可能 (`<unfocusable-checkbox>`)
キーボード操作が一切できません。アクセシビリティ？知りませんね。

### 3. 反転チェックボックス (`<reverse-checkbox>`)
「私はロボットです」としか主張できません。人間であることを証明する手段がありません。

### 4. 無限ローディング (`<infinite-loading-checkbox>`)
クリックすると検証が始まりますが、永遠に終わりません。

### 5. 不可能なCAPTCHA (`<impossible-captcha>`)
どの画像を選択しても必ず失敗します。理由は毎回変わります。

### 6. 移動するチェックボックス (`<moving-checkbox>`)
クリックするたびに位置が変わります。チェックを入れることができません。

### 7. 極小チェックボックス (`<tiny-checkbox>`)
チェックボックスが極端に小さく表示されます。虫眼鏡が必要です。

### 8. グリッチチェックボックス (`<glitch-checkbox>`)
マウスを近づけると、テキストがランダムにグリッチします。

## 🚀 使い方

### 開発モード

```bash
npm install
npm run dev
```

ブラウザで `http://localhost:5173` を開いてデモページを確認できます。

### ビルド

```bash
# ライブラリビルド
npm run build

# GitHub Pagesビルド
npm run build:gh
```

- ライブラリビルド: `dist` ディレクトリに出力
- GitHub Pagesビルド: `out` ディレクトリに出力

### Web Components として使用

```html
<!DOCTYPE html>
<html>
<head>
  <script type="module" src="path/to/are-you-a-robot.es.js"></script>
</head>
<body>
  <escaping-checkbox></escaping-checkbox>
  <unfocusable-checkbox></unfocusable-checkbox>
  <reverse-checkbox></reverse-checkbox>
  <infinite-loading-checkbox></infinite-loading-checkbox>
  <impossible-captcha></impossible-captcha>
  <moving-checkbox></moving-checkbox>
  <tiny-checkbox></tiny-checkbox>
  <glitch-checkbox></glitch-checkbox>
</body>
</html>
```

## 🌐 GitHub Pages デプロイ

このプロジェクトはGitHub Pagesでホスティング可能です。

### セットアップ手順

1. **GitHub Actions ワークフローを追加**

`.github/workflows/deploy.yml` ファイルを作成：

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches:
      - main
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build for GitHub Pages
        run: npm run build:gh

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./out

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

2. **GitHub Pages を有効化**

- リポジトリの **Settings** > **Pages** へ移動
- Source を **GitHub Actions** に設定

3. **デプロイ**

mainブランチにプッシュすると、自動的にデプロイされます。

デモサイト: `https://ivgtr.github.io/Are-you-a-robot/`

## 🛠️ 技術スタック

- **Svelte 4** - コンポーネントフレームワーク
- **Vite** - ビルドツール
- **Web Components** - 配布形式
- **GitHub Pages** - ホスティング

## 💡 アイデアの元ネタ

このプロジェクトは、一般的な「私はロボットではありません」チェックボックス（reCAPTCHA等）をパロディ化したものです。ユーザビリティとアクセシビリティの重要性を、ユーモアを交えて逆説的に示しています。

## 📝 ライセンス

MIT License

## 🤝 コントリビューション

さらにひどいアイデアがあれば、ぜひプルリクエストを送ってください！

## 🎨 追加アイデア募集

以下のようなアイデアも実装可能です：

- 音声認識が必要だが、マイク権限を要求しないチェックボックス
- ランダムに成功/失敗するチェックボックス
- クリックすると「アクセスが拒否されました」と表示されるもの
- 複雑すぎる数式を解かないとチェックできないもの
- 実在しない言語で表示されるもの

楽しいアイデアをお待ちしています！
