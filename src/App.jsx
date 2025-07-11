const [followUpQs, setFollowUpQs] = useState([]);
const [followUpAnswers, setFollowUpAnswers] = useState({});
const [mode, setMode] = useState(null); // "refineVision" or "regenerateImage"
import { downloadAsPDF } from './utils/pdfExport';
import React, { useState } from 'react';
import './styles.css';

export default function App() {
  const [selectedThemes, setSelectedThemes] = useState([]);
  const [answers, setAnswers] = useState({});
  const [vision, setVision] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const questions = {
    politics: [
      'What values should guide political leadership in 2050?',
      'What should participation look like in a future democracy?',
      'What power should citizens hold?'
    ],
    economy: [
      'What does a fair economy look like in 2050?',
      'How is wealth distributed?',
      'What role does work play in society?'
    ],
    society: [
      'How do communities support each other in 2050?',
      'What inequalities have been solved?',
      'What does social justice look like?'
    ],
    technology: [
      'What technologies are essential in 2050?',
      'How is technology governed?',
      'What is the relationship between AI and society?'
    ],
    law: [
      'What rights are most important in 2050?',
      'How is justice maintained?',
      'What laws protect future generations?'
    ],
    environment: [
      'What does sustainability mean in 2050?',
      'How are natural resources managed?',
      'What environmental challenges have we overcome?'
    ]
  };

  const handleThemeToggle = (theme) => {
    setSelectedThemes(prev =>
      prev.includes(theme)
        ? prev.filter(t => t !== theme)
        : [...prev, theme]
    );
  };

  const handleAnswer = (q, a) => {
    setAnswers(prev => ({ ...prev, [q]: a }));
  };

  const generate = async () => {
    setLoading(true);
    setVision('');
    setImageUrl('');

    try {
      // 🧠 Generate vision
      const res = await fetch('/api/generateManifesto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers })
      });

      const data = await res.json();
      if (data.vision) {
        setVision(data.vision);
      } else {
        setVision('⚠️ No vision generated.');
      }

      // 🎨 Generate image
const imagePrompt = `
An artistic, detailed illustration of the UK in 2050 that reflects the following themes and ideas:
${selectedThemes.join(', ')}

Key concepts from user answers:
${Object.values(answers).join(', ')}

The image should feel visionary, positive, and human-centered. Avoid generic or abstract visuals. Show scenes that reflect values, communities, technologies, and environments of the future.
`;
      const imgRes = await fetch('/api/generateImage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: imagePrompt })
      });

      const imgData = await imgRes.json();
      setImageUrl(imgData.url || '');
    } catch (err) {
      setVision('⚠️ Error generating vision.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const selectedQs = selectedThemes.flatMap(theme => questions[theme] || []);

  return (
    <div className="app">
      <h1>CivicHorizon: Envision the UK in 2050</h1>

      <div className="theme-selector">
        <p>Select 1–5 themes to explore:</p>
        const descriptions = {
  politics: 'Democracy, power, participation',
  economy: 'Work, wealth, inequality',
  society: 'Communities, justice, inclusion',
  technology: 'AI, digital life, governance',
  law: 'Rights, rules, future protections',
  environment: 'Sustainability, climate, nature'
};
        {Object.keys(questions).map(theme => (
<button
  key={theme}
  title={descriptions[theme]}  // this adds the tooltip
  onClick={() => handleThemeToggle(theme)}
  className={selectedThemes.includes(theme) ? 'selected' : ''}
>
  {theme}
</button>
        ))}
      </div>

      {selectedQs.length > 0 && (
        <div className="qa-section">
          {selectedQs.map((q, idx) => (
            <div key={idx} className="question-block">
              <label><strong>{q}</strong></label>
              <textarea
                value={answers[q] || ''}
                onChange={(e) => handleAnswer(q, e.target.value)}
                placeholder="Your answer..."
              />
            </div>
          ))}
          <button onClick={generate} disabled={loading}>
            {loading ? 'Generating...' : 'Generate Vision'}
          </button>
        </div>
      )}

{vision && (
  <div className="card output">
    <h2>🌍 Vision for 2050</h2>
    <button onClick={() => downloadAsPDF(vision, imageUrl)}>📄 Download as PDF</button>
    <div dangerouslySetInnerHTML={{ __html: vision.replace(/\n/g, '<br />') }} />
  </div>
)}

{imageUrl && (
  <div className="card output">
    <h2>🎨 Visual Representation</h2>
    <img src={imageUrl} alt="Generated vision" />
  </div>
)}
