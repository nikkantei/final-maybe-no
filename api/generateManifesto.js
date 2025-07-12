import OpenAI from "openai";
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { answers, extraInfo = '', mode = 'default' } = req.body;

  const combinedInput = Object.entries(answers)
    .map(([q, a]) => `Q: ${q}\nA: ${a}`)
    .join('\n\n');

  const systemPrompt = `
You are a civic imagination AI helping users envision a hopeful future for the UK in 2050.

Given answers to thematic questions, generate:
1. A detailed, vivid, inspirational VISION for the UK in 2050 (1–4 paragraphs).
2. A short SUMMARY of that vision (1–2 sentences).
3. A compelling TITLE (max 10 words).

Format your response like this:
---
VISION:
<paragraphs>

SUMMARY:
<summary>

TITLE:
<title>
`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4-1106-preview",
      messages: [
        { role: "system", content: systemPrompt.trim() },
        { role: "user", content: combinedInput + (extraInfo ? `\n\nExtra: ${extraInfo}` : '') }
      ],
      temperature: 0.9,
    });

    const text = completion.choices[0]?.message?.content || '';
    const vision = text.match(/VISION:\s*([\s\S]*?)\nSUMMARY:/)?.[1]?.trim();
    const summary = text.match(/SUMMARY:\s*([\s\S]*?)\nTITLE:/)?.[1]?.trim();
    const title = text.match(/TITLE:\s*(.*)/)?.[1]?.trim();

    return res.status(200).json({ vision, summary, title });
  } catch (err) {
    console.error("Manifesto generation error:", err);
    return res.status(500).json({ error: 'Generation failed', details: err.message });
  }
}
