export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Missing prompt' });
  }

  try {
    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        prompt,
        n: 1,
        size: "512x512"
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("OpenAI API error (image):", data);
      return res.status(500).json({ error: "Image generation failed", details: data });
    }

    return res.status(200).json({ url: data.data?.[0]?.url });
  } catch (err) {
    console.error("Unexpected error (image):", err);
    return res.status(500).json({ error: "Unexpected error", details: err.message });
  }
}
