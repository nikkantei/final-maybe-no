import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { visionText, focus = '' } = req.body;

  if (!visionText || typeof visionText !== 'string') {
    return res.status(400).json({ error: 'Invalid or missing visionText' });
  }

  const prompt = `
The following is a vision of the UK in the year 2050. Focus on one *typical, concrete* element from the text — for example, a community garden, a futuristic public transit system, a classroom of the future, or a citizens’ assembly — and generate an artistic digital illustration of that scene.

Only visualize one clear scene. Avoid generic skylines or abstract crowds.

Text:
${visionText}

${focus ? `Focus especially on: ${focus}` : ''}
`;

  try {
    const image = await openai.images.generate({
      model: 'dall-e-3',
      prompt,
      n: 1,
      size: '1024x1024'
    });

    res.status(200).json({
      url: image.data[0].url,
      caption: focus
        ? `Visual focus: ${focus}`
        : 'A digital interpretation of your 2050 vision.'
    });

  } catch (err) {
    console.error('Image generation failed:', err);
    res.status(500).json({ error: 'Failed to generate image', details: err.message });
  }
}
