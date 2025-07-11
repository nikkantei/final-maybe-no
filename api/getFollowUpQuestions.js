import OpenAI from 'openai';

const openai = new OpenAI({
 apiKey: process.env.VITE_OPENAI_API_KEY || process.env.OPENAI_API_KEY
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { answers } = req.body;

  if (!answers || typeof answers !== 'object') {
    return res.status(400).json({ message: 'Missing or invalid answers' });
  }

  const prompt = `
You are helping someone imagine the UK in the year 2050.

They answered these questions about politics, society, technology, etc.:

${Object.entries(answers)
  .map(([q, a]) => `Q: ${q}\nA: ${a}`)
  .join('\n\n')}

Suggest 2–3 follow-up questions that would help clarify or deepen their vision of the future. Make the questions open-ended and thoughtful. Just return the questions as a list, no explanations.
`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'You generate clarifying questions for vision-building.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7
    });

    const output = completion.choices[0].message.content;

    // Extract the questions from the output
    const questions = output
      .split('\n')
      .map(q => q.replace(/^\d+\.\s*/, '').trim())
      .filter(q => q.length > 10); // ignore short lines

    res.status(200).json({ questions });
  } catch (err) {
    console.error('Follow-up generation error:', err);
    res.status(500).json({ message: 'Failed to generate follow-up questions' });
  }
}
