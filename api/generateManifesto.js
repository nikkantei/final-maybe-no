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
3. A full, vivid and inspiring long-form vision broken into 5–7 key sections.

Each section should have:
- a short, descriptive heading (max 6 words)
- a paragraph of text describing that aspect of the future.

Respond in this raw JSON format:
{
  "title": "...",
  "summary": "...",
  "vision": [
    { "heading": "Heading 1", "text": "Paragraph 1..." },
    { "heading": "Heading 2", "text": "Paragraph 2..." },
    ...
  ]
}

User input: ${inputText} ${extraInfo}
`.trim();

  try {
    const chat = await openai.chat.completions.create({
      model: "gpt-4-1106-preview",
      messages: [{ role: "user", content: finalPrompt }]
    });

    const rawContent = chat.choices[0].message.content || '';
    const cleanedContent = rawContent.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(cleanedContent);

    return res.status(200).json({
      title: parsed.title,
      summary: parsed.summary,
      vision: parsed.vision.map(v => ({
        heading: v.heading,
        text: v.text
      }))
    });
  } catch (err) {
    console.error("Manifesto error:", err);
    return res.status(500).json({ error: "Failed to generate vision", details: err.message });
  }
}
