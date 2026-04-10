# SKILL: Frontend UI 設計 — KIM-I 風格系統

## 用途
設計 KIM-I 專案的網頁 UI、Vue 元件、Dashboard 頁面。
遵循懷舊台灣風格（復古金色、深褐背景、古典字型）。

## 設計語言

### 色彩系統
```css
/* 主色調 */
--color-gold:       #F0A500;  /* 主要強調、按鈕、標題 */
--color-gold-dark:  #CF7500;  /* hover 狀態 */
--color-gold-glow:  rgba(240, 165, 0, 0.4); /* 發光效果 */

/* 背景層次 */
--color-bg-deep:    #0A0704;  /* 最深背景 */
--color-bg-dark:    #1e1e1e;  /* 次要背景 */
--color-bg-card:    rgba(240, 165, 0, 0.08); /* 卡片背景 */

/* 文字 */
--color-text:       #F5F5F5;  /* 主文字 */
--color-text-muted: #A0926A;  /* 次要文字 */

/* 功能色 */
--color-success:    #4ADE80;  /* 成功、健康指標 */
--color-danger:     #F87171;  /* 錯誤、警告 */
```

### 字型
```css
/* 中文內文、標題 */
font-family: 'Noto Serif TC', 'PMingLiU', serif;

/* 數字、英文、UI 標籤 */
font-family: 'Outfit', 'Noto Sans TC', sans-serif;

/* 響應式字級 */
font-size: clamp(0.9rem, 2.5vw, 1.1rem);   /* 內文 */
font-size: clamp(1.2rem, 4vw, 1.8rem);     /* 小標題 */
font-size: clamp(1.8rem, 6vw, 3rem);       /* 大標題 */
```

---

## 常用元件模板

### 復古卡片
```vue
<div class="vintage-card">
  <slot />
</div>

<style scoped>
.vintage-card {
  background: rgba(240, 165, 0, 0.08);
  border: 1px solid rgba(240, 165, 0, 0.35);
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow:
    inset 0 1px 0 rgba(240,165,0,0.15),
    0 4px 24px rgba(0,0,0,0.4);
}
</style>
```

### 金色標題
```vue
<h2 class="section-title">懷舊遊戲</h2>

<style scoped>
.section-title {
  color: #F0A500;
  text-shadow: 0 0 12px rgba(240, 165, 0, 0.5);
  font-family: 'Noto Serif TC', serif;
  letter-spacing: 0.1em;
  border-bottom: 1px solid rgba(240,165,0,0.3);
  padding-bottom: 0.5rem;
}
</style>
```

### 主要按鈕
```vue
<button class="btn-primary" @click="handleClick">開始遊戲</button>

<style scoped>
.btn-primary {
  background: #F0A500;
  color: #0A0704;
  border: none;
  border-radius: 0.5rem;
  padding: 0.75rem 1.75rem;
  font-family: 'Noto Serif TC', serif;
  font-size: 1rem;
  font-weight: 700;
  min-height: 44px;       /* 無障礙觸控大小 */
  cursor: pointer;
  transition: all 0.2s;
  letter-spacing: 0.05em;
}
.btn-primary:hover {
  background: #CF7500;
  box-shadow: 0 0 16px rgba(240,165,0,0.4);
  transform: translateY(-1px);
}
.btn-primary:active { transform: translateY(0); }
</style>
```

### 次要按鈕（外框）
```vue
<button class="btn-outline">查看紀錄</button>

<style scoped>
.btn-outline {
  background: transparent;
  color: #F0A500;
  border: 1.5px solid #F0A500;
  border-radius: 0.5rem;
  padding: 0.75rem 1.75rem;
  font-family: 'Noto Serif TC', serif;
  min-height: 44px;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-outline:hover {
  background: rgba(240,165,0,0.1);
}
</style>
```

### 分數/數值徽章
```vue
<span class="score-badge">{{ score }} 分</span>

<style scoped>
.score-badge {
  display: inline-block;
  background: rgba(240,165,0,0.15);
  border: 1px solid #F0A500;
  color: #F0A500;
  border-radius: 9999px;
  padding: 0.25rem 0.75rem;
  font-size: 0.9rem;
  font-family: 'Outfit', sans-serif;
  font-weight: 600;
}
</style>
```

---

## 版面結構

### 頁面容器
```vue
<div class="page-container">
  <header class="page-header"> ... </header>
  <main class="page-main"> ... </main>
</div>

<style scoped>
.page-container {
  min-height: 100vh;
  background: #0A0704;
  color: #F5F5F5;
  display: flex;
  flex-direction: column;
  font-family: 'Noto Serif TC', serif;
}
.page-header {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid rgba(240,165,0,0.25);
  background: rgba(240,165,0,0.05);
}
.page-main {
  flex: 1;
  padding: 1.5rem;
  overflow-y: auto;
}
</style>
```

### 卡片格線（GameMenu 風格）
```vue
<div class="card-grid">
  <div v-for="item in items" :key="item.id" class="grid-card">
    ...
  </div>
</div>

<style scoped>
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.25rem;
}
</style>
```

---

## 無障礙設計原則（長者優先）
- 按鈕最小觸控區域：`min-height: 44px; min-width: 44px`
- 文字對比度：白字在深色背景，符合 WCAG AA
- 字級不小於 `1rem`（16px）
- 重要操作提供視覺 + 音效雙重回饋
- 避免純色彩傳達資訊（加圖示或文字輔助）
- 動畫提供 `prefers-reduced-motion` 支援：
```css
@media (prefers-reduced-motion: reduce) {
  * { animation: none !important; transition: none !important; }
}
```
