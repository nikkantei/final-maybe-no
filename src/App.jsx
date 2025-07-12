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
  const [showFollowUpForm, setShowFollowUpForm] = useState(false);
  const [nextAction, setNextAction] = useState(null);

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

  const descriptions = {
    politics: 'Democracy, power, participation',
    economy: 'Work, wealth, inequality',
    society: 'Communities, justice, inclusion',
    technology: 'AI, digital life, governance',
    law: 'Rights, rules, future protections',
    environment: 'Sustainability, climate, nature'
  };

  const handleThemeToggle = (theme) => {
    setSelectedThemes(prev =>
      prev.includes(theme) ? prev.filter(t => t !== theme) : [...prev, theme]
    );
  };

  const handleAnswer = (q, a) => {
    setAnswers(prev => ({ ...prev, [q]: a }));
  };

  const fetchFollowUpQuestions = async () => {
    try {
      const res = await fetch('/api/getFollowUpQuestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers })
      });
      const data = await res.json();
      setFollowUpQs(data.questions || []);
      setShowFollowUpForm(true);
    } catch (err) {
      console.error('Failed to fetch follow-up questions:', err);
    }
  };

  const proceedWithFollowUps = async () => {
    setLoading(true);
    setShowFollowUpForm(false);
    const extraInfo = Object.values(followUpAnswers).join(' ');

    if (nextAction === 'refine') {
      try {
        const res = await fetch('/api/generateManifesto', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ answers, extraInfo, mode: 'refine' })
        });
        const data = await res.json();
        setVision(data.vision || '');
        setSummary(data.summary || '');
        setVisionTitle(data.title || '');
        const paragraphs = (data.vision || '').split('\n').filter(p => p.trim());
        setEditableVision(paragraphs);
        setIsEditing(paragraphs.map(() => false));
      } catch (err) {
        console.error('Refine Vision error:', err);
      } finally {
        setLoading(false);
      }
    } else if (nextAction === 'image') {
      try {
        const res = await fetch('/api/generateImage', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ visionText: extraInfo || editableVision.join('\n') })
        });
        const data = await res.json();
        setImageUrl(data.url || '');
      } catch (err) {
        console.error('Image regeneration failed:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="app">
      {showIntro ? (
        <div className="intro-screen">
          <h1>Public Consultation by Ministry for the Future</h1>
          <p>Welcome to CivicHorizon — imagine the UK in 2050.</p>
          <button className="start-button" onClick={() => setShowIntro(false)}>
            Start
          </button>
        </div>
      ) : (
        <>
          <h1><strong>CivicHorizon: Envision the UK in 2050</strong></h1>

          <div className="theme-section">
            <p className="theme-instruction">Select 1–5 themes to explore:</p>
            <div className="theme-grid">
              {Object.keys(questions).map((theme) => (
                <button
                  key={theme}
                  title={descriptions[theme]}
                  onClick={() => handleThemeToggle(theme)}
                  className={`theme-button ${selectedThemes.includes(theme) ? 'selected' : ''}`}
                >
                  {theme}
                </button>
              ))}
            </div>
          </div>

          {selectedThemes.length > 0 && (
            <div className="qa-section">
              {selectedThemes.flatMap(t => questions[t]).map((q, i) => (
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
              <button className="generate-button" onClick={fetchFollowUpQuestions} disabled={loading}>
                {loading ? 'Loading…' : 'Generate Vision'}
              </button>
            </div>
          )}

          {loading && (
            <div className="loading-overlay">
              <p>✨ Working on your future vision...</p>
            </div>
          )}

          {showFollowUpForm && (
            <div className="card output">
              <h3>Please answer a few follow-up questions:</h3>
              {followUpQs.map((q, i) => (
                <div key={i}>
                  <label>{q}</label>
                  <textarea
                    value={followUpAnswers[q] || ''}
                    onChange={e => setFollowUpAnswers(prev => ({ ...prev, [q]: e.target.value }))}
                  />
                </div>
              ))}
              <button onClick={proceedWithFollowUps}>Continue</button>
            </div>
          )}

          {summary && (
            <div className="vision-summary-card">
              <h2
                className="summary-title"
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => setVisionTitle(e.target.textContent)}
              >
                {visionTitle || '🌟 Your 2050 Vision'}
              </h2>
              <p className="summary-text">{summary}</p>
            </div>
          )}

          {vision && (
            <div className="card output">
              <h2>🌍 Vision for 2050</h2>
              <button onClick={() => downloadAsPDF(visionTitle + '\n\n' + editableVision.join('\n\n'), imageUrl)}>
                📄 Download as PDF
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
                      <p
                        data-heading={`Heading ${idx + 1}`}
                        onClick={() => {
                          const updated = [...isEditing];
                          updated[idx] = true;
                          setIsEditing(updated);
                        }}
                      >
                        {para}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              <div className="feedback-buttons">
                <button
                  onClick={() => {
                    setNextAction('refine');
                    fetchFollowUpQuestions();
                  }}
                >
                  🔁 Refine Vision
                </button>
                <button
                  onClick={() => {
                    setNextAction('image');
                    fetchFollowUpQuestions();
                  }}
                >
                  🎨 Regenerate Image
                </button>
              </div>
            </div>
          )}

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
