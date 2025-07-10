export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { answers } = req.body;
  if (!answers || typeof answers !== 'object') return res.status(400).json({ error: 'Invalid input' });
  const prompt = `User answers:\n${Object.entries(answers).map(([k, v]) => `${k}: ${v}`).join('\n')}`;
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": \`Bearer \${process.env.OPENAI_API_KEY}\`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [{ role: "system", content: "Vision assistant" }, { role: "user", content: prompt }],
        temperature: 0.8
      })
    });
    const data = await response.json();
    if (!response.ok) return res.status(500).json({ error: "API error", details: data });
    return res.status(200).json({ manifesto: data.choices?.[0]?.message?.content });
  } catch (err) {
    return res.status(500).json({ error: "Unexpected error", details: err.message });
  }
}
