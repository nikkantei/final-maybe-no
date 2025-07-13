import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { to, subject, visionTitle, summary, headings, paragraphs, imageUrl } = req.body;

  if (!to || !subject || !headings || !paragraphs) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const htmlContent = `
    <h1>${visionTitle}</h1>
    <p><strong>Summary:</strong> ${summary}</p>
    ${headings.map((h, i) => `
      <h3>${h}</h3>
      <p>${paragraphs[i]}</p>
    `).join('')}
    ${imageUrl ? `<img src="${imageUrl}" alt="Vision Image" style="max-width:100%;margin-top:20px;">` : ''}
  `;

  try {
    await resend.emails.send({
      from: 'CivicHorizon <onboarding@resend.dev>',
      to,
      subject,
      html: htmlContent
    });
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Email send failed:', err);
    return res.status(500).json({ error: 'Failed to send email' });
  }
}
