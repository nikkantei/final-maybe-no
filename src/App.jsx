import React, { useState } from 'react';
import { downloadAsPDF } from './utils/pdfExport';
import './styles.css';

export default function App() {
  const [selectedThemes, setSelectedThemes] = useState([]);
  const [answers, setAnswers] = useState({});
  const [vision, setVision] = useState('');
  const [summary, setSummary] = useState('');
  const [visionTitle, setVisionTitle] = useState('');
  const [editableVision, setEditableVision] = useState([]);
  const [editableHeadings, setEditableHeadings] = useState([]);
  const [isEditing, setIsEditing] = useState([]);
  const [loading, setLoading] = useState(false);

  const questions = {
    politics: ['What values should guide political leadership in 2050?', 'What should participation look like in a future democracy?', 'What power should citizens hold?'],
    economy: ['What does a fair economy look like in 2050?', 'How is wealth distributed?', 'What role does work play in society?'],
    society: ['How do communities support each other in 2050?', 'What inequalities have been solved?', 'What does social justice look like?'],
    technology: ['What technologies are essential in 2050?', 'How is technology governed?', 'What is the relationship between AI and society?'],
    law: ['What rights are most important in 2050?', 'How is justice maintained?', 'What laws protect future generations?'],
    environment: ['What does sustainability mean in 2050?', 'How are natural resources managed?', 'What environmental challenges have we overcome?']
  };

  const handleThemeToggle = (theme) => {
    setSelectedThemes(prev =>
      prev.includes(theme) ? prev.filter(t => t !== theme) : [...prev, theme]
    );
  };

  const handleAnswer = (q, a) => {
    setAnswers(prev => ({ ...prev, [q]: a }));
  };

  const selectedQs = selectedThemes.flatMap(t => questions[t] || []);

  const parseVisionWithHeadings = (visionText) => {
    const parts = visionText.split(/(?=^#+\s)/gm).filter(Boolean);
    const headings = [];
    const paragraphs = [];

    parts.forEach(block => {
      const [firstLine, ...rest] = block.trim().split('\n');
      if (firstLine.startsWith('#')) {
        headings.push(firstLine.replace(/^#+\s*/, ''));
        paragraphs.push(rest.join(' ').trim());
      } else {
        headings.push('');
        paragraphs.push(block.trim());
      }
    });

    return { headings, paragraphs };
  };

  const generate = async () => {
    setLoading(true);
    setVision('');
    setSummary('');
    setVisionTitle('');

    try {
      const res = await fetch('/api/generateManifesto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers })
      });

      const data = await res.json();
      setVision(data.vision || '');
      setSummary(data.summary || '');
      setVisionTitle(data.title || '');

      const { headings, paragraphs } = parseVisionWithHeadings(data.vision || '');
      setEditableVision(paragraphs);
      setEditableHeadings(headings);
      setIsEditing(paragraphs.map(() => false));
    } catch (err) {
      console.error(err);
      setVision('⚠️ Error generating vision.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <h1>CivicHorizon: Envision the UK in 2050</h1>

      <div className="theme-section">
        <p>Select 1–5 themes to explore:</p>
        <div className="theme-grid">
          {Object.keys(questions).map((theme) => (
            <button
              key={theme}
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
          <p>{summary}</p>
        </div>
      )}

      {vision && (
        <div className="card output">
          <h2>🌍 Vision for 2050</h2>
          <button onClick={async () => {
            try {
              await downloadAsPDF(
                visionTitle || 'Vision for 2050',
                summary || 'No summary provided.',
                editableHeadings,
                editableVision
              );
            } catch (err) {
              console.error('❌ Failed to download PDF:', err);
              alert('Failed to generate PDF. Please try again.');
            }
          }}>
            📄 Download as PDF
          </button>

          <div className="editable-vision">
            {editableVision.map((para, idx) => (
              <div key={idx} className="editable-block">
                <h3>{editableHeadings[idx]}</h3>
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
                  }}>
                    {para}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
