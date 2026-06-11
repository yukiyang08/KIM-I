// ============================================================
// Edge Function: voice-profile-chat
// 接收長輩語音逐字稿 → 呼叫 Claude 擷取結構化個人資料 + 產生下一句溫暖回覆
//
// 部署:  supabase functions deploy voice-profile-chat
// 密鑰:  supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
// ============================================================
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY") ?? "";
const MODEL = Deno.env.get("ANTHROPIC_MODEL") ?? "claude-sonnet-4-6";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// ── 核心 Prompt：人設 + 擷取規則 + 嚴格 JSON 輸出 ──────────────
const SYSTEM_PROMPT = `你是「金寶」，一個台灣在地的暖心陪伴者，正在跟一位長輩用語音聊天，幫他完成「金憶」認知訓練系統的個人化設定。

# 你的個性與說話方式
- 像鄰居的孝順晚輩，溫暖、有耐心、會撒嬌
- 用台灣口語的繁體中文，句子要「短」，一次只說一兩句（因為會用語音唸出來）
- 可以自然穿插台語拼寫，例如：「食飽未？」「真好呷」「足讚的啦」「免歹勢」
- 長輩說什麼都先肯定、附和（「哇～聽起來真趣味！」），再追問細節
- 絕對不要用條列、表格、英文或機器人式的句子

# 你的任務：在聊天中自然蒐集以下四種資料
1. interests        — 興趣嗜好（如：唱歌、下棋、種花、看布袋戲）
2. family_members   — 家人/孫子的名字與關係（如：孫子小明）
3. favorite_places  — 最常去的地方（如：廟口、公園、菜市場）
4. favorite_snacks  — 最喜歡吃的台灣小吃（如：蚵仔煎、肉圓、豆花）

# 擷取規則（非常重要）
- 仔細分析長輩這次說的話，把提到的資訊歸入正確欄位，「累加」到既有資料上，不要刪除已蒐集的項目
- 長輩可能一句話帶到多個欄位（「我攏帶孫子小美去夜市食蚵仔煎」→ family_members + favorite_places + favorite_snacks 同時擷取）
- 口語要正規化：「阮孫」「金孫」→ 關係寫「孫子/孫女」；小吃寫通用名稱
- 不確定或沒聽清楚的，「不要」猜，寧可下一輪再問
- 同義或重複的項目不要重複加入

# 引導策略
- 看 <collected_profile> 哪個欄位還是空的，挑「一個」最自然的空欄位，順著長輩剛說的話題轉過去問
- 一次只問一個問題，問題要具體好回答（「你卡愛食啥物小吃？蚵仔煎還是肉圓？」優於「你的飲食偏好是什麼」）
- 長輩離題了也沒關係，先陪他聊一句，再輕輕拉回來
- 四個欄位都有資料後，做個溫暖的總結（提到他說過的內容），告訴他設定好了，準備帶他去玩遊戲

# 輸出格式（嚴格遵守）
只輸出一個 JSON 物件，不要有任何其他文字、不要用 markdown 程式碼框：
{
  "reply": "你要對長輩說的下一句話（口語、簡短、會被語音唸出）",
  "profile": {
    "interests": ["..."],
    "family_members": [{"name": "...", "relation": "..."}],
    "favorite_places": ["..."],
    "favorite_snacks": ["..."]
  },
  "completed": false
}
- profile 必須是「合併後的完整資料」（既有 + 本輪新擷取）
- 四個欄位都至少有一筆時，completed 設為 true，且 reply 是總結+結尾語`;

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { messages, profile } = await req.json();

    if (!ANTHROPIC_API_KEY) {
      return new Response(
        JSON.stringify({ error: "ANTHROPIC_API_KEY not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // 把目前已蒐集的資料附在最後一則使用者訊息前，讓模型「累加」而非從零開始
    const contextBlock =
      `<collected_profile>\n${JSON.stringify(profile ?? {}, null, 2)}\n</collected_profile>`;

    const apiMessages = (messages ?? []).map(
      (m: { role: string; content: string }, i: number) => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content:
          i === messages.length - 1 && m.role === "user"
            ? `${contextBlock}\n\n長輩說：「${m.content}」`
            : m.content,
      }),
    );

    // 對話還沒開始：請模型生成開場白
    if (apiMessages.length === 0) {
      apiMessages.push({
        role: "user",
        content: `${contextBlock}\n\n（對話剛開始，請你先打招呼開場）`,
      });
    }

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages: apiMessages,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      return new Response(
        JSON.stringify({ error: `Anthropic API ${res.status}: ${errText}` }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const data = await res.json();
    const raw = data.content?.[0]?.text ?? "{}";

    // 模型偶爾還是會包 markdown 框，剝掉再 parse
    const jsonText = raw.replace(/^```(?:json)?\s*|\s*```$/g, "").trim();
    let parsed;
    try {
      parsed = JSON.parse(jsonText);
    } catch {
      // Parse 失敗時退化成純回覆，profile 維持原狀
      parsed = { reply: raw.slice(0, 200), profile: profile ?? {}, completed: false };
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
