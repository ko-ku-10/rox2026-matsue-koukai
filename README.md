# ROX2026 Robot Technology Archive

ROX2026で使用するロボットの設計、機構、制御、開発過程を公開するための静的Webサイトです。競技ロボットを見た他チームや一般の方が、**何を・なぜ採用し・どう改善したか**を追える技術アーカイブを目指しています。

サイトはHTML / CSS / JavaScriptだけで構成されています。npm、ビルドツール、外部API、サーバーは不要です。このRepositoryをGitHub Pagesに配置するだけで動作します。

> Robot本体のプログラムは、このサイトへコピーしません。既存のRobot Repositoryを正本とし、このサイトは該当コードへのリンクだけを管理します。

## 公開される内容

- ロボット全景と、クリック・タップできる部位ポイント
- 足回り、シュート、ボール保持、ステレオカメラ、電装、空圧、非常停止の詳細
- 設計の目的、採用理由、工夫、苦労、失敗、改善、使用部品、担当
- CAD・図面・PDFなどのダウンロード一覧
- Robot Repositoryの機能別リンク
- 試作から大会機までの開発履歴

## GitHub Pagesで公開する

1. このフォルダ一式をGitHub Repositoryのルートへ置きます。
2. GitHubのRepositoryで **Settings** → **Pages** を開きます。
3. **Build and deployment** の Source で **Deploy from a branch** を選びます。
4. Branch は **main**、Folder は **/(root)** を選び、**Save** を押します。
5. 数分後に表示されるURLを開きます。

`index.html` がRepositoryのルートにあることが重要です。`docs/` フォルダを公開元にする必要はありません。

## ファイル構成

```text
.
├── index.html                    # ページの骨組み
├── css/
│   └── style.css                 # すべての見た目とレスポンシブ対応
├── js/
│   └── main.js                   # JSON読込、hotspot、詳細パネル
├── data/
│   ├── components.json           # 機構とhotspot、ダウンロード情報
│   ├── software.json             # Robot Repositoryへのリンク
│   └── history.json              # 開発履歴
├── assets/
│   ├── robot/
│   │   ├── robot-hero.png        # 現在のロボット全景画像
│   │   └── robot-placeholder.svg # 画像差し替え前の予備画像
│   └── components/               # 部位ごとの写真を置く場所
├── design/
│   ├── TEMPLATE/                 # 新機構追加用のテンプレート
│   ├── drivetrain/               # サンプル機構のデータ置き場
│   ├── shooter/
│   ├── ball-handler/
│   ├── stereo-camera/
│   ├── electronics/
│   ├── pneumatics/
│   └── emergency-stop/
└── docs/                         # 共通の公開資料
```

## ローカルで確認する

`main.js` は `fetch()` でJSONを読み込みます。そのため、`index.html` をダブルクリックして `file://` で開くと、ブラウザによってはデータを読めません。

Pythonが使える場合は、このRepositoryのルートで次を実行してください。

```bash
python -m http.server 8000
```

その後、ブラウザで [http://localhost:8000/](http://localhost:8000/) を開きます。停止するにはターミナルで `Ctrl + C` を押します。

表示確認では、以下をチェックしてください。

- ロボット画像の上に7つのhotspotがある
- hotspotをクリックまたはキーボードで選ぶと詳細パネルが開く
- 閉じるボタン、背景クリック、`Esc`キーでパネルを閉じられる
- ダウンロードとSoftwareの一覧が表示される
- スマホ幅で詳細パネルが下から開く

## 新しい機構を追加する

HTMLを編集する必要はありません。

1. `design/TEMPLATE/` をコピーします。
2. コピー先のフォルダ名を英小文字・ハイフン区切りで付けます。例: `design/arm-lift/`
3. CAD、図面、`preview.webp`、READMEを入れます。
4. `data/components.json` に機構のオブジェクトを1つ追加します。
5. ローカルサーバーで表示を確認します。

### `components.json` の最小例

```json
{
  "id": "arm-lift",
  "name": "アーム機構",
  "nameEn": "Arm Lift",
  "shortDescription": "高さを変える昇降機構",
  "description": "どのような機構かを説明します。",
  "purpose": "何のために使うか",
  "reason": "なぜこの方式にしたか",
  "designer": "機械班",
  "image": "assets/components/arm-lift.webp",
  "hotspot": { "x": 50, "y": 42 },
  "downloads": [
    {
      "label": "STEPをダウンロード",
      "file": "design/arm-lift/arm-lift.step",
      "category": "mechanical",
      "format": "STEP",
      "size": "1.2 MB"
    }
  ],
  "software": ["motor-control"]
}
```

### hotspotの置き方

`hotspot.x` と `hotspot.y` はロボット画像の左上を `(0, 0)`、右下を `(100, 100)` としたパーセント座標です。

- `x: 50, y: 50` は画像中央
- `x: 32, y: 75` は左寄り・下寄り
- 画像を差し替えたら、ブラウザで表示しながら数値を少しずつ調整してください

## CAD・設計データを追加する

### 設計担当者の手順

1. `design/TEMPLATE` をコピーしてフォルダ名を変更します。
2. `component.step`、`component.stl`、`drawing.pdf`、`preview.webp` などを入れます。
3. `README.md` に目的、担当、公開するファイルを記載します。
4. `data/components.json` の該当機構にダウンロード項目を追加します。
5. 表示確認後、GitHubへアップロードします。

GitHubのブラウザ画面から追加する場合は、追加先のフォルダで **Add file** → **Upload files** を選び、ファイルをドラッグ&ドロップして **Commit changes** を押します。詳しい手順は [design/TEMPLATE/README_FOR_MEMBER.txt](design/TEMPLATE/README_FOR_MEMBER.txt) にもあります。

### ダウンロード項目の書き方

```json
{
  "label": "組立図を見る",
  "file": "design/arm-lift/drawing.pdf",
  "description": "アーム機構の組立図",
  "category": "documents",
  "format": "PDF",
  "size": "840 KB"
}
```

`category` には `mechanical`、`electrical`、`pneumatic`、`documents` を使えます。ファイルをまだ公開しない場合は、`"available": false` を加えると「準備中」と表示され、リンク切れを防げます。

## 写真を追加・差し替えする

- ロボットの全景: `assets/robot/robot-hero.png` を、同じファイル名の画像で差し替える
- 部位の写真: `assets/components/` に画像を置き、`components.json` の `image` にパスを指定する
- 追加写真: `images` にパスの配列を指定する。例: `"images": ["assets/components/arm-1.webp", "assets/components/arm-2.webp"]`
- 開発履歴の写真: `data/history.json` の各項目の `images` に複数のパスを指定する

Web用には、写真は横幅1600px程度・WebPまたは圧縮済みPNG/JPEGを推奨します。極端に大きな画像はPagesの表示を遅くします。

## Softwareリンクを追加する

Robotの実プログラムは別Repositoryを正本にし、このRepositoryへコピーしません。`data/software.json` に機能ごとのリンクを追加または修正します。

```json
{
  "id": "arm-control",
  "name": "Arm Control",
  "description": "アームの位置・速度を制御します。",
  "repository": "https://github.com/組織名/robot-repository",
  "source": "https://github.com/組織名/robot-repository/tree/ROX2026-final/src/arm",
  "tag": "ROX2026-final"
}
```

- `id`: 英小文字・ハイフン区切りの重複しないID
- `repository`: Robot Repositoryのトップ
- `source`: できる限り該当ソースファイルまたはフォルダへの直接リンク
- `tag`: 大会時点を示すタグ名

`components.json` の `software` には、この `id` を配列で指定します。詳細パネルに関連リンクが自動で表示されます。

初期サンプルでは `YOUR_ORGANIZATION/ROX2026-robot` になっています。実際のRepository URLへ必ず置き換えてください。

## 大会時点のプログラムを固定する

`main` ブランチは将来変更されます。大会本番で使用したプログラムを固定して公開するため、**大会終了時に `ROX2026-final` タグを作成してください。**

例:

```bash
git tag -a ROX2026-final -m "ROX2026 competition final"
git push origin ROX2026-final
```

GitHub Releaseを使う場合は、このタグからReleaseを作成します。サイトの `source` URL は、`main` ではなく `tree/ROX2026-final/...` または `blob/ROX2026-final/...` を指すようにしてください。

## よくあるトラブル

| 症状 | 確認すること |
| --- | --- |
| 「データを読み込めませんでした」と出る | `file://` ではなく `python -m http.server 8000` で開いているか、JSONの末尾に余分なカンマがないかを確認します。 |
| hotspotが表示されない | `components.json` が正しいJSONか、各項目に `hotspot.x` と `hotspot.y` があるかを確認します。 |
| hotspotの位置がずれる | 画像の差し替え後にx/yの百分率を調整します。画像は画面上でトリミングされない比率を推奨します。 |
| Downloadが「準備中」になる | `available: false` を削除し、`file` のパスと実際のファイル名を一致させます。 |
| 画像が出ない | `image` のパス、大文字小文字、GitHubへ画像をpush済みかを確認します。 |
| Softwareリンクが404になる | `YOUR_ORGANIZATION` を実際の組織名へ変更し、`ROX2026-final` タグとフォルダパスが存在するかを確認します。 |
| GitHub PagesでCSSやJSONが更新されない | 数分待ってからスーパーリロードし、Repositoryの公開元が `main / (root)` かを確認します。 |

## 更新時の目安

| 変更したいもの | 編集する場所 |
| --- | --- |
| ロボット全景 | `assets/robot/robot-hero.png` |
| 機構、hotspot、部品、設計データ | `data/components.json` |
| Robotソフトウェアのリンク | `data/software.json` |
| 試作・改善の履歴 | `data/history.json` |
| デザイン | `css/style.css` |
| 表示や操作の仕組み | `js/main.js` |

## ライセンス・公開ポリシー

公開する前に、チームの方針、大会規約、使用部品・外部ライブラリ・第三者設計データのライセンスを確認してください。安全に関わる配線図や制御情報も、公開範囲をチームで確認してから掲載します。
