ROX2026 設計データ追加ガイド
==============================

HTMLやCSSを触らずに、新しい機構のデータを追加する手順です。

1. design/TEMPLATE フォルダをコピーします。
2. コピーしたフォルダ名を英小文字の機構名に変更します。
   例: drivetrain / shooter / camera
3. CADファイルを入れます。
   例: component.step、component.stl、drawing.pdf
4. 機構が分かる preview.webp を入れます。
5. README.md に、目的・担当・公開するファイルを書きます。
6. GitHubにアップロードします。
7. data/components.json に機構の情報とダウンロードリンクを追加します。

GitHubのWebブラウザだけでアップロードする方法
----------------------------------------------

1. GitHubでこのRepositoryを開きます。
2. design フォルダ内の追加先フォルダを開きます。
3. 「Add file」→「Upload files」を選びます。
4. ファイルをドラッグ&ドロップします。
5. 下部の「Commit changes」を押します。

components.jsonの file には、Repositoryの先頭からのパスを書きます。
例: "design/new-mechanism/component.step"

公開する前のチェック
----------------------

- ファイル名とcomponents.jsonのパスは一致していますか？
- preview.webpは機構の内容が分かる画像ですか？
- 個人情報や公開不可の設計が含まれていませんか？
- 大会後に公開するデータを誤って公開していませんか？
