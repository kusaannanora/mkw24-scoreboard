# MKW24 即時集計ツール

24人対戦を2人×12、3人×8、4人×6チームで集計する、GitHub Pages向けWebアプリです。

## できること
- 順位順にチームタグをクリックして24人分入力。人数を超える入力は禁止。
- レース確定時に自動集計。1レース合計144点。
- 順位枠をクリックして修正、1つ戻す、過去レース修正・削除。
- 大会名、予定レース数、チームタグ・色、得点補正（減点）を設定。
- 同点は同順位（例: 1位・1位・3位）、首位との差を表示。
- JSONバックアップ保存・読込。
- 透過背景の配信表示。Firebase設定後は別PCへ即時同期。

## 1. GitHubに新規作成して公開
1. https://github.com/new を開く。
2. Repository name に `mkw24-scoreboard` を入力し、Publicを選び、Create repository。
3. 「uploading an existing file」または Add file → Upload files を開く。
4. このZIPを解凍し、`mkw24`フォルダーの**中身**をアップロード。`index.html`がリポジトリ直下になるようにする。
5. Commit changes。
6. Settings → Pages → SourceでDeploy from a branch、Branchでmain、フォルダーは /(root) を選びSave。
7. 公開後のURLは `https://あなたのユーザー名.github.io/mkw24-scoreboard/`。

Firebaseが未設定でも、この時点で入力・集計を試せます。ファイルのダブルクリックではなく公開URLで開いてください。
ローカルモードでの自動反映は同じブラウザーの別タブ限定です。XSplitや別PCでは次の設定が必要です。

## 2. Firebaseで別PC同期を設定
1. https://console.firebase.google.com/ で新しいプロジェクトを作成。
2. Webアプリ（</>）を追加。表示された `firebaseConfig` の内容をコピー。
3. `config.js` の `export const firebaseConfig = null;` を、取得したオブジェクトに置き換える。例:

```js
export const firebaseConfig = {
  apiKey: "取得した値",
  authDomain: "取得した値",
  databaseURL: "取得した値",
  projectId: "取得した値",
  appId: "取得した値"
};
```

4. Authentication → Sign-in method → 匿名を有効化。
5. Authentication → Settings → Authorized domains に `あなたのユーザー名.github.io` を追加（スキームやパスは含めない）。
6. Realtime Databaseを作成。Firestoreではありません。最初はロックモードで作成。
7. Realtime DatabaseのRulesタブに `database.rules.json` の内容を貼り付けて公開。**全員書き込み可能なテストモードのままにしない。**
8. Realtime Databaseに表示されたURLを `config.js` の `databaseURL` に設定。
9. 更新した `config.js` をGitHubにアップロード。反映後、集計画面を再読込。
10. 「新しい大会を作成」を押す。大会IDを含む集計URLが開く。

Web用firebaseConfigは公開用の接続設定です。サービスアカウントの秘密鍵や認証トークンをコードに書かないでください。
料金・利用上限はFirebaseの現行プランを確認してください。このアプリは結果の確定時だけ送信し、順位入力途中のデータは送信しません。

## 3. 集計と配信
1. チーム人数を選び、タグ・色・大会名・予定レース数を設定し「設定を保存・配信に反映」。
2. レースの1位から順にチームタグをクリック。
3. 24順位入力後「レース確定・配信に反映」。
4. 「配信用URL」のURLを実況者に渡す。`overlay.html?room=...`が配信用URLです。
5. XSplitでWebページを表示するソースにそのURLを指定。幅560px、高さ1000px程度で登録し、配信レイアウトに合わせて拡大縮小。
6. 実際のXSplit環境で透明背景と更新を確認。必要ならブラウザーソースを再読込。

配信表示は確定済み結果のみです。入力途中の順位は表示されません。
背景は透明で、順位表自体は濃紺のパネルです。外部フォントに接続できない場合も代替フォントで動作します。

## 編集権限と運用
- 作成時の匿名認証IDを持つブラウザーだけがその大会を編集できます。
- 配信URLは閲覧専用。大会一覧の読み取りは禁止していますが、URLを知る人は結果を閲覧できます。
- 集計URLを別のPCに渡しても編集権限は移せません。初版の集計担当は1人です。
- ブラウザーデータを消したり別ブラウザーに替えると編集権限を失います。バックアップから新しい大会に復元してください。
- 集計URLはブックマークしてください。クラウド使用中は大会IDの付いたURLで再開します。
- ネットワーク切断時は配信表示に最後の結果と切断状態を表示し、集計の確定を止めます。再接続後に再度確定してください。
- 複数タブで同時に編集しないでください。クラウド側はリビジョンを比較し、競合する保存を拒否します。
- 入力途中の順位は再読込すると消えます。確定した結果は保存されます。
- 予定レース数は表示用です。延長戦の入力もできます。
- Firebase連携の実環境テストは、あなたのFirebaseプロジェクトで接続後に行ってください。

## 配点
15,12,10,9,9,8,8,7,7,6,6,6,5,5,5,4,4,4,3,3,3,2,2,1

## 開発・確認
ビルド不要。`python3 -m http.server 8000`でローカル配信できます。
`npm test`で配点、人数別集計、不正入力、同点・補正、バックアップ検証を確認できます。

公式資料:
- https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site
- https://firebase.google.com/docs/database/web/read-and-write
- https://firebase.google.com/docs/database/security

## この配布版の検証状況
- 配点・3パターンの集計・人数検証・同点補正・保存形式: 自動テスト6件成功。
- JavaScript構文チェック成功。
- ブラウザー実機での画面テスト: この作成環境ではブラウザー取得に失敗したため未実施。
- Firebase実サービスの接続・権限ルール、XSplitでの描画: 接続後に確認が必要。
