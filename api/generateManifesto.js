export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { answers } = req.body;

  if (!answers || typeof answers !== 'object') {
    return res.status(400).json({ error: 'Invalid input' });
  }

  const prompt = `
You are an assistant helping to imagine a detailed, visionary, long-term future for the United Kingdom in 2050.

Based on the user's responses, write a vivid, imaginative, and plausible future *vision* of the UK in 2050.
Do not refer to the year 2025 or today. Emphasize societal transformation, collective values, and inspiring possibilities.

User responses:
${Object.entries(answers).map(([k, v]) => `${k}: ${v}`).join('\n')}

Output only the generated vision in clear markdown format.
`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          { role: "system", content: "You are a helpful assistant that generates visionary, long-term futures for the UK in 2050." },
          { role: "user", content: prompt }
        ],
        temperature: 0.8
      })
    });

    const data = await response.json();

    if (!response.ok || !data.choices?.[0]?.message?.content) {
      console.error("OpenAI API error:", data);
      return res.status(500).json({ error: "API error", details: data });
    }

    return res.status(200).json({ vision: data.choices[0].message.content });

  } catch (err) {
    console.error("Unexpected error:", err);
    return res.status(500).json({ error: "Unexpected error", details: err.message });
  }
}
