// File: /pages/api/summarizeVision.js

import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { vision } = req.body;

  if (!vision) {
    return res.status(400).json({ error: 'Missing vision text' });
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that summarizes civic future visions."
        },
        {
          role: "user",
          content: `Summarize the following vision text in 2–3 sentences, and suggest a compelling short title:
\n\n${vision}`
        }
      ]
    });

    const completion = response.choices[0].message.content;

    // Try to split the title and summary if model formats that way
    const titleMatch = completion.match(/^Title\s*:\s*(.+)/i);
    const summaryMatch = completion.match(/Summary\s*:\s*(.+)/is);

    if (titleMatch && summaryMatch) {
      return res.status(200).json({
        title: titleMatch[1].trim(),
        summary: summaryMatch[1].trim()
      });
    } else {
      // Fallback: just return full response as summary, and empty title
      return res.status(200).json({
        title: '',
        summary: completion.trim()
      });
    }
  } catch (err) {
    console.error('Error summarizing vision:', err);
    return res.status(500).json({ error: 'Failed to summarize vision', details: err.message });
  }
}
