# 美泊視覺工作室 MEBO DESIGN STUDIO — 官方網站

網站放在 GitHub Pages，每次內容有更新，約 1–2 分鐘後自動上線。

## 怎麼更新內容（不用寫程式）

1. 打開 <https://app.pagescms.org>，用 GitHub 帳號登入，選這個專案。
2. 左側選單：
   - **作品集**：新增作品 → 填名稱、選分類、上傳 4:5 封面；「作品圖片」可加多張，版型選「滿版／半版（兩張並排）／直式＋說明」。「排列順序」數字小的排前面。
   - **設計筆記（文章）**：新增文章 → 標題、網址代稱（英文，例 `my-first-post`）、日期、分類、摘要、內文。勾「草稿」就不會出現在網站上。
   - **最新消息**：在清單裡新增一行；最上面那則排第一。
   - **網站設定**：Email、Instagram、首頁標語、創辦人照片。
3. 按 **Save**，等 1–2 分鐘重新整理網站就會看到。

## 檔案位置（給技術人員）

- `src/projects/*.md` 作品、`src/journal/*.md` 文章、`src/_data/*.json` 消息與設定
- `src/_includes/` 版型；`src/assets/` 樣式、程式、圖片；`src/uploads/` 後台上傳的圖片
- 建置：Eleventy（`npm ci && npx @11ty/eleventy`），由 `.github/workflows/deploy.yml` 自動發布
