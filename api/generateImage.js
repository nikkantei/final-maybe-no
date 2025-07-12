import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { visionText } = req.body;
  const focus = visionText.split('\n').find(p => p.length > 80) || visionText;

  const prompt = `Create a visually stunning image that represents the following future vision excerpt from 2050. Be specific and avoid generic cityscapes: "${focus}"`;

  try {
    const image = await openai.images.generate({
      prompt,
      n: 1,
      size: "1024x1024"
    });

    res.status(200).json({ url: image.data[0].url });
  } catch (err) {
    console.error("Image generation failed:", err);
    res.status(500).json({ error: "Image generation failed", details: err.message });
  }
}
