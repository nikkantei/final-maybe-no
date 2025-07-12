import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { visionText } = req.body;

  const imagePrompt = `
You are an artist. Based on the following vision for the year 2050, create a highly visual, symbolic, and concrete image prompt that could be used to generate a compelling image. Focus on imagery, people, landscapes, technologies, or scenes. Do not include any text or title.

Respond with a single English sentence prompt for image generation.

Vision:
${visionText}
`.trim();

  try {
    const chat = await openai.chat.completions.create({
      model: "gpt-4-1106-preview",
      messages: [{ role: "user", content: imagePrompt }]
    });

    const prompt = chat.choices[0].message.content.trim();

    const image = await openai.images.generate({
      model: "dall-e-3",
      prompt,
      size: "1024x1024",
      quality: "standard",
      n: 1
    });

    return res.status(200).json({ url: image.data[0].url });
  } catch (err) {
    console.error("Image generation error:", err);
    return res.status(500).json({ error: "Failed to generate image", details: err.message });
  }
}

