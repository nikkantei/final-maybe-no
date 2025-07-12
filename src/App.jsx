import React, { useState } from 'react';
import { downloadAsPDF } from './utils/pdfExport';
import './styles.css';

export default function App() {
  const [selectedThemes, setSelectedThemes] = useState([]);
  const [answers, setAnswers] = useState({});
  const [vision, setVision] = useState('');
  const [summary, setSummary] = useState('');
  const [visionTitle, setVisionTitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [editableVision, setEditableVision] = useState([]);
  const [isEditing, setIsEditing] = useState([]);
  const [showIntro, setShowIntro] = useState(true);
  const [followUpQs, setFollowUpQs] = useState([]);
  const [followUpAnswers, setFollowUpAnswers] = useState({});
  const [mode, setMode] = useState(null);

  const questions = {
    politics: [...],
    economy: [...],
    society: [...],
    technology: [...],
    law: [...],
    environment: [...]
  };

  const descriptions = {
    politics: 'Democracy, power, participation',
    economy: 'Work, wealth, inequality',
    society: 'Communities, justice, inclusion',
    technology: 'AI, digital life, governance',
    law: 'Rights, rules, future protections',
    environment: 'Sustainability, climate, nature'
  };

  const handleThemeToggle = (theme) =>
    setSelectedThemes(prev =>
      prev.includes(theme) ? prev.filter(t => t !== theme) : [...prev, theme]
    );

  const handleAnswer = (q, a) =>
    setAnswers(prev => ({ ...prev, [q]: a }));

  const generate = async () => {
    setLoading(true);
    setVision('');
    setImageUrl('');
    setSummary('');

    try {
      const res = await fetch('/api/generateManifesto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers })
      });
      const data = await res.json();
      const generatedVision = data.vision || '⚠️ No vision generated.';
      setVision(generatedVision);
      setSummary(data.summary || '');
      setVisionTitle(data.title || '');
      const paragraphs = generatedVision.split('\n').filter(p => p.trim());
      setEditableVision(paragraphs);
      setIsEditing(paragraphs.map(() => false));

      const imagePrompt = `
A vivid, optimistic concept art of the United Kingdom in 2050.
Show sustainable cities with green rooftops, thriving communities, diverse people collaborating, clean energy infrastructure (wind & solar), futuristic public transport, and nature integrated with technology.
Use vibrant colors, soft lighting, and cinematic detail. Peaceful, inspiring, utopian.
`.trim();

      const imageRes = await fetch('/api/generateImage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: imagePrompt })
      });

      const imageData = await imageRes.json();
      setImageUrl(imageData.url || '');
    } catch (err) {
      console.error(err);
      setVision('⚠️ Error generating vision.');
    } finally {
      setLoading(false);
    }
  };

  const selectedQs = selectedThemes.flatMap(t => questions[t] || []);

  return (
    <div className="app">
      {showIntro ? (
        <div className="intro-screen">
          <h1>Ministry for the Future</h1>
          <p>Welcome to CivicHorizon — imagine the UK in 2050.</p>
          <button className="start-button" onClick={() => setShowIntro(false)}>
            Start
          </button>
        </div>
      ) : (
        <>
          <h1>CivicHorizon: Envision the UK in 2050</h1>

          <div className="theme-selector">
            <p>Select 1–5 themes to explore:</p>
            {Object.keys(questions).map((theme) => (
              <button
                key={theme}
                title={descriptions[theme]}
                onClick={() => handleThemeToggle(theme)}
                className={selectedThemes.includes(theme) ? 'selected' : ''}
              >
                {theme}
              </button>
            ))}
          </div>

          {selectedThemes.length > 0 && (
            <div className="qa-section">
              {selectedQs.map((q, i) => (
                <div key={i} className="question-block">
                  <label><strong>{q}</strong></label>
                  <textarea
                    value={answers[q] || ''}
                    onChange={e => handleAnswer(q, e.target.value)}
                    placeholder="Your answer…"
                    maxLength={500}
                  />
                </div>
              ))}
              <button className="generate-button" onClick={generate} disabled={loading}>
                {loading ? 'Generating…' : 'Generate Vision'}
              </button>
            </div>
          )}

          {loading && (
            <div className="loading-overlay">
              <p>✨ Generating your future vision...</p>
            </div>
          )}

          {/* 🔹 Summary FIRST */}
          {summary && (
            <div className="vision-summary-card">
              <div className="summary-title">🌟 Your 2050 Vision Summary</div>
              <div className="summary-text">{summary}</div>
            </div>
          )}

          {/* 🔹 Vision output */}
          {vision && (
            <div className="card output">
              {/* 🔹 Editable Title */}
              <input
                className="vision-title"
                type="text"
                placeholder="Enter a custom title..."
                value={visionTitle}
                onChange={e => setVisionTitle(e.target.value)}
              />

              <h2>🌍 Vision for 2050</h2>

              <button onClick={() => downloadAsPDF(vision, imageUrl)}>📄 Download as PDF</button>
              <button
                onClick={() => setIsEditing(editableVision.map(() => true))}
                style={{ marginBottom: '16px', backgroundColor: '#FF365E', color: 'white' }}
              >
                ✏️ Edit Vision
              </button>
              <p className="editable-hint">📝 Click any paragraph below to edit it.</p>

              <div className="editable-vision">
                {editableVision.map((para, idx) => (
                  <div key={idx} className="editable-block">
                    {isEditing[idx] ? (
                      <textarea
                        value={para}
                        onChange={e => {
                          const updated = [...editableVision];
                          updated[idx] = e.target.value;
                          setEditableVision(updated);
                        }}
                        onBlur={() => {
                          const updated = [...isEditing];
                          updated[idx] = false;
                          setIsEditing(updated);
                          setVision(editableVision.join('\n'));
                        }}
                        autoFocus
                      />
                    ) : (
                      <p onClick={() => {
                        const updated = [...isEditing];
                        updated[idx] = true;
                        setIsEditing(updated);
                      }}>{para}</p>
                    )}
                  </div>
                ))}
              </div>

              <div className="feedback-buttons">
                <button onClick={() => {}}>🔁 Refine Vision</button>
                <button onClick={() => {}}>🎨 Regenerate Image</button>
              </div>
            </div>
          )}

          {/* 🔹 Image output */}
          {imageUrl && (
            <div className="card output">
              <h2>🎨 Visual Representation</h2>
              <img src={imageUrl} alt="Generated vision" />
            </div>
          )}
        </>
      )}
    </div>
  );
}
