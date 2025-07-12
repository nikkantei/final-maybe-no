import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { answers, extraInfo = "", mode = "initial" } = req.body;

  const inputText = Object.values(answers).join(" ");
  const finalPrompt = `
You are a visionary policy thinker. Based on the input below, generate:

1. A short, bold and inspiring title for a 2050 vision (max 10 words)
2. A concise summary paragraph of the future vision (2–3 sentences)
3. A full, vivid and inspiring long-form vision (5–7 paragraphs)

Return only valid raw JSON:
{
  "title": "...",
  "summary": "...",
  "vision": "..."
}

User input: ${inputText} ${extraInfo}
`.trim();

  try {
    const chat = await openai.chat.completions.create({
      model: "gpt-4-1106-preview",
      messages: [{ role: "user", content: finalPrompt }]
    });

    const raw = chat.choices[0].message.content || "";
    const cleaned = raw.replace(/```json|```/g, '').trim();

    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch (err) {
      console.error("❌ JSON parse failed:", err.message);
      console.log("🔎 Raw content:", raw);
      return res.status(500).json({ error: "Failed to parse vision JSON." });
    }

    return res.status(200).json({
      title: parsed.title || '',
      summary: parsed.summary || '',
      vision: parsed.vision || ''
    });

  } catch (err) {
    console.error("Manifesto error:", err);
    return res.status(500).json({ error: "Failed to generate vision", details: err.message });
  }
}

