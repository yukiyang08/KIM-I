// ============================================================
// Edge Function: local-quiz
// 根據長輩所在的台灣行政區，用 Fable 5 生成在地化認知問答題
//
// 部署:  supabase functions deploy local-quiz
// 密鑰:  supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
// ============================================================
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY") ?? "";
const MODEL = Deno.env.get("ANTHROPIC_MODEL") ?? "claude-fable-5";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// ── 在地化出題 Prompt ────────────────────────────────────────
const SYSTEM_PROMPT = `你是台灣在地文史與高齡認知訓練的出題專家，為 65 歲以上長輩設計「邊散步邊玩」的在地問答。

# 輸入
使用者會給你一個台灣行政區（例如：台北市文山區、大稻埕、台南市鹽水區），以及題數。

# 出題原則
1. 題目圍繞「該地區」的：在地歷史與地標、傳統小吃與市場、長輩年輕時（民國 50–80 年代）的生活記憶
2. 每組題目混合三種認知訓練類型，並標上 category：
   - "memory"      記憶/常識題（例：指南宮主祀哪位神明？）
   - "calculation" 生活算術題（例：蚵仔煎一份 65 元，買 2 份付 200 元找多少？）
   - "orientation" 空間/時間定向題（例：從木柵要去貓空，應該往哪個方向走？）
3. 難度要「溫暖」：答對讓人會心一笑、答錯也能學到趣味知識，不出冷僻年份、不出需要查資料的題
4. 用語：繁體中文、口語、句子短，可自然使用台語詞（柑仔店、辦桌、呷飯）；選項簡短，三選一
5. explanation 要像鄰居在分享趣聞，1–2 句，溫暖、帶懷舊感

# 正確性紅線（最重要）
- 只出你「非常確定」的在地事實；對該地區不夠熟，就改出生活算術題或台灣通用的懷舊常識題（例：柑仔店、那卡西、布袋戲），題幹仍可帶到該地區的場景
- 寧可題目通用，不可內容錯誤；絕不編造不存在的地名、店名、典故

# 輸出格式（嚴格遵守）
只輸出一個 JSON 物件，不要任何其他文字、不要 markdown 程式碼框：
{
  "district": "台北市文山區",
  "questions": [
    {
      "question": "題目文字",
      "options": ["選項一", "選項二", "選項三"],
      "answer_index": 0,
      "explanation": "答案說明，溫暖懷舊的一兩句話",
      "category": "memory"
    }
  ]
}`;

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { district, count = 3 } = await req.json();

    if (!ANTHROPIC_API_KEY) {
      return new Response(
        JSON.stringify({ error: "ANTHROPIC_API_KEY not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
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
        max_tokens: 2048,
        system: SYSTEM_PROMPT,
        messages: [{
          role: "user",
          content: `行政區：${district ?? "台北市文山區"}\n題數：${count} 題（memory / calculation / orientation 各類至少一題）`,
        }],
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
    const jsonText = raw.replace(/^```(?:json)?\s*|\s*```$/g, "").trim();

    let parsed;
    try {
      parsed = JSON.parse(jsonText);
    } catch {
      parsed = { error: "parse_failed", raw: raw.slice(0, 300) };
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
