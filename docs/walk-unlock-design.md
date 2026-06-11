# 金憶街區「走路解鎖系統」設計文件

## 1. 狀態機（State Machine）

每個地點（Location）獨立持有一個狀態，由 `stepStore` 統一管理：

```
            steps > 0                steps ≥ requiredSteps
 ┌────────┐ ────────────▶ ┌─────────────┐ ────────────────▶ ┌──────────┐  玩過該地點遊戲  ┌───────────┐
 │ locked │               │ in_progress │                   │ unlocked │ ───────────────▶ │ completed │
 └────────┘               └─────────────┘                   └──────────┘                  └───────────┘
                                 ▲                                ▲
                                 │                                │ GPS 到達地標（geofence）
                                 └── 顯示進度弧（% 環）            └── arriveAt(locationId)
```

### 狀態轉移規則
| 轉移 | 觸發條件 | 實作位置 |
|---|---|---|
| locked → in_progress | 今日步數 > 0 | `statusOf()` 即時推導 |
| in_progress → unlocked | ① 步數達標（`todaySteps ≥ requiredSteps`）② GPS 進入地標 50m 範圍 ③ Demo 手動加步 | `_evaluateUnlocks()` watch、`arriveAt(id)` |
| unlocked → completed | 從該地點進入遊戲（`completeLocation(id)`） | `goToGame()` |

### 關鍵設計決策
- **解鎖單向不可逆**：`unlocked` / `completed` 持久化於 localStorage（`kim-i-unlocks-v1`），步數歸零或隔天不會退回 — 對長輩來說「得到的東西被收回」是極差的體驗。
- **步數來源三層 fallback**：DeviceMotion 計步器（手機）→ GPS 距離推算（未實作，預留 `arriveAt`）→ Demo 手動按鈕（電腦展示）。
- **每日目標 8,000 步**：同時也是最後一個地點（指南宮）的解鎖門檻，地圖終點＝每日目標，敘事一致。

## 2. 觸發資料流

```
DeviceMotion API（手機加速度計）
   └─▶ stepCounter.js（波峰偵測 → 步數）
        └─▶ stepStore.todaySteps（ref）
             └─▶ watch → _evaluateUnlocks()      ← 狀態機核心
                  ├─▶ unlockedIds 更新（持久化）
                  ├─▶ OutdoorMap 解鎖動畫 + TTS 語音恭喜
                  └─▶ daily_steps 表（Supabase，跨裝置同步）

Geolocation API（未來擴充）
   └─▶ watchPosition → haversine 距離 < 50m → arriveAt(locationId)
```

### 後端（Supabase）角色
- `daily_steps` 表：每日步數記錄（已建立），供家屬儀表板查看活動量
- 未來可加 `location_unlocks` 表（user_id, location_id, unlocked_at, trigger: 'steps'|'gps'）做成就系統與跨裝置同步

## 3. 在地化題目生成

- Edge Function `local-quiz`（已部署）：輸入行政區 → Fable 5 生成 3 題在地問答
- 題型混合：memory（記憶）/ calculation（計算）/ orientation（定向）— 對應認知訓練三大面向
- 正確性紅線：模型對該地區不熟時，降級為「通用懷舊常識＋在地場景包裝」，絕不編造
- 前端備援：API 失敗時自動切換內建文山區題庫，demo 不會中斷

## 4. 戶外 UI 設計原則

| 原則 | 實作 |
|---|---|
| 防太陽眩光 | 米黃紙張底（#F2E4C2）＋深棕文字（#4A2C17），對比度 > 9:1，捨棄室內深色主題 |
| 大圖示 | 地點 emoji、按鈕 ≥ 48px 觸控區、問答選項整行可按 |
| 語音輔助 | 📢 語音導引按鈕（TTS 唸出進度）、解鎖時自動語音恭喜、點未解鎖地點唸出剩餘步數 |
| 懷舊風格 | 木板告示牌外框＋鉚釘、手繪步道虛線、紅色大頭針「目前位置」、加油泡泡 |
| Demo 模式 | 電腦展示用「＋步數」按鈕（500/1000/3000）與重設，明確標示為測試區 |
