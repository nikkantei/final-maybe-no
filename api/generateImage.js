import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Missing prompt' });
  }

  try {
    const imagePrompt = `
    A vivid, optimistic concept art of the United Kingdom in 2050.

    Show sustainable cities with green rooftops, thriving communities, diverse people collaborating, clean energy infrastructure (like wind and solar), futuristic public transport, and natural landscapes integrated with technology.

    Use vibrant colors, soft lighting, and cinematic detail. The scene should be peaceful, inspiring, and full of life — like a utopian future made real.
    `.trim();

    const completion = await openai.chat.completions.create({
      model: "gpt-4-1106-preview",
      messages: [
        {
          role: "user",
          content: [{ type: "text", text: imagePrompt }],
        },
      ],
      tools: [{ type: "image_generation" }],
    });

    const toolCall = completion.choices?.[0]?.message?.tool_calls?.[0];
    const imageUrl = toolCall?.function?.arguments?.url;

    if (!imageUrl) {
      console.error("DALL·E 3 image generation failed", completion);
      return res.status(500).json({ error: "Image generation failed", details: completion });
    }

    return res.status(200).json({ url: imageUrl });
  } catch (err) {
    console.error("Unexpected error (image)", err);
    return res.status(500).json({ error: "Unexpected error", details: err.message });
  }
}
