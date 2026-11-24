# 3BLD(3 style & letter pairs) practice

A bilingual browser-based practice tool for 3BLD.
It helps you manage letter pair words, review 3-style algorithms, and practice with flashcards and a timed trainer.

[Traditional Chinese / 繁體中文](#繁體中文)

## Demo

- Live site: [3BLD(3 style & letter pairs) practice](https://charlesouo.github.io/Blindfolded_Cube_Trianer/)

## Overview

This project is designed for 3BLD practice in the browser.
You can use it to:

- store `Words` for letter pairs
- review `Corners` algorithms
- review `Edges` algorithms
- train with `3-Style Trainer` (scramble + timer + history)
- practice with flashcards
- switch lettering codes between `Zhuyin`, `English`, and `Custom`
- export and import your own local data

It is a fully static website with no backend required.

The app is distributed as a website/PWA. Install it through your browser for standalone and offline use; no native Android project or APK is maintained. Keep a separate JSON backup of your words and progress.

## Default Setup

- Interface language: `English` on first launch
- Default lettering: `Zhuyin` in Speffz sticker order
- Built-in algorithm source: [BLDDB](https://blddb.net/)
- Built-in algorithm format: `commutator-first`
- Default corner and edge buffers: Speffz `C`
- Corner and edge buffer stickers can be selected separately in Settings; placeholders update automatically
- Built-in corner and edge references are stored locally in this project

## Notation

- Conjugate (setup): `[A: B] = A B A'`
- Commutator: `[A, B] = A B A' B'`
- Combination: `[A: [B, C]] = A B C B' C' A'`
- Example: `[R2': [E, R U' R']] = R2' E R U' R' E' R U R`

## Main Features

### 1. Letter Pairs

- switch between `List` and `Table` layouts
- switch between `Words` and `Algorithm`
- keep separate word and algorithm entries for `Corners` and `Edges`
- in `List`, browse by start code, search that group, and filter filled or unfilled entries
- in `Table`, choose `Good`, `Slow`, `Hard`, or `Hide` first, then click the cells to mark. Press `Done` or `Esc` to return to editing.
- use `Hide buffer pairs` to skip pairs involving any sticker on the selected buffer piece
- use `Hide Twist` (corners) or `Hide Flip` (edges) to skip pairs that use two different stickers on the same piece

Skipped pairs appear gray in the table and are excluded from Flashcards and the Trainer. Turning off a skip filter restores the underlying familiarity marks.

### 2. 3-Style Trainer

- generate corner/edge scrambles with built-in algorithm data
- auto-generate a scramble when entering the trainer page
- switch between `Corners` and `Edges` sessions
- keep per-type history, penalties (`+2`, `DNF`), and averages (`ao5`, `ao12`, `ao50`, `ao100`)
- supports swipe tab switching on touch devices (left/right)

### 3. Built-in Algorithm References

- built-in defaults are derived from `BLDDB`
- no runtime fetch is required
- empty algorithm fields can show built-in placeholders
- corner and edge algorithms can be reviewed separately in flashcards

### 4. Flashcards

- practice `Words`, `Corners`, and `Edges`
- review due cards with spaced-repetition style scheduling
- grade cards as `Hard`, `Slow`, or `Good`
- if no card is due, the app falls back to the earliest upcoming cards

Review timing:

- `Hard`: due again in 10 minutes
- `Slow`: due again in 6 hours
- `Good`: scheduled with day-based spacing

### 5. Settings, Language, and Lettering Codes

- switch between `English` and `Traditional Chinese` in `Settings`; the app remembers your choice
- lettering code presets: `Zhuyin ㄅ~ㄩ`, `English a~x`, and `Custom`
- switching presets does not erase your saved custom scheme
- open `Settings → Edit custom lettering` and choose the colors for `Up face` and `Face toward you`. The cube net rotates and labels those faces `U` and `F`. Edit the stickers and select `Apply Custom` to save the codes.
- use `Edit Mode` in the table to edit lettering directly from its headers. When a code changes, saved words and algorithms follow their original physical sticker positions. For example, swapping A and D changes the pair AB at that position to DB.

### 6. Backup and Restore

- export a full `.json` backup
- export the word table as `.csv`
- import previous backups

Backup data includes:

- word data
- corner algorithms
- edge algorithms
- familiarity and review state
- custom lettering scheme
- saved language setting

## How To Use

1. Open `Letter Pairs`
2. Fill in your `Words`
3. Switch to `Algorithm` and enter `Corners` or `Edges`
4. Set your buffers and lettering in `Settings`
5. Mark familiarity or skip pairs in `Table`
6. Use `Flashcards` for recall or `Trainer` for timed practice
7. Export a `.json` backup regularly

## Data Storage

- all user data is stored in browser `localStorage`
- clearing browser site data will remove local progress if you do not have a backup
- built-in algorithm defaults are loaded from `built-in-algorithms.js`
- selected corner and edge buffers are included in JSON backups

## Troubleshooting

- If you pushed updates but still see an old UI, hard refresh: `Ctrl+F5` (Windows) or `Cmd+Shift+R` (macOS).
- GitHub Pages static assets are cached for a short time (`Cache-Control: max-age=600`), so old/new CSS/JS can briefly mix.
- If needed, open the site in private mode or clear site data for `charlesouo.github.io`.

## Deployment

This project can be deployed as a static site on:

- GitHub Pages
- Netlify
- Cloudflare Pages

No server or database is required.

## License

This project is licensed under `GPL-3.0-or-later`.

- Full license text: [LICENSE](./LICENSE)
- Built-in algorithm data in this project is derived from [BLDDB](https://blddb.net/)
- BLDDB documents its license as `GPL version 3 or later`

## Author

- Author: Charles Lin
- WCA ID: [2020LINC05](https://www.worldcubeassociation.org/persons/2020LINC05)
- GitHub: [Blindfolded_Cube_Trianer](https://github.com/CharlesOuO/Blindfolded_Cube_Trianer)
- Instagram: [@chihjialin](https://www.instagram.com/chihjialin/)
- Email: [linchihjia@gmail.com](https://mail.google.com/mail/?view=cm&fs=1&to=linchihjia@gmail.com)

---

# 繁體中文

## 3BLD(3 style & letter pairs) practice

這是一個在瀏覽器中使用的 3BLD 練習工具。
你可以用它管理 letter pairs 字詞、複習 3-style 公式，並透過字卡和計時訓練練習回想與還原速度。

## Demo

- 網站連結：[3BLD(3 style & letter pairs) practice](https://charlesouo.github.io/Blindfolded_Cube_Trianer/)

## 專案簡介

這個專案主要用來做 3BLD 練習，你可以用它來：

- 紀錄 letter pairs 的 `Words`
- 複習 `Corners` 公式
- 複習 `Edges` 公式
- 使用 `3-Style Trainer` 練習（打亂、計時、紀錄）
- 使用字卡練習
- 可在 `注音`、`英文`、`自訂` 代碼方案間切換
- 匯出與匯入自己的本機資料

這是一個純靜態網站，不需要後端。

目前以網頁／PWA 形式提供，可透過瀏覽器安裝並離線使用，不再維護原生 Android 專案或 APK。字詞與進度請另外匯出 JSON 備份。

## 預設設定

- 首次開啟時的介面語言：`英文`
- 預設編碼：依 Speffz 貼紙順序排列的`注音`
- 內建公式來源：[BLDDB](https://blddb.net/)
- 內建公式顯示格式：`commutator-first`
- 角塊與邊塊預設 Buffer 都對應 Speffz 的 `C`，可在設定分別修改
- 內建的 corners 和 edges 公式參考已直接存放在專案內

## Notation

- Conjugate（setup）：`[A: B] = A B A'`
- Commutator：`[A, B] = A B A' B'`
- Combination：`[A: [B, C]] = A B C B' C' A'`
- Example：`[R2': [E, R U' R']] = R2' E R U' R' E' R U R`

## 主要功能

### 1. 字母配對（Letter Pairs）

- 可切換 `List` 與 `Table` 版面
- 可切換 `Words` 與 `Algorithm`
- 角塊與邊塊各自儲存字詞和公式
- `List` 可依開頭代碼換組，搜尋組內配對或內容，也可篩選已填寫、未填寫的配對
- `Table` 先選 `Good`、`Slow`、`Hard` 或 `Hide`，再點格子標記。按「完成」或 `Esc` 回到編輯。
- `Hide buffer pairs` 會略過涉及 Buffer 那顆實體塊任一貼紙的配對
- `Hide Twist`（角塊）和 `Hide Flip`（邊塊）會略過同一顆實體塊的兩個不同貼紙所組成的配對

略過的配對在表格中會變灰，翻牌與計時訓練不會抽到。關閉篩選後會恢復原本的熟悉度標記。

### 2. 3-Style Trainer

- 可依內建公式資料產生 corners/edges 打亂
- 切到 Trainer 頁面會自動產生一組打亂
- 可切換 `Corners` / `Edges` 練習類型
- 支援每種類型的歷史紀錄、`+2`、`DNF` 與平均（`ao5`、`ao12`、`ao50`、`ao100`）
- 行動裝置可左右滑動切換頁籤

### 3. 內建公式參考

- 內建預設公式根據 `BLDDB` 資料整理
- 不需要在執行時另外抓取資料
- 當公式欄位為空時，可以顯示內建 placeholder
- corners 與 edges 可以分開在字卡中複習

### 4. Flashcards

- 可練習 `Words`、`Corners`、`Edges`
- 使用類 spaced repetition 的到期排程
- 可將卡片評分為 `Hard`、`Slow`、`Good`
- 如果目前沒有到期卡片，系統會改抽最近即將到期的卡

複習時間規則：

- `Hard`：10 分鐘後再次到期
- `Slow`：6 小時後再次到期
- `Good`：依天數間隔排程

### 5. 設定、語言與代碼方案

- 可在 `Settings` 切換 `繁中` 或 `English`，App 會記住你的選擇
- 代碼方案可在 `注音 ㄅ~ㄩ`、`English a~x`、`自訂` 間切換
- 切換預設不會清掉已儲存的自訂方案
- 到「設定 → 編輯自訂編碼」選擇朝上和朝自己的面。展開圖會跟著旋轉，將這兩面標為 `U` 和 `F`。填好貼紙代碼後，按「套用自訂」儲存。
- 表格也可透過 `Edit Mode` 編輯表頭。字詞和公式跟著原本的實體貼紙位置，所以對調 A 和 D 後，原本 AB 格子的內容會對應到 DB。

### 6. 備份與還原

- 可匯出完整 `.json` 備份
- 可匯出 `Words` 表格為 `.csv`
- 可匯入舊備份

備份內容包含：

- 字詞資料
- corner 公式
- edge 公式
- 熟悉度與複習進度
- 自訂 lettering scheme
- 已儲存的語言設定

## 使用方式

1. 開啟「字母配對」
2. 輸入你的 `Words`
3. 切到 `Algorithm` 輸入 `Corners` 或 `Edges`
4. 到「設定」選擇 Buffer 和編碼
5. 在 `Table` 標記熟悉度，或設定要略過的配對
6. 到「記憶翻牌」複習，或到「計時訓練」練習還原
7. 定期匯出 `.json` 備份

## 資料儲存

- 所有使用者資料都存放在瀏覽器 `localStorage`
- 如果沒有先備份，清除瀏覽器站點資料後，本機進度會消失
- 內建公式預設由 `built-in-algorithms.js` 提供

## 疑難排解

- 如果已經 push 但畫面還是舊版，請先強制重新整理：`Ctrl+F5`（Windows）或 `Cmd+Shift+R`（macOS）。
- GitHub Pages 靜態資源有短暫快取（`Cache-Control: max-age=600`），短時間內可能出現新舊 CSS/JS 混用。
- 必要時可用無痕模式開啟，或清除 `charlesouo.github.io` 站點資料。

## 部署方式

這個專案可以直接部署成靜態網站，例如：

- GitHub Pages
- Netlify
- Cloudflare Pages

不需要伺服器或資料庫。

## 授權

本專案採用 `GPL-3.0-or-later` 授權。

- 完整授權條文請見 [LICENSE](./LICENSE)
- 專案中的內建公式資料是根據 [BLDDB](https://blddb.net/) 整理而成
- BLDDB 官方文件標示其授權為 `GPL version 3 or later`

## 作者資訊

- Author: Charles Lin
- WCA ID: [2020LINC05](https://www.worldcubeassociation.org/persons/2020LINC05)
- GitHub: [Blindfolded_Cube_Trianer](https://github.com/CharlesOuO/Blindfolded_Cube_Trianer)
- Instagram: [@chihjialin](https://www.instagram.com/chihjialin/)
- Email: [linchihjia@gmail.com](https://mail.google.com/mail/?view=cm&fs=1&to=linchihjia@gmail.com)
