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
      const imagePrompt = `A hopeful long-term vision of the UK in 2050 based on: ${Object.values(answers).join(', ')}. Minimalist, inspiring illustration.`;
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
        {Object.keys(questions).map(theme => (
          <button
            key={theme}
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
        <div className="output">
          <h2>🌍 Vision for 2050</h2>
<div dangerouslySetInnerHTML={{ __html: vision.replace(/\n/g, '<br />') }} />
        </div>
      )}

      {imageUrl && (
        <div className="output">
          <h2>🎨 Visual Representation</h2>
          <img src={imageUrl} alt="Generated vision" />
        </div>
      )}
    </div>
  );
}
