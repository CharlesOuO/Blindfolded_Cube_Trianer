# 3BLD Practice

Use this browser app to save words for your 3×3 blindfolded letter pairs, look up 3-style algorithms, and practice with flashcards or a timer.

[Open 3BLD Practice](https://charlesouo.github.io/Blindfolded_Cube_Trianer/) · [繁體中文](#繁體中文)

You can install the site from your browser as a PWA and use it offline. The native Android project and APK are no longer maintained.

## Letter Pairs

Open `Corners` or `Edges` from the navigation, then switch between `Words` and `Algorithm`. Each piece type has its own word and algorithm entries. In `List`, pick a start code to see that group, search by pair or content, and filter by whether an entry is filled.

In `Algorithm → List`, click a pair to open the matching 3-style case on [BLDDB v2](https://v2.blddb.net/) in a new tab. The link uses your selected buffer and lettering scheme. With Speffz lettering and a `UFR` corner buffer, for example, `AB` opens `UFR → UBL → UBR`.

In `Table`, choose `Good`, `Slow`, `Hard`, or `Hide`, then click the cells you want to mark. Press `Done` or `Esc` to return to editing.

- `Hide buffer pairs` skips pairs that include any sticker on the selected buffer piece.
- `Hide Twist` for corners and `Hide Flip` for edges skip pairs made up of two different stickers on the same piece.

Skipped pairs appear gray and stay out of `Flashcards` and the `Trainer`. Turn off the filter to see their previous familiarity marks.

## Parity

Set `Parity edge target` in `Settings` (default `UR`), then open `Parity`. Each letter in the list is a corner target in your lettering scheme. With edge buffer `UF` and target `UR`, every row swaps `UF ↔ UR` alongside the corner swap.

Empty fields show the matching BLDDB Nightmare formula when the offline selection includes that case. Type your own formula in the row to save it on this device. JSON backups include your formulas and edge target setting.

## Built-in algorithms

Empty algorithm fields can show a built-in formula from [`BLDDB`](https://blddb.net/). The app loads these references from `built-in-algorithms.js`, so the placeholders also work offline. The built-in notation is `commutator-first`.

- Conjugate (setup): `[A: B] = A B A'`
- Commutator: `[A, B] = A B A' B'`
- Combination: `[A: [B, C]] = A B C B' C' A'`
- Example: `[R2': [E, R U' R']] = R2' E R U' R' E' R U R`

## Flashcards

Practice `Words`, `Corners`, or `Edges`. The app uses spaced review and shows the cards that are due. If none are due, it draws from the cards due next.

| Grade | Next review |
| --- | --- |
| `Hard` | In 10 minutes |
| `Slow` | In 6 hours |
| `Good` | On a day-based schedule |

## 3-Style Trainer

The `3-Style Trainer` generates a scramble from the built-in algorithm data when you open it. Switch between `Corners` and `Edges` to see separate histories. You can apply `+2` or `DNF` and check your `ao5`, `ao12`, `ao50`, and `ao100`. On touch devices, swipe left or right to switch tabs.

## Settings

The app opens in `English` on the first visit. You can switch to `Traditional Chinese` in `Settings`, and the app remembers your choice. Lettering starts in `Zhuyin` using Speffz sticker order. You can switch between `Zhuyin ㄅ~ㄩ`, `English a~x`, and `Custom`. Your saved custom lettering is kept when you switch presets.

The corner and edge buffers both start at Speffz `C`. You can pick a different sticker for each buffer. The built-in algorithm placeholders update to match.

Open `Settings → Edit custom lettering` and choose the colors for `Up face` and `Face toward you`. The cube net rotates to show those faces as `U` and `F`. Edit the sticker codes and select `Apply Custom` to save them. You can also edit the table headers in `Edit Mode`. Saved words and algorithms stay attached to their original sticker positions. For example, swapping A and D moves the entry from AB to DB.

## Back up your data

Your words and progress are stored in the browser's `localStorage`. Export a `.json` backup to keep a copy of your words, formulas, review progress, timer history, lettering, language, and buffer settings. You can also export the word table as `.csv`.

The app asks for confirmation before restoring a backup over your current data. When you restore an older backup, any data categories it leaves out are cleared. Clearing your browser's site data also deletes local practice data.

## Troubleshooting

If the site still shows an old version after a push, try `Ctrl+F5` on Windows or `Cmd+Shift+R` on macOS. GitHub Pages can briefly serve CSS and JavaScript from different versions because it caches static files (`Cache-Control: max-age=600`). You can also open the site in a private window to check whether the regular window is using an older copy.

## Deployment

You can host the static site on GitHub Pages, Netlify, or Cloudflare Pages. It runs without a backend or database.

## License

This project uses `GPL-3.0-or-later`. See [LICENSE](./LICENSE) for the full text.

The built-in algorithms come from [BLDDB v2](https://github.com/nbwzx/blddb/tree/v2). The upstream copyright notice credits Zixing Wang, and [BLDDB's documentation](https://docs.blddb.net/en/) specifies GPL version 3 or later.

The repo includes the [corner](./cornerManmade.json) and [edge](./edgeManmade.json) datasets. The [generator](./scripts/generate-built-in-algorithms.js) takes the highest-ranked available commutator for each case and writes it to `built-in-algorithms.js`.
The same generator bundles [BLDDB's selected Nightmare parity formulas](./parityNightmareSelected.json) for offline reference.

## Author

Charles Lin · WCA [2020LINC05](https://www.worldcubeassociation.org/persons/2020LINC05)

[GitHub](https://github.com/CharlesOuO/Blindfolded_Cube_Trianer) · [Instagram @chihjialin](https://www.instagram.com/chihjialin/) · [linchihjia@gmail.com](https://mail.google.com/mail/?view=cm&fs=1&to=linchihjia@gmail.com)

---

# 繁體中文

用這個網站練 3BLD，可以記下每組字母對想到的字詞、查 3-style 公式、用翻牌複習，也可以計時練還原。

[開啟 3BLD 練習網站](https://charlesouo.github.io/Blindfolded_Cube_Trianer/)

網站可以透過瀏覽器安裝成 PWA，也能離線使用。原生 Android 專案和 APK 已停止維護。

## 字母配對

從導覽列開啟角塊或邊塊，再切到 `Words` 記字詞，或用 `Algorithm` 存公式。角塊和邊塊的字詞及公式各自儲存。在 `List` 選開頭代碼就能換組，也能搜尋組內的字母對或內容，或只看已填、未填的配對。

在 `Algorithm → List` 點字母對，會依照你選的 buffer 和編碼，在新分頁開啟 [BLDDB v2](https://v2.blddb.net/) 的對應案例。像是用 Speffz 編碼和 `UFR` 角塊 buffer 時，點 `AB` 就會查 `UFR → UBL → UBR`。

在 `Table`，先選 `Good`、`Slow`、`Hard` 或 `Hide`，再點要標記的格子。按「完成」或 `Esc` 就能回到編輯。

- `Hide buffer pairs` 會略過涉及 buffer 那顆實體塊任一貼紙的配對。
- 角塊的 `Hide Twist` 和邊塊的 `Hide Flip` 會略過同一顆實體塊上兩張不同貼紙組成的配對。

略過的配對會在表格中變灰，翻牌和計時訓練都不會抽到。關閉篩選就會顯示原本的熟悉度標記。

## Parity

到「設定」選 Parity 的邊塊 target（預設 `UR`），再開啟 `Parity`。清單上每個字母都是你目前編碼的角塊 target。若邊塊 buffer 是 `UF`、target 是 `UR`，每一列都固定做 `UF ↔ UR`，再搭配該列的角塊交換。

有收錄的 BLDDB Nightmare 公式會顯示在空白輸入欄裡。直接在該列輸入自己的公式，網站會自動存到本機。匯出 JSON 時也會備份自訂公式和邊塊 target 設定。

## 內建公式

公式欄留白時，會顯示取自 [BLDDB](https://blddb.net/) 的內建公式供你參考。資料直接從 `built-in-algorithms.js` 載入，離線也看得到。預設以 `commutator-first` 顯示。

- Conjugate（setup）：`[A: B] = A B A'`
- Commutator：`[A, B] = A B A' B'`
- Combination：`[A: [B, C]] = A B C B' C' A'`
- 例子：`[R2': [E, R U' R']] = R2' E R U' R' E' R U R`

## 記憶翻牌

可以用字卡複習 `Words`、`Corners` 或 `Edges`。字卡會按評分安排下次複習。有到期的卡就先抽，沒有的話，就抽接下來最早到期的卡。

| 評分 | 下次複習 |
| --- | --- |
| `Hard` | 10 分鐘後 |
| `Slow` | 6 小時後 |
| `Good` | 按天數安排 |

## 計時訓練

打開計時訓練時，網站會用內建公式產生一組打亂。切換 `Corners` 和 `Edges` 可以分開看兩種練習的成績。每筆紀錄可以加 `+2` 或判 `DNF`，也能看 `ao5`、`ao12`、`ao50` 和 `ao100`。在觸控裝置上可以左右滑動切換頁籤。

## 設定

第一次開啟時，介面是`英文`。在 `Settings` 可以切換`繁中`或 `English`，網站會記住你的選擇。預設編碼是按 Speffz 貼紙順序排列的`注音`。你可以在`注音 ㄅ~ㄩ`、`English a~x` 和`自訂`之間切換，原本儲存的自訂編碼會保留。

角塊和邊塊的預設 buffer 都對應 Speffz 的 `C`。兩個 buffer 可以分開設定，內建公式也會跟著更新。

到「設定 → 編輯自訂編碼」，選擇哪個顏色朝上、哪個顏色朝自己。展開圖會跟著旋轉，並把這兩面標成 `U` 和 `F`。填好貼紙代碼後，按「套用自訂」儲存。你也可以在 `Table` 開啟 `Edit Mode`，直接編輯表頭。字詞和公式跟著實體貼紙位置走，像是對調 A 和 D，原本 AB 格子的內容就會移到 DB。

## 備份與還原

字詞和練習進度存在瀏覽器的 `localStorage`。匯出 `.json` 可以備份字詞、公式、熟悉度、複習進度、計時紀錄、編碼、語言和 buffer 設定。也可以把 `Words` 表格另外匯出成 `.csv`。

還原備份會先詢問你是否要覆蓋目前的資料。若還原的是舊版備份，備份裡缺少的資料類別會清空。清除瀏覽器的站點資料也會刪掉本機練習紀錄。

## 疑難排解

如果 push 後還是看到舊版，先按 `Ctrl+F5`（Windows）或 `Cmd+Shift+R`（macOS）強制重新整理。GitHub Pages 會短暫快取靜態檔案（`Cache-Control: max-age=600`），有時會一併載入不同版本的 CSS 和 JavaScript。也可以用無痕視窗確認是不是一般視窗還在用舊快取。

## 部署

這是純靜態網站，可以部署到 GitHub Pages、Netlify 或 Cloudflare Pages，無需後端或資料庫。

## 授權

本專案採用 `GPL-3.0-or-later`。完整條文見 [LICENSE](./LICENSE)。

內建公式來自 [BLDDB v2](https://github.com/nbwzx/blddb/tree/v2)。原專案的著作權聲明署名 Zixing Wang。[BLDDB 官方文件](https://docs.blddb.net/en/) 標示其採用 GPL 第 3 版或後續版本授權。

專案附有[角塊資料](./cornerManmade.json)和[邊塊資料](./edgeManmade.json)。[產生腳本](./scripts/generate-built-in-algorithms.js)會從每個案例取出排名最高且可用的交換子，寫入 `built-in-algorithms.js`。
同一支腳本也會把 [BLDDB Nightmare 選錄的 parity 公式](./parityNightmareSelected.json)包進離線資料。

## 作者

Charles Lin · WCA [2020LINC05](https://www.worldcubeassociation.org/persons/2020LINC05)

[GitHub](https://github.com/CharlesOuO/Blindfolded_Cube_Trianer) · [Instagram @chihjialin](https://www.instagram.com/chihjialin/) · [linchihjia@gmail.com](https://mail.google.com/mail/?view=cm&fs=1&to=linchihjia@gmail.com)
