# Task App

Todoist にインスパイアされたタスク管理アプリ。Web（Next.js）と iOS/Android（Expo）のクライアントを持つモノレポ構成です。

## 技術スタック

| レイヤー | 技術 |
|---|---|
| モノレポ管理 | Turborepo + pnpm workspaces |
| API | Hono v4 + Node.js |
| ORM / DB | Prisma + PostgreSQL 16 |
| 認証 | JWT (jose) + bcryptjs |
| Web フロント | Next.js 15 (App Router) + Tailwind CSS + Zustand |
| モバイル | Expo SDK 52 + expo-router |
| インフラ | Docker Compose |

## リポジトリ構成

```
task-app/
├── apps/
│   ├── api/          # Hono REST API（ポート 3001）
│   ├── web/          # Next.js Web アプリ（ポート 3000）
│   └── mobile/       # Expo モバイルアプリ
├── packages/
│   └── shared/       # 共有 TypeScript 型定義
├── docker-compose.yml
└── turbo.json
```

## 機能

- **タスク管理** — 作成・編集・削除・完了トグル
- **プロジェクト** — カラー付きプロジェクトへのタスク分類
- **優先度** — P1（高）〜 P4（なし）の 4 段階
- **期日** — 日付設定・今日のタスクビュー・期限切れ表示
- **ステータス** — 未着手 / 進行中 / 完了
- **ポモドーロタイマー** — 25 / 15 / 5 分、終了時に完了タスクを選択
- **ユーザー認証** — JWT ベースの登録・ログイン

## セットアップ

### 前提条件

- Docker Desktop
- Node.js 22+
- pnpm 9+

### 起動手順

```bash
# リポジトリをクローン
git clone https://github.com/DowneyTech/task-app.git
cd task-app

# 環境変数を設定
cp .env.example .env
# .env の JWT_SECRET を安全なランダム文字列に変更してください

# Docker でビルド＆起動
docker compose up -d --build

# DB マイグレーション（初回のみ）
docker compose exec api pnpm db:migrate
```

アプリが起動したら http://localhost:3000 にアクセスしてください。

### モバイルアプリ（Expo）

```bash
cd apps/mobile
pnpm install
pnpm start
```

Expo Go アプリ（iOS / Android）でQRコードをスキャンして確認できます。

## 開発

```bash
# 全サービスをローカルで起動（Turborepo）
pnpm dev

# 型チェック
pnpm typecheck

# DB スキーマ変更後
pnpm db:migrate
pnpm db:generate
```

### 環境変数

| 変数名 | 説明 | デフォルト |
|---|---|---|
| `DATABASE_URL` | PostgreSQL 接続 URL | `postgresql://taskapp:taskapp@db:5432/taskapp` |
| `JWT_SECRET` | JWT 署名シークレット（必須・本番は変更必須） | なし |
| `API_PORT` | API サーバーのポート | `3001` |
| `NEXT_PUBLIC_API_URL` | Web から API へのベース URL | `http://localhost:3001` |
| `CORS_ORIGINS` | CORS 許可オリジン（カンマ区切り） | `http://localhost:3000,http://localhost:8081` |

## API エンドポイント

| メソッド | パス | 説明 |
|---|---|---|
| POST | `/auth/register` | ユーザー登録 |
| POST | `/auth/login` | ログイン |
| GET | `/auth/me` | 認証ユーザー情報取得 |
| GET | `/projects` | プロジェクト一覧 |
| POST | `/projects` | プロジェクト作成 |
| PUT | `/projects/:id` | プロジェクト更新 |
| DELETE | `/projects/:id` | プロジェクト削除 |
| GET | `/tasks` | タスク一覧（`?projectId=` `?today=true` でフィルタ） |
| POST | `/tasks` | タスク作成 |
| PUT | `/tasks/:id` | タスク更新 |
| PATCH | `/tasks/:id/complete` | 完了トグル |
| DELETE | `/tasks/:id` | タスク削除 |
| POST | `/pomodoros/start` | ポモドーロ開始 |
| PATCH | `/pomodoros/:id/end` | ポモドーロ終了 |

## データモデル

```
User ──< Project ──< Task ──< Pomodoro
     └──────────────< Task
                     └──< Pomodoro
```

- **User** — メール・パスワード認証
- **Project** — 名前・カラー、ユーザーに紐づく
- **Task** — タイトル・説明・期日・優先度・ステータス、プロジェクトに任意で紐づく
- **Pomodoro** — タスクに紐づくセッション（開始日時・終了日時・分数）
