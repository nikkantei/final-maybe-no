import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt } = req.body;

  if (!prompt || prompt.length > 1000) {
    return res.status(400).json({ error: 'Missing or invalid prompt' });
  }

  try {
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt,
      n: 1,
      size: "1024x1024",
      quality: "standard",
      response_format: "url",
    });

    const imageUrl = response.data[0]?.url;

    if (!imageUrl) {
      console.error("Image generation failed:", response);
      return res.status(500).json({ error: "Image generation failed", details: response });
    }

    return res.status(200).json({ url: imageUrl });
  } catch (err) {
    console.error("Unexpected error (image)", err);
    return res.status(500).json({ error: "Unexpected error", details: err.message });
  }
}
