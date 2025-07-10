import React, { useState } from 'react';
import './styles.css';

export default function App() {
  const [themes, setThemes] = useState([]);
  const [answers, setAnswers] = useState({});
  const [vision, setVision] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const questions = {
    politics: [
      "What values should guide political leadership in 2050?",
      "What should participation look like in a future democracy?",
      "What power should citizens hold?"
    ],
    economy: [
      "What does a fair economy look like in 2050?",
      "How is wealth distributed?",
      "What role does work play in society?"
    ],
    society: [
      "How do communities support each other in 2050?",
      "What inequalities have been solved?",
      "What does social justice look like?"
    ],
    technology: [
      "What technologies are essential in 2050?",
      "How is technology governed?",
      "What is the relationship between AI and society?"
    ],
    law: [
      "What rights are most important in 2050?",
      "How is justice maintained?",
      "What laws protect future generations?"
    ],
    environment: [
      "What does sustainability mean in 2050?",
      "How are natural resources managed?",
      "What environmental challenges have we overcome?"
    ]
  };

  const toggleTheme = (theme) => {
    setThemes((prev) =>
      prev.includes(theme) ? prev.filter(t => t !== theme) : [...prev, theme]
    );
  };

  const handleAnswer = (q, a) => {
    setAnswers(prev => ({ ...prev, [q]: a }));
  };

  const generate = async () => {
    const response = await fetch('/api/generateVision', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers })
    });

    const data = await response.json();
    if (data.vision) {
      setVision(data.vision);
    } else {
      setVision('⚠️ No vision generated.');
    }

    const imgPrompt = `A hopeful UK in 2050 based on these ideas: ${Object.values(answers).join(', ')}`;
    const imgRes = await fetch('/api/generateImage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: imgPrompt })
    });
    const imgData = await imgRes.json();
    setImageUrl(imgData.url || '');
  };

  const selectedQuestions = themes.flatMap(theme => questions[theme] || []);

  return (
    <div className="app">
      <h1>CivicHorizon: Envision the UK in 2050</h1>

      <section>
        <p>Select themes (1–5):</p>
        {Object.keys(questions).map(theme => (
          <label key={theme}>
            <input
              type="checkbox"
              checked={themes.includes(theme)}
              onChange={() => toggleTheme(theme)}
            />
            {theme}
          </label>
        ))}
      </section>

      {themes.length > 0 && (
        <section className="questions">
          {selectedQuestions.map((q, i) => (
            <div key={i}>
              <p>{q}</p>
              <textarea onChange={(e) => handleAnswer(q, e.target.value)} />
            </div>
          ))}
          <button onClick={generate}>Generate Vision</button>
        </section>
      )}

      {vision && (
        <section className="output">
          <h2>🌍 Vision for 2050</h2>
          <pre>{vision}</pre>
        </section>
      )}

      {imageUrl && (
        <section className="output">
          <h2>🎨 Vision Image</h2>
          <img src={imageUrl} alt="Future UK" />
        </section>
      )}
    </div>
  );
}
