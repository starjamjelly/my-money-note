# my-money-note

個人用家計簿Webサービス（HonoX + Notion + Cloudflare Pages）

## 技術スタック

- **フレームワーク**: HonoX (Islands Architecture)
- **データベース**: Notion API
- **スタイリング**: Tailwind CSS
- **デプロイ**: Cloudflare Pages
- **認証**: Cloudflare Access（本番環境）

## 開発環境

### 必要なツール

- Bun (パッケージマネージャー & ランタイム)

### コマンド

```bash
bun install      # 依存関係インストール
bun run dev      # 開発サーバー起動 (http://localhost:5173)
bun run build    # ビルド
bun run deploy   # Cloudflare Pagesにデプロイ
bun run lint     # リント実行
bun run typecheck # 型チェック
```

### 環境変数

`.dev.vars` に以下を設定（Wrangler/Cloudflare用）:

```
NOTION_TOKEN=secret_xxxxx
NOTION_DATABASE_ID=xxxxx
```

## Notionデータベース スキーマ

| プロパティ名 | 型 | 説明 |
|-------------|------|------|
| Name | Title | 購入品名（オプショナル） |
| Amount | Number | 金額（円） |
| Category | Multi-select | カテゴリ |
| Date | Date | 購入日 |
| CreatedAt | Created time | 作成日時（自動） |

## プロジェクト構造

```
app/
├── client.ts           # クライアントエントリー
├── server.ts           # サーバーエントリー
├── style.css           # Tailwind CSS
├── components/         # サーバーコンポーネント
├── islands/            # クライアントコンポーネント（インタラクティブ）
├── lib/notion/         # Notion API連携
└── routes/
    ├── _renderer.tsx   # 共通レイアウト
    ├── index.tsx       # メイン画面
    └── api/            # APIエンドポイント
```

## 注意事項

### Bunとアーキテクチャ

- 開発はBun、本番はCloudflare Workers
- `package.json`のスクリプトは`bun --bun vite`を使用（Bunランタイムで実行）
- Intel MacからApple Siliconに移行した環境では、Voltaやツールがx64版のままの場合がある

### Vite開発サーバー

- `.dev.vars`を読み込むために`@hono/vite-dev-server/cloudflare`アダプターを使用
