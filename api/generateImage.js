/* /api/generateImage.js
   Generates a cinematic, realistic illustration of the UK in 2050
*/
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { visionText } = req.body;          // pass the full vision text
  if (!visionText) {
    return res.status(400).json({ error: 'Missing visionText' });
  }

  /* ---------- Build a concise, visual-first prompt ---------- */
  const imagePrompt = `
A realistic, high-resolution digital illustration of daily life in the UK in 2050.
Show diverse people, green energy infrastructure, advanced public transport, and lush urban greenery.
Style: clean cinematic concept-art, detailed and optimistic, no abstract paint strokes, no surreal filters.
Key ideas from the vision:
${visionText.slice(0, 250)}   /* keep prompt <1000 chars */
`;

  try {
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: imagePrompt,
        n: 1,
        size: '1024x1024'        // higher resolution for clarity
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('OpenAI API error (image):', data);
      return res.status(500).json({ error: 'Image generation failed', details: data });
    }

    return res.status(200).json({ url: data.data?.[0]?.url });
  } catch (err) {
    console.error('Unexpected error (image):', err);
    return res.status(500).json({ error: 'Unexpected error', details: err.message });
  }
}
