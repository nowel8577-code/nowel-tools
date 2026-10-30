# 〈赤壁賦〉3D 密室逃脫：赤壁夜舟

學生登上蘇子的小船，在月夜的赤壁下找出八個機關，依序解開〈赤壁賦〉第五、六段（水與月的哲理）的謎題。八關全破後天亮，船頭放下跳板，走上岸就逃脫成功。

- 線上網址：https://nowel8577-code.github.io/nowel-tools/tools/chibi-escape/
- 簡易版（不用 3D，手機跑不動時用）：https://nowel8577-code.github.io/nowel-tools/tools/chibi-escape/?lite=1
- 老師看成績：Google 表單「〈赤壁賦〉3D 密室逃脫成績（自動送出）」的回覆分頁 https://docs.google.com/forms/d/1_3vQHPiAXlH0420kPkEmMwx2cUmERbRWBMsYZ9_lNQk/edit#responses
- 時間：分組 15～25 分鐘；手機、平板、電腦都能玩，不需登入

## 八個機關

| 順序 | 機關 | 考點 | 答案 |
|---|---|---|---|
| 1 | 水缸 | 「斯」「彼」指什麼 | 水、月 |
| 2 | 銅鏡 | 盈虛者如彼，而卒莫消長也 | 月亮看似圓缺，本體終究沒有增減 |
| 3 | 洞簫 | 變與不變（含《莊子‧德充符》） | 變→天地曾不能以一瞬；不變→物與我皆無盡也；異→肝膽楚越也；同→萬物皆一也 |
| 4 | 燈籠 | 生活實例：哪些是「自其不變者而觀之」 | A 社團精神、C 老歌傳唱、E 河一直都在 |
| 5 | 船帆 | 取之無禁、用之不竭的是什麼 | 清風、明月 |
| 6 | 杯盤 | 字音 | 曾 ㄗㄥ、藏 ㄗㄤˋ、適 ㄕˋ、藉 ㄐㄧㄝˋ |
| 7 | 酒壺 | 全文氛圍變化 | 樂 → 悲 → 喜 |
| 8 | 竹蓆 | 不知東方之＿＿ | 既白 |

通關暗號：自其不變者而觀之，則物與我皆無盡也。

## 檔案

- `index.html`：頁面與介面
- `game.js`：打包後的遊戲（含 three.js 0.160.0）
- `src/`：原始碼（`boat.js` 場景、`puzzles.js` 題目、`report.js` 成績回傳、`game.js` 遊戲邏輯）。修改後重新打包：
  `npx esbuild src/game.js --bundle --minify --format=iife --target=es2019 --outfile=game.js`
  （需先 `npm i three@0.160.0`）

程式架構沿用 `tools/shishuo-escape/`。場景全部用程式產生，沒有外部模型、圖片或音檔。
成績表單由 Apps Script 專案「師說密室逃脫表單產生器」的 createChibiEscapeResultsForm 建立；換表單時要更新 `src/report.js` 的網址與 entry 編號。
進度存在瀏覽器 localStorage（鍵 `chibi-escape-v1`），只記組別、關卡、時間、答錯與提示次數，不收個資。
