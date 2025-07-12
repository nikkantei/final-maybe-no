import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { visionText } = req.body;

  if (!visionText) {
    return res.status(400).json({ error: "Missing visionText" });
  }

  try {
    // Step 1: Use GPT to generate a detailed visual prompt from the vision text
    const gptResponse = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You write vivid visual prompts for DALL·E 3 based on abstract ideas.",
        },
        {
          role: "user",
          content: `Turn this future vision of the UK in 2050 into a detailed image prompt for DALL·E 3:

${visionText}

Include people, landscapes, futuristic buildings, community life, nature, and technology. Make the tone hopeful and cinematic. Return only the prompt.`,
        },
      ],
      temperature: 0.8,
    });

    const imagePrompt = gptResponse.choices?.[0]?.message?.content?.trim();

    if (!imagePrompt) {
      return res.status(500).json({ error: "Failed to generate image prompt" });
    }

    // Step 2: Call DALL·E 3 properly
    const image = await openai.images.generate({
      model: "dall-e-3",
      prompt: imagePrompt,
      n: 1,
      size: "1024x1024",
      quality: "standard",
      response_format: "url",
    });

    const imageUrl = image.data[0].url;

    return res.status(200).json({ url: imageUrl });
  } catch (err) {
    console.error("Unexpected error (image)", err);
    return res.status(500).json({ error: "Unexpected error", details: err.message });
  }
}
