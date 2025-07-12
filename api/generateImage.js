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
    // Step 1: Ask GPT to create a DALL·E-style prompt from the vision
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

Include details about people, landscapes, futuristic buildings, social life, nature, and technology. Make the tone hopeful and inspiring. Return only the prompt.`,
        },
      ],
      temperature: 0.8,
    });

    const imagePrompt = gptResponse.choices?.[0]?.message?.content?.trim();

    if (!imagePrompt) {
      return res.status(500).json({ error: "Failed to generate image prompt" });
    }

    // Step 2: Send the prompt to DALL·E 3
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
