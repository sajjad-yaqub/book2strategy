import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are an elite behavioral strategy analyst. You receive text extracted from business/strategy books and must output EXACTLY 10 "Strategy Cards" as a JSON array.

RULES:
- IGNORE generic summaries, tables of contents, acknowledgments, and filler.
- Extract ONLY actionable, high-leverage behavioral insights.
- Each headline must be witty, Rory Sutherland-style — think "The £300M Doorknob That Sold Itself."
- Each story must be a 2-sentence narrative anchor grounded in real psychology or behavioral economics.
- SNEPOA must be sharp, specific, and actionable — not vague platitudes.

Output ONLY a valid JSON array of 10 objects with this exact schema:
[{
  "id": "1",
  "headline": "witty hook",
  "story": "2-sentence narrative",
  "snepoa": {
    "stimuli": "the artifact/trigger",
    "novelty": "the hook/surprise",
    "evolutionary_filters": "safety/status lever",
    "pre_existing_substrate": "user mental model",
    "outcome": "psychological + business result",
    "action": "the high-leverage move"
  },
  "pl_impact": "monetary equivalent e.g. 'Reduces Churn by 23%'",
  "urgent_action": "Shreyas Doshi-style next step"
}]`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { pdf_base64, filename } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Decode PDF and extract text (first ~8000 chars for context window)
    const pdfBytes = Uint8Array.from(atob(pdf_base64), c => c.charCodeAt(0));
    // Simple text extraction from PDF binary
    const textDecoder = new TextDecoder("utf-8", { fatal: false });
    let rawText = textDecoder.decode(pdfBytes);
    // Extract readable text between stream markers
    const textChunks: string[] = [];
    const streamRegex = /stream\s*\n([\s\S]*?)\nendstream/g;
    let match;
    while ((match = streamRegex.exec(rawText)) !== null) {
      const chunk = match[1].replace(/[^\x20-\x7E\n\r\t]/g, ' ').trim();
      if (chunk.length > 20) textChunks.push(chunk);
    }
    let extractedText = textChunks.join('\n').slice(0, 12000);
    if (extractedText.length < 200) {
      extractedText = rawText.replace(/[^\x20-\x7E\n\r\t]/g, ' ').replace(/\s+/g, ' ').slice(0, 12000);
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: `Analyze this book text from "${filename}" and generate 10 Strategy Cards:\n\n${extractedText}` },
        ],
        tools: [{
          type: "function",
          function: {
            name: "output_strategy_cards",
            description: "Output the 10 strategy cards extracted from the book",
            parameters: {
              type: "object",
              properties: {
                cards: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      id: { type: "string" },
                      headline: { type: "string" },
                      story: { type: "string" },
                      snepoa: {
                        type: "object",
                        properties: {
                          stimuli: { type: "string" },
                          novelty: { type: "string" },
                          evolutionary_filters: { type: "string" },
                          pre_existing_substrate: { type: "string" },
                          outcome: { type: "string" },
                          action: { type: "string" },
                        },
                        required: ["stimuli", "novelty", "evolutionary_filters", "pre_existing_substrate", "outcome", "action"],
                      },
                      pl_impact: { type: "string" },
                      urgent_action: { type: "string" },
                    },
                    required: ["id", "headline", "story", "snepoa", "pl_impact", "urgent_action"],
                  },
                },
              },
              required: ["cards"],
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "output_strategy_cards" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited — try again shortly" }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Credits exhausted — add funds in Settings" }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await response.text();
      console.error("AI error:", response.status, errText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiData = await response.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No tool call in AI response");

    const parsed = JSON.parse(toolCall.function.arguments);
    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("extract-snepoa error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
