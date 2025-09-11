import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!OPENAI_API_KEY) {
      return new Response(JSON.stringify({ error: "Missing OPENAI_API_KEY" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { image, patientType } = await req.json();
    if (!image) {
      return new Response(JSON.stringify({ error: "Image is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are a cautious medical triage assistant. Describe visible findings, possible non-diagnostic causes, and clear next steps (home care vs. seek care). Avoid definitive diagnoses.",
          },
          {
            role: "user",
            content: [
              { type: "text", text: `Analyze this clinical photo. Patient type: ${patientType || "unknown"}.` },
              { type: "image_url", image_url: { url: image } },
            ],
          },
        ],
        max_tokens: 500,
        temperature: 0.4,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      console.error("OpenAI error:", data);
      throw new Error(data?.error?.message || "OpenAI request failed");
    }

    const analysis = data?.choices?.[0]?.message?.content || "No analysis available.";

    return new Response(JSON.stringify({ analysis }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (err: any) {
    console.error("analyze-medical-image error:", err);
    return new Response(JSON.stringify({ error: err.message || "Unexpected error" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
