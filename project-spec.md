# プロジェクト仕様書

## 1. この文書の目的

この文書は、この作業フォルダにおける現時点の正本となる仕様書です。

役割は以下の通りです。

- 最新の仕様を一か所に集約する
- 現在の運用ルールと前提条件を明確にする
- 仕様変更が起きたときに古い記述を放置しない
- 別デバイスの Codex でも、チャット履歴に依存せず作業を継続できるようにする

## 2. 現在のプロジェクト段階

2026-04-06 の初期確認時点では、このワークスペースに既存ファイルは存在せず、最初の作業は文書運用ルールの整備でした。

2026-04-10 の再確認時点では、文書整理だけでなく、建設業向け LP の静的プロトタイプ実装まで進んでいます。

その後、ユーザーから以下の方向性が新たに提示されています。

- 中小企業向けに AI コンサルを提供したい
- どの業界から着手するべきかを分析したい
- AI によって手作業がどう改善されるかを営業文言として整理したい
- まずは LP を作成し、流入を取りに行きたい

よって、現在の作業段階は以下です。

- 中小企業向け AI コンサル事業の市場仮説を整理する
- 最初に狙う業界候補を評価する
- 業界別に横展開できる LP テンプレートを整理する
- LP に使う訴求軸、参考サイト、営業文言の方向性を整理する
- AI ツール導入ではなく、AI 活用伴走コンサルとしての訴求を固める
- 建設業向け LP の初回プロトタイプを実装する
- 建設業向け LP を共通テンプレート + 業種別データで再生成できる形へ整理する
- 不動産業向け LP を、横展開テストとして追加実装する
- ユーザー提供の業種一覧 CSV を取り込み、今後は `詳細業種` 単位で LP を作るための基準データを整備する
- 公開中の業種 LP に横断導線を付けるため、業種別ポータルページを整備する
- GitHub Pages は制作中 LP のレビュー / 下書き共有環境として使い、本番配信はユーザー側の Cloudflare 反映で行う
- 詳細業種 LP は、ユーザー指定に従って大カテゴリ単位でまとめて制作し、その大カテゴリが完成したタイミングで確認へ進む
- 制作順は、個別指示がない限り `その他` を先に処理し、その後は CSV の上から順に進める
- 2026-04-13 時点では、公開中 LP の訴求を「文書整理支援」中心から、「活用方針、ツール選定、連携、半自動化、自動化候補まで含む AI コンサル」へ順次統一している
- 2026-04-13 時点では、公開中 LP の主要 CTA は公式LINE `https://lin.ee/OMcemid` へ統一し、ヘッダー、Hero、導入フロー、FAQ、最終セクションまで LINE 導線に合わせて整えている
- 2026-04-13 時点では、SP 版でもヘッダー右上に `LINE相談` CTA を表示し、主要見出しの孤立改行が出にくいよう共通 CSS を調整済みである
- 2026-04-14 時点では、詳細業種 LP の Hero 見出しを `業種名を繰り返す` 形から、`重い業務を2つ並べる / 〇〇目線で整える。` の 2 行型へ寄せる方針に切り替えている
- 2026-04-16 時点では、残っていた `士業` `小売・卸売` `建設` `物流・運輸` `自動車` `製造` `農業・食品` `金融・保険` の詳細業種 LP をまとめて追加し、CSV 掲載の 101 詳細業種をすべて公開できる状態にした
- 2026-04-16 時点では、詳細業種 LP の主要画像は `unit_code` ごとの専用画像を原則とし、カテゴリ共通画像は「見た目に違和感がない」と確認できる場合に限って限定利用する方針へ更新した
- 2026-04-16 時点では、`タクシー` と `引越し` のように詳細業種と画像文脈がずれる例が確認されたため、カテゴリ共通画像の再監査と専用画像への差し替えを順次進めている
- 2026-04-17 時点では、問い合わせツール由来の新マスタ `データベース -> 大カテゴリ` へ運用を切り替え、`旧Pending` を除く 7 グループの大カテゴリ LP を一通り生成した
- 2026-04-17 時点では、新マスタの公開一覧は `不動産・士業` `建設・物流` `IT・サービス` `製造` `医療・福祉` `小売・自動車` `その他（農業・金融）` の 7 グループだけを表示し、`旧Pending` は引き続き非表示としている
- 2026-04-22 時点では、`GPT Image 2` を LP デザインの主導役として使うテストを `main-shigyo` で実施し、単なる色替えではなく、セクション構造や見出しトーンまで含めて別のLPに見えるレベルへ再設計する方針を採用した
- 分析結果をもとに次の制作・営業準備へつなげる

現在のフォルダ構成としては、主に以下を管理対象とします。

- `data/`
  - ユーザー提供の業種一覧 CSV
  - 詳細業種カタログ JSON
- `docs/`
  - 正本仕様書
  - 判断履歴
  - 市場分析
  - LP 方針
  - 実装メモ
- `site/`
  - 共通テンプレート、業種別データ、生成済み LP、画像素材
- `tools/`
  - Kie.ai を使った画像生成補助スクリプト
  - LP 再生成と見た目確認の補助スクリプト
  - 詳細業種 LP の叩き台生成スクリプト
  - 残り詳細業種 LP を一括生成するスクリプト
- `deliverables/`
  - 完成した LP を外部共有しやすい形で切り出した出力先
- `site/industry-data/group-categories/`
  - 問い合わせツール由来の新マスタに基づく大カテゴリ LP の正本 JSON
- `publish/ai-sabi-lp/`
  - GitHub Pages 公開用の Git リポジトリ
  - 現時点では公開 HTML だけでなく、`templates/` `industry-data/` `build_industry_lp.py` `project-spec.md` も含めた公開・再現用の最小構成を持つ
- `temp-stepbase.html`
  - StepBase LP の HTML スナップショット
  - 現行の AI-SABI LP 本体ではなく、参照確認用ファイルとして扱う

そのため、現段階の「開発」は、事業設計、LP 設計、営業文言設計、文書運用整備に加えて、建設業向け LP の静的プロトタイプ制作と素材生成フロー整備まで含む準備・制作フェーズです。

## 3. 文書構成

現在は以下の文書構成を基本とします。

- `docs/project-spec.md`
  - 最新の正式仕様
  - 最新の運用ルール
  - 最新の確定前提
  - レビュー観点と判断基準
- `docs/current-development-overview-2026-04-10.md`
  - 現在このフォルダで何を開発しているかの全体サマリー
  - 管理対象ファイルと参照用ファイルの切り分け
  - 別デバイスの Codex が最初に把握すべき状況整理
- `docs/decision-log.md`
  - 時系列の判断履歴
  - 仕様変更や対応判断の理由
  - 何を変えたか、なぜ変えたか、確認が必要だったかの記録
- `docs/codex-workflow-spec.md`
  - Codex の作業開始時レビュー手順
  - 文書更新の順番
  - 新しい仕様書や分析資料を追加する基準
  - 根本変更時の確認ルール
- `docs/industry-lp-generation-spec-2026-04-10.md`
  - 業種別 LP の生成ルール
  - テンプレート、JSON、生成物の役割整理
  - 新しい業種を追加する手順
- `docs/real-estate-lp-implementation-2026-04-10.md`
  - 不動産業向け LP の選定理由
  - 不動産業版の文言・画像・表示確認メモ
- `docs/industry-unit-catalog-2026-04-12.md`
  - 詳細業種単位の正式一覧
  - 既存の広い業種 LP と詳細業種 LP の関係整理
  - 詳細業種 LP の叩き台生成ルール
- `docs/source-handoff-bundle-guide-2026-04-13.md`
  - 外部共有や Cloudflare 反映向けの bundle 出力ルール
  - `tools/export_share_bundle.py` の使い方
- `docs/all-remaining-detail-lp-batch-2026-04-16.md`
  - 残り詳細業種 LP 68 本の一括追加メモ
  - カテゴリ共通画像の生成方針と代表確認結果
- `docs/*.md` の分析資料
  - 個別テーマの市場調査
  - LP 方針
  - 営業文言案
  - 業界比較や仮説整理

運用ルール:

- 仕様が変わった場合は、まず `docs/project-spec.md` を更新し、常に最新状態を反映させる
- 新しい作業を始める際は、まず `docs/project-spec.md`、`docs/current-development-overview-2026-04-10.md`、`docs/codex-workflow-spec.md`、`docs/decision-log.md` の直近内容を確認する
- その後、`docs/decision-log.md` に変更内容と理由を記録する
- 個別テーマの詳細分析が必要な場合は、別紙の分析資料を追加する
- 既存文書と別テーマになる重要な検討が始まった場合は、新しい仕様書または分析資料を作成して残す
- 新しいファイルを追加した場合は、その役割が正式成果物か参照資料かを文書側へ明記する
- UI の細かい調整では、修正後にスクリーンショット確認まで行い、違和感があればそのまま再修正してから共有する
- 詳細業種 LP をまとめて追加する場合は、大カテゴリ単位で途中停止理由も文書へ残し、完了条件を満たした時点でカテゴリ完了として共有する
- LP が完成したら、レビュー URL の共有だけで終わらせず、外部共有や本番反映に使える HTML / CSS / assets の受け渡し単位も明示する
- 外部共有用ファイルが必要になったら、LP 本体から必要 assets だけを抜き出した bundle を生成し、その bundle を受け渡し正本として扱う
- CTA の遷移先は LP ごとに変えられる前提とし、外部導線が公式 LINE などに変わる場合は、ボタン文言、導入フロー、問い合わせセクションの表現も合わせて見直す
- LP 作成後の `build -> publish同期 -> commit -> push -> bundle出力` は、Windows では `tools/publish_ai_sabi_lp.ps1` を標準入口として扱う
- Windows 側で `git` が PATH に出ていない場合でも、`C:\Program Files\Git\cmd\git.exe` を優先候補として検出し、publish フローを継続できる前提で運用する

## 4. 必須の文書更新ルール

今後このフォルダで行う作業は、以下のルールに従って文書化します。

### 4.1 新しい考え・処理・対応は都度記録する

新しい考え方、処理方針、対応方針、実装方針、運用判断が発生した場合は、必ず以下を記録します。

- 何を行ったか、または何を決めたか
- なぜその判断にしたか
- 判断に影響した代替案があれば何だったか
- どの仕様や運用に影響するか

### 4.2 追記だけで終わらせない

認識や仕様が変わった場合は、古い内容を残したまま追記だけする運用にはしません。

必ず以下の順番で対応します。

1. `docs/project-spec.md` の該当箇所を更新する
2. 現状と合わなくなった古い記述は書き換える
3. 必要なら個別仕様書や分析資料も更新または追加する
4. `docs/decision-log.md` に、何をどう変えたかとその理由を記録する

### 4.3 根本的な変更は更新前に確認する

プロジェクトの方向性や前提を大きく変える変更は、仕様書を書き換える前に必ずユーザーへ確認します。

確認が必要な例:

- 当初のプロジェクト目的が変わる
- 主な成果物が変わる
- 対象ユーザーや業務フローが変わる
- 主要な外部連携先が変わる
- 後続作業に強く影響するデータ構造や運用方針が変わる
- これまでの主要前提を覆す変更になる

確認時の表現例:

- 「当初は X という前提で整理していましたが、現状を見ると Y に変更した方が自然です。仕様をこの内容に更新してよいですか？」

### 4.4 別デバイスの Codex でも再開できる粒度で書く

すべての文書は、別デバイスの Codex が見ても迷わない粒度で記載します。

少なくとも重要な更新では、以下が追えるようにします。

- 目的
- 背景
- 判断内容
- 判断理由
- 影響範囲
- 未解決事項
- 次に想定される対応

### 4.5 新しい仕様書や分析資料を作る条件

以下のいずれかに当てはまる場合は、既存文書への追記だけで済ませず、新しい仕様書または分析資料を追加します。

- 新しいテーマや検討軸が立ち上がったとき

## 5. LP作成後の公開・Git運用フロー

LP の設計やコンテンツ作成そのものとは別に、作成後の反映手順は以下を正本とする。

### 5.1 反映対象

`publish/ai-sabi-lp/` に同期する対象は、現時点では以下。

- `site/index.html`
- `site/styles.css`
- `site/assets/`
- `site/industries/`
- `site/templates/`
- `site/industry-data/`
- `tools/build_industry_lp.py` -> `publish/ai-sabi-lp/build_industry_lp.py`
- `docs/project-spec.md` -> `publish/ai-sabi-lp/project-spec.md`

補足:

- 過去文書では `index.html` `styles.css` `assets/` `industries/` の 4 点同期前提だったが、2026-04-22 時点の publish リポジトリ実態はそれより広い。
- 現在は、公開確認だけでなく「publish 側だけ見ても最低限の再現ができる状態」を維持するため、`templates/` や `industry-data/` も同期対象に含める。

### 5.2 標準コマンド

Windows での標準コマンドは以下。

```powershell
powershell -ExecutionPolicy Bypass -File .\tools\publish_ai_sabi_lp.ps1 `
  -ConfigPath .\site\industry-data\real-estate.json `
  -CommitMessage "Update real-estate LP outputs" `
  -Push
```

このコマンドが行うこと:

1. 指定 JSON から LP を再生成する
2. `publish/ai-sabi-lp/` へ同期する
3. publish リポジトリで `git add` / `git commit` を行う
4. `origin/main` へ push する

### 5.3 よく使う実行パターン

既存の生成物だけを同期・push したい場合:

```powershell
powershell -ExecutionPolicy Bypass -File .\tools\publish_ai_sabi_lp.ps1 `
  -SkipBuild `
  -CommitMessage "Sync latest LP outputs" `
  -Push
```

bundle も同時に出したい場合:

```powershell
powershell -ExecutionPolicy Bypass -File .\tools\publish_ai_sabi_lp.ps1 `
  -ConfigPath .\site\industry-data\real-estate.json `
  -ExportBundle `
  -ForceBundle `
  -CommitMessage "Update real-estate LP outputs" `
  -Push
```

### 5.4 Git 運用の前提

- publish 用 Git リポジトリは `publish/ai-sabi-lp/.git`
- remote `origin` は `https://github.com/mswpaff-stack/ai-sabi-lp.git`
- branch は `main`
- 現在の Windows 端末では Git for Windows を導入済みであり、PATH 未反映のシェルでも `tools/publish_ai_sabi_lp.ps1` 側で Git 実体を検出して継続できるようにしている

### 5.5 Codex の運用ルール

今後、LP 作成後に Git 反映まで求められた場合は、原則として以下の順で進める。

1. 対象 JSON / 対象 slug / 変更範囲を確認する
2. 必要なら `python tools/build_industry_lp.py --config ...` 相当の生成を行う
3. `tools/publish_ai_sabi_lp.ps1` を使って publish リポジトリへ同期する
4. commit 内容を説明できるメッセージで記録する
5. push 後に公開 URL または deliverables の導線を案内する

### 5.6 レビュー観点

このフロー実行前後では、少なくとも以下を確認する。

- 対象 LP が意図した slug に出力されているか
- 主要 CTA、見出し、画像差し替えが崩れていないか
- `publish/ai-sabi-lp/` の同期対象が古い仕様の 4 点だけに戻っていないか
- 外部共有が必要なら bundle の出力要否を確認したか
- 後続作業で繰り返し参照する内容をまとめる必要があるとき
- `docs/project-spec.md` に入れると情報が肥大化し、正本として読みづらくなるとき
- 実装、LP 制作、営業資料、業界別提案などで個別に詳細仕様が必要なとき

新しい文書を作る場合も、関連する現行仕様は先に更新し、その後に個別文書を追加します。

### 4.6 新しいファイルの役割を明記する

新しいファイルやディレクトリを追加した場合は、別デバイスの Codex が見ても迷わないよう、少なくとも以下のどれに当たるかを文書へ残します。

- 正式成果物
- 正本仕様書
- 個別仕様書 / 分析資料
- 実装ファイル
- 参照資料
- 一時ファイル

特に、内容だけでは役割が分かりにくいファイルは、`docs/project-spec.md` または関連仕様書で用途を補足します。

## 5. 標準作業手順

新しい作業を始める前に、以下の順番で確認します。

1. `docs/project-spec.md` を読む
2. `docs/current-development-overview-2026-04-10.md` を読む
3. `docs/codex-workflow-spec.md` を読む
4. `docs/decision-log.md` の直近履歴を読む
5. 今回の依頼に関係する分析資料や個別仕様書を読む
6. 今回の依頼が現在の目的と矛盾しないか確認する
7. 今回の作業が以下のどれに当たるか判断する
   - 現行仕様の範囲内の通常拡張
   - 既存仕様の修正
   - ユーザー確認が必要な根本変更

作業中の対応:

1. 新しい判断や前提が出たら控える
2. 仕様が変わる場合は、まず影響を受ける現行文書を更新する
3. 新しいテーマなら、必要に応じて個別仕様書や分析資料を作成する
4. 新しいファイルを追加した場合は、その役割を現行文書へ反映する
5. その後 `docs/decision-log.md` に理由を記録する

作業後の確認:

1. 結果が当初目的と矛盾していないか確認する
2. 新しい矛盾や曖昧な前提が生まれていないか確認する
3. 必要なら次の提案や是正案を示す

## 6. 定期レビュー観点

このレビューは、作業開始時、重要な変更の前後、意味のある作業を行った後に定期的に実施します。

### 6.0 レビューを必ず行うタイミング

- 新しいセッションで再開したとき
- 別デバイスの Codex がこのフォルダを引き継ぐとき
- 重要な仕様変更や判断変更の前後
- 新しい分析資料や仕様書を追加したとき
- LP 制作、営業資料化、実装など次の工程へ進む前
- 現在の依頼と既存文書のあいだにずれの可能性を感じたとき

### 6.1 目的整合性の確認

- いま何を達成しようとしているのか
- 今回の作業はその目的に沿っているか
- 当初意図していた方向から逸れていないか

### 6.2 仕様整合性の確認

- 既存仕様と矛盾する作業をしていないか
- 文書内に現状と一致しない古い記述が残っていないか
- 最新仕様と判断理由の両方が追える状態になっているか

### 6.3 前提条件の確認

- 暗黙の前提を明文化すべき状況になっていないか
- 過去の前提が無効になっていないか
- 別デバイスや別セッションでも安全に再開できる情報量があるか

### 6.4 提案の必要性確認

矛盾、方針のずれ、未整理の論点が見つかった場合は、そのまま進めず対応案を提示します。

対応案の例:

- 仕様書の特定章を更新する
- 根本方針の変更可否を確認する
- 大きい目的を小さな作業単位に分割して明記する
- 未解決事項として保留管理する

## 7. 現時点で確定している事実

現時点で確定している事項は以下です。

- 2026-04-06 の初期確認時点で、このワークスペースは空だった
- このフォルダ内に既存の仕様書や運用文書は存在しなかった
- 最初の作業は、今後のための文書運用基盤を整えることだった
- 現在のテーマは「中小企業向け AI コンサル事業の立ち上げ準備」である
- 当面の成果物候補として、業界分析、LP 方針、営業文言、参考事例整理が必要になっている
- LP は、業界ごとに悩みやユースケースを差し替えながら横展開できるテンプレート前提で設計する
- MV は、対象業界が一目で分かる背景画像を使う方針とする
- 横展開は一括量産ではなく、需要と相性の高い業種から段階的に追加する
- LP の質を優先し、主要画像は各業種向けに専用生成する。別業種 LP のメイン画像をそのまま流用しない
- 料金は LP 上で具体金額を固定表示せず、複数プランありの前提で問い合わせ誘導する
- 訴求の中心は AI ツール導入ではなく、自社課題を AI 活用で解消する伴走型コンサルである
- LP 訴求では、文書整理だけに限定せず、要約、一次対応、ツール連携、半自動化、自動化候補まで含めた AI 活用伴走コンサルとして表現する
- 現在のフォルダ直下には `docs`、`site`、`tools` ディレクトリが存在する
- ルートには `temp-stepbase.html` も存在し、その内容は StepBase LP の HTML スナップショットである
- 建設業向け LP の初回静的プロトタイプを `site/` 配下に実装済みである
- 建設業向け LP は、ネイビー、ブルー、シアンを基調にした工業的でスタイリッシュなトンマナと、長尺のカード構成、比較表、FAQ を組み合わせた視覚重視の構成へ更新済みである
- 現行 LP では、ヘッダー内グローバルナビを右寄せにし、公開中 LP の CTA は `LINE相談` `LINEで無料相談` `公式LINEで相談する` を基本表現としている
- 建設業 LP は、`site/templates/industry_lp_base.html` と `site/industry-data/construction.json` を正本ソースとして、`tools/build_industry_lp.py` で再生成する構成へ移行済みである
- `site/index.html` はルートプレビュー用の生成結果、`site/industries/construction/index.html` は建設業向けの業種別出力として扱う
- 新しい業種追加用の雛形として `site/industry-data/_industry-template.json` を追加済みである
- 詳細業種 LP 用の内部テンプレートとして `site/industry-data/_detail-industry-template.json` を追加済みである
- 不動産業向け LP を `site/industry-data/real-estate.json` と `site/industries/real-estate/index.html` で追加済みである
- 不動産業向け画像として `site/assets/real-estate-*.png` を追加済みである
- 製造業向け LP を `site/industry-data/manufacturing.json` と `site/industries/manufacturing/index.html` で追加済みである
- 卸売業向け LP を `site/industry-data/wholesale.json` と `site/industries/wholesale/index.html` で追加済みである
- 専門サービス業向け LP を `site/industry-data/professional-services.json` と `site/industries/professional-services/index.html` で追加済みである
- 人材サービス業向け LP を `site/industry-data/staffing.json` と `site/industries/staffing/index.html` で追加済みである
- 運輸・物流業向け LP を `site/industry-data/logistics.json` と `site/industries/logistics/index.html` で追加済みである
- 上記 5 業種分の Hero、理由、活用例画像として `site/assets/<slug>-*.png` を業種ごとに専用生成済みである
- 業種別 LP の一覧入口として `site/industries/index.html` を追加済みであり、ここから公開中の 7 業種 LP へ遷移できる
- `data/industry_categories.csv` に、ユーザー提供の詳細業種一覧 101 件を取り込み済みである
- `data/industry-unit-catalog.json` に、上記 CSV をもとにした 12 カテゴリ / 101 業種の機械可読カタログを生成済みである
- 今後の詳細業種 LP の正式な制作単位は、CSV の `詳細業種` 1 行ごとの単位とする
- 2026-04-12 時点で、CSV の上から 5 件にあたる `EC・通販` `Web制作` `アプリ開発` `コンサルティング` `システム開発` の詳細業種 LP を追加済みである
- 上記 5 件の正本は `site/industry-data/detail-units/it-services-01.json` から `it-services-05.json` であり、公開出力は `site/industries/it-services-01/` から `it-services-05/` で管理する
- `data/industry-unit-catalog.json` では、上記 5 件を `published` として管理し、`tools/build_industry_unit_catalog.py` の再生成でも `lp_status` `published_path` `published_url` `source_json_path` を保持する
- 2026-04-13 時点で、CSV の続き 5 件にあたる `ネットワーク・インフラ` `人材派遣・紹介` `動画・映像制作` `広告・デザイン` `清掃・ビルメンテナンス` の詳細業種 LP を追加済みである
- 2026-04-13 時点で、さらに CSV の続き 5 件にあたる `翻訳・通訳` `警備・セキュリティ` `エステ・ネイル` `スポーツ・フィットネス` `ペット・動物病院` の詳細業種 LP を追加済みである
- `site/industry-data/detail-units/it-services-11.json` `it-services-12.json` `other-01.json` `other-02.json` `other-03.json` を正本とし、公開出力は `site/industries/it-services-11/` `it-services-12/` `other-01/` `other-02/` `other-03/` で管理する
- 2026-04-13 時点で、`医療・福祉` カテゴリ 8 件にあたる `介護・デイサービス` `整骨院・鍼灸` `歯科` `病院・クリニック` `老人ホーム・施設` `訪問看護・訪問介護` `調剤薬局` `障害者支援・就労支援` の詳細業種 LP を追加済みである
- `site/industry-data/detail-units/healthcare-welfare-01.json` から `healthcare-welfare-08.json` を正本とし、公開出力は `site/industries/healthcare-welfare-01/` から `healthcare-welfare-08/` で管理する
- `site/industries/index.html` は、問い合わせツールから取得した `data/outreach-tool-db-category-map-2026-04-17.csv` を正本とし、`データベース` ごとの大カテゴリ LP を一覧表示するポータルとして運用する
- 大カテゴリ LP の正本 JSON は `site/industry-data/group-categories/<db_value>-<category_slug>.json` に置く
- 一覧に表示するのは、新マスタ基準で `published` になっている大カテゴリ LP のみとし、旧来の詳細業種 LP は公開ファイルが残っていても一覧からは外す
- 新マスタでグループ単位制作を進める際、`旧Pending` は当面制作対象から外す
- 一覧ページでは、CSV に存在しない親カテゴリ LP のリンクは一旦表示しない
- Kie.ai を使った画像生成スクリプト、LP 再生成スクリプト、Playwright による見た目確認スクリプトを `tools/` 配下に追加済みである
- `GPT Image 2` を使う試作では、まず LP 全体のデザインモックを生成し、その見た目を基準に Hero 画像と HTML/CSS を調整する流れを採用できる状態にしてある
- `tools/build_industry_unit_catalog.py` を追加し、CSV から詳細業種カタログ JSON を再生成できるようにしてある
- `tools/create_detailed_industry_lp_stub.py` を追加し、詳細業種カタログの 1 件から叩き台 JSON を生成できるようにしてある
- `tools/build_industries_portal.py` を追加し、`data/industry-unit-catalog.json` の `published` 状態から `site/industries/index.html` を自動再生成できるようにしてある

## 8. 現在の未確定事項

以下はまだ未定であり、ユーザーから具体的な依頼を受け次第追記します。

- 最初の提供メニューの範囲
- 集客チャネル（広告、SEO、紹介、商工会議所経由など）
- 価格帯、支援期間、成果指標
- フォーム送信先や予約導線の接続方法
- 実装を今後も静的 HTML ベースで進めるか、別フレームワークへ移すか
- 次の詳細業種 LP を `it-services-06` 以降の同カテゴリから進めるか、別カテゴリの先頭へ移るか
- 詳細業種 LP の公開 slug を、当面 `unit_code` のまま維持するか、読みやすい別 slug を付けるか

## 9. 初期方針の判断内容

今回の文書構成を「最新仕様」と「判断履歴」に分けた理由は以下です。

- 最新仕様だけを見たいときに読みやすくするため
- なぜそうなったかの履歴も失わないため
- 別デバイスの Codex が、現状と経緯の両方を追いやすくするため

## 10. 現在の関連ドキュメント

現時点で参照すべき市場分析、LP 方針、運用仕様は以下に整理する。

- `docs/sme-ai-consulting-market-analysis-2026-04-06.md`
  - 最初に狙う業界候補の比較
  - LP 訴求の方向性
  - 営業文言のたたき台
  - 参考サイト
  - 今後の提案
- `docs/current-development-overview-2026-04-10.md`
  - 現在の開発テーマの要約
  - 現在の成果物一覧
  - 正式成果物と参照用ファイルの整理
  - 直近で確認すべき未確定事項
- `docs/lp-template-strategy-2026-04-06.md`
  - LP 構成案の評価
  - 共通テンプレートと差し替え部分の整理
  - 参考 LP からの学び
  - 次の制作ステップ
- `docs/industry-lp-generation-spec-2026-04-10.md`
  - 業種別 LP の実装済みテンプレート構成
  - JSON 正本、生成物、補助スクリプトの役割
  - 追加業種の作成手順と確認フロー
- `docs/real-estate-lp-implementation-2026-04-10.md`
  - 不動産業を横展開先に選んだ理由
  - 不動産業向け LP のコピー方針
  - 生成画像と表示確認の記録
- `docs/industry-priority-roadmap-2026-04-11.md`
  - 横展開する業種の優先順
  - 実装済み業種と次に着手する候補
  - 細分化の進め方
- `docs/industry-unit-catalog-2026-04-12.md`
  - 詳細業種 101 件のカタログ
  - `unit_code` と `lp_status` の管理ルール
  - 親カテゴリ LP と詳細業種 LP の対応関係
- `docs/real-estate-detail-lp-batch-2026-04-13.md`
  - 不動産カテゴリ 3 件の詳細業種 LP 実装内容
  - 専用生成画像、公開 URL、一覧ページ反映内容
- `docs/it-services-detail-lp-batch-2026-04-12.md`
  - CSV 上から 5 件の詳細業種 LP 実装内容
  - 5 本分の専用画像、公開 URL、一覧ページ更新内容
- `docs/it-services-detail-lp-batch-2026-04-13.md`
  - 続き 5 件の詳細業種 LP 実装内容
  - `it-services-06` から `it-services-10` の専用画像、公開 URL、一覧更新内容
- `docs/five-industry-batch-implementation-2026-04-11.md`
  - 2026-04-11 に一括追加した 5 業種の実装内容
  - 業種ごとの訴求方針と専用画像の考え方
- `docs/construction-lp-wireframe-2026-04-06.md`
  - 建設業向け LP の具体ワイヤー
  - セクション別の見せ方
  - CTA、フォーム、差し替えポイント
- `docs/construction-lp-implementation-2026-04-06.md`
  - 建設業向け LP の実装ファイル一覧
  - Kie.ai で生成した画像素材の再生成方法
  - 現時点の未実装範囲
- `docs/lp-visual-and-asset-spec-2026-04-06.md`
  - LP のデザイン方向
  - ブランド参照情報
  - Kie.ai を使う素材生成方針
- `docs/codex-workflow-spec.md`
  - Codex 用の作業開始時レビュー手順
  - 文書更新順序
  - 新規文書追加基準
  - 根本変更時の確認フロー

## 11. 2026-04-24 業種別LP一覧ページ更新

公開一覧ページ `https://mswpaff-stack.github.io/ai-sabi-lp/industries/` は、2026-04-24 時点で参考画像に合わせた簡潔な一覧デザインへ更新した。

対象ファイル:

- `site/industries/index.html`
- `site/styles.css`
- `site/assets/industry-index/`
- `publish/ai-sabi-lp/industries/index.html`
- `publish/ai-sabi-lp/styles.css`
- `publish/ai-sabi-lp/assets/industry-index/`

不動産・士業のリンク先は、現行の新LPを反映した canonical slug とする。

- 不動産: `/industries/main-real-estate/`
- 士業: `/industries/main-shigyo/`

一覧ページの右上ビジュアル、セクションアイコン、カードアイコン、矢印は、ユーザー指示により imagegen の image-2 で生成したPNGを使う。SVGやコードネイティブの仮アイコンは本番表示へ残さない。

現行アセット:

- `site/assets/industry-index/city-line-image2-v1.png`
- `site/assets/industry-index/icon-house-image2-v1.png`
- `site/assets/industry-index/icon-building-image2-v1.png`
- `site/assets/industry-index/icon-hardhat-image2-v1.png`
- `site/assets/industry-index/icon-crane-image2-v1.png`
- `site/assets/industry-index/icon-bridge-image2-v1.png`
- `site/assets/industry-index/icon-bulb-image2-v1.png`
- `site/assets/industry-index/icon-truck-image2-v1.png`
- `site/assets/industry-index/icon-chevron-image2-v1.png`

## 12. 2026-04-25 CSVカテゴリマップ全件横展開

`AIコンサル（LP量産）` 側の `industry-lp-v1` ハイブリッドテンプレートを正として、ユーザー提供 CSV の対象全件を公開用 `site/` と `publish/ai-sabi-lp/` へ反映した。

対象 CSV:

- `deliverables/outreach-tool-db-category-map-2026-04-17.utf8.csv`

対象:

- 元CSV: 185 件
- 生成対象: 160 件
- 除外: `旧Pending` / `pending`
- グループ: `不動産・士業`、`建設・物流`、`IT・サービス`、`製造`、`医療・福祉`、`小売・自動車`、`その他（農業・金融）`
- image-2 資産単位: 33 大カテゴリ

slug ルール:

- `main` の不動産: `/industries/main-real-estate/`
- `main` の士業: `/industries/main-shigyo/`
- その他: `/industries/<db_value>-<major_slug>/`

公開側の主な成果物:

- `site/industries/<slug>/`
- `site/assets/industry-lp-v1/<major_slug>/hero-image2-v3.png`
- `site/assets/industry-lp-v1/<major_slug>/operation-1-image2-v3.png`
- `site/assets/industry-lp-v1/<major_slug>/operation-2-image2-v3.png`
- `site/assets/industry-lp-v1/<major_slug>/operation-3-image2-v3.png`
- `site/assets/industry-lp-v1/<major_slug>/icon-*-v2.png`
- `site/assets/industry-index/major-<major_slug>-image2-v1.png`
- `publish/ai-sabi-lp/industries/<slug>/`
- `publish/ai-sabi-lp/assets/industry-lp-v1/<major_slug>/`
- `publish/ai-sabi-lp/assets/industry-index/major-<major_slug>-image2-v1.png`

一覧ページ:

- `site/industries/index.html` と `publish/ai-sabi-lp/industries/index.html` は 7 グループ・160カード表示
- 添付参考画像の一覧デザインを維持する
- SVGプレースホルダーは使わず、カードアイコンは image-2 生成PNGを使う

画像運用:

- 160ページそれぞれに画像を複製せず、33大カテゴリごとの共有 assets を参照する
- 同じ `major_category` が複数DBに出る場合は、同じ `major_slug` の Hero / operation画像 / icon を共有する
- Hero / MV は、中小企業の現場でAI導入後に業務が整っているイメージを主役にし、大企業的な高層オフィス感や課題に困っている場面を避ける
- MV補足の下段カットは最大3つとし、導入後に連絡、記録、顧客対応、共有がスムーズになっている具体シーンを優先する
- 下段カットは生成シートの境界や隣接カットの端が混ざらないよう、安全トリミング済みの `operation-*-image2-v3.png` を使う
- 画像上にコピーを重ねる箇所では、画像を背景として扱い、暗めのグラデーションとテキストシャドウで視認性を確保する
- アイコンは4x4の image-2 シートから16点に分割し、改善カード、解決アプローチ、主な業務、理由、支援プラン、導入フロー、一覧カードへセクション別に割り当てる
- 旧 `hero-image2-v1.png` / `icon-image2-v1.png` や5カット版の `*-image2-v2.png` は過去資産として残る場合があるが、CSV全件横展開の現行HTMLでは参照しない
- この方針により GitHub Pages 側の容量増加を抑え、後続の画像差し替えも大カテゴリ単位で行える

確認済み:

- ローカル `http://127.0.0.1:8130/industries/` と160件のLPが HTTP 200
- `site/`、`AIコンサル（LP量産）/site/`、`publish/ai-sabi-lp/` のローカル参照欠損 0
- 一覧ページは160カード、SVG参照 0
- Playwright の PC/SP 確認で画像破損 0、横スクロール 0
