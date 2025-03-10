# 学校時間割管理アプリ

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://github.com/monymony68/jikanwari-app/blob/main/LICENSE)

## 概要

学校の時間割を管理するための Web アプリケーションです。PC とモバイル両方に対応したレスポンシブデザインを採用しており、直感的な UI で簡単に時間割の管理ができます。

## 主な機能

### 🎯 基本機能

- 週単位での時間割表示・管理
- PC とモバイル両方に対応したレスポンシブデザイン
- カレンダーによる日付選択
- 各授業コマへの詳細情報の登録（教科、担当教師、内容、場所、必要物、宿題）

### ⚙️ カスタマイズ機能

- 学校情報の設定（学校名、学科、クラス）
- 教科の追加・編集・削除
- サブ教科の設定
- 教科ごとの色設定（背景色・文字色）
- 教科の並び替え（ドラッグ＆ドロップ）
- 削除した教科の復活機能

### 💾 データ保存

- ブラウザのローカルストレージを使用してデータを保存
- 設定情報やコマの情報が自動で保存

## 技術スタック

- React 18
- TypeScript
- CSS3（レスポンシブデザイン）

### 使用ライブラリ

- Lucide React（アイコン）

インストール方法
bashCopy# リポジトリのクローン
git clone https://github.com/monymony68/jikanwari-app.git

# プロジェクトディレクトリへ移動

cd jikanwari-app

# 依存パッケージのインストール

npm install

# 開発サーバーの起動

npm run dev

## 使用方法

### 1. 初期設定

1. 右上のハンバーガーメニューから「設定」を開く
2. 学校情報（学校名、学科、クラス）を入力
3. 教科の設定（名前、色、担当教師）を行う

### 2. 時間割の編集

1. 編集したいコマをクリック
2. 教科を選択し、必要に応じてサブ教科も選択
3. 内容、場所、必要物、宿題などの情報を入力
4. 「保存」をクリック

### 3. 日付の移動

- PC 版：画面両端の矢印ボタンで週の切り替え
- モバイル版：上部の矢印ボタンで週の切り替え
- カレンダーアイコンから特定の日付を選択可能

## 開発者向け情報

### プロジェクト構造

```
src/
  ├── components/         # コンポーネントファイル
  │   ├── Calendar.tsx   # カレンダー
  │   ├── ClassForm.tsx  # 授業情報入力フォーム
  │   ├── HamburgerMenu.tsx  # ハンバーガーメニュー
  │   ├── SettingsMenu.tsx   # 設定
  │   ├── MobileTimetable.tsx  # モバイル画面
  │   ├── PCTimetable.tsx  # PC画面
  │   └── TimetableCell.tsx  # 授業表
  ├── types/             # 型定義ファイル
  ├── constants/         # 定数定義
  └── App.tsx           # メインコンポーネント
```

### コンポーネント概要

- `App.tsx`: アプリケーションのメインコンポーネント
- `Calendar.tsx`: カレンダー表示と日付選択機能
- `ClassForm.tsx`: 授業情報入力フォーム
- `PCTimetable.tsx`: PC 向け時間割表示
- `MobileTimetable.tsx`: モバイル向け時間割表示
- `SettingsMenu.tsx`: 設定画面
- `HamburgerMenu.tsx`: メニュー画面
- `TimetableCell.tsx`: 時間割のセル表示

## ライセンス

このプロジェクトは [MIT ライセンス](LICENSE) の下で公開されています。
