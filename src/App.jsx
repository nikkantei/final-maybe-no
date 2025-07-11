import React, { useState } from 'react';
import { downloadAsPDF } from './utils/pdfExport';
import './styles.css';

export default function App() {
  /* ─── React state ─────────────────────────────────────────────── */
  const [selectedThemes, setSelectedThemes]   = useState([]);
  const [answers, setAnswers]                 = useState({});
  const [vision, setVision]                   = useState('');
  const [imageUrl, setImageUrl]               = useState('');
  const [loading, setLoading]                 = useState(false);

  const [followUpQs, setFollowUpQs]           = useState([]);
  const [followUpAnswers, setFollowUpAnswers] = useState({});
  const [mode, setMode]                       = useState(null); // "refineVision" | "regenerateImage"

  /* ─── Constants ───────────────────────────────────────────────── */
  const questions = { 
    /* … your question lists (unchanged) … */
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
  ]};

  const descriptions = {
    politics:    'Democracy, power, participation',
    economy:     'Work, wealth, inequality',
    society:     'Communities, justice, inclusion',
    technology:  'AI, digital life, governance',
    law:         'Rights, rules, future protections',
    environment: 'Sustainability, climate, nature'
  };

  /* ─── Handlers ───────────────────────────────────────────────── */
  const handleThemeToggle = (theme) =>
    setSelectedThemes(prev =>
      prev.includes(theme) ? prev.filter(t => t !== theme) : [...prev, theme]
    );

  const handleAnswer = (q, a) =>
    setAnswers(prev => ({ ...prev, [q]: a }));

  /* ─── Main “Generate Vision + Image” ──────────────────────────── */
  const generate = async () => {
    setLoading(true);
    setVision(''); setImageUrl('');

    try {
      // 1️⃣ Vision
      const res = await fetch('/api/generateManifesto', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers })
      });
      const data = await res.json();
      setVision(data.vision || '⚠️ No vision generated.');

      // 2️⃣ Image
const imagePrompt = `
A hopeful, futuristic illustration of life in the UK in 2050.
Show people, places, and technologies that reflect values like equality, sustainability, and innovation. Make it realistic, inspiring, and detailed.
`;
      const imgRes  = await fetch('/api/generateImage', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: imagePrompt })
      });
      const imgData = await imgRes.json();
      setImageUrl(imgData.url || '');
    } catch (err) {
      console.error(err); setVision('⚠️ Error generating vision.');
    } finally { setLoading(false); }
  };

  /* ─── Follow-up pipeline ─────────────────────────────────────── */
  const askFollowUps = async (target) => {
    setLoading(true); setMode(target);
    try {
      const res = await fetch('/api/getFollowUpQuestions', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers })
      });
      const data = await res.json();
      setFollowUpQs(data.questions || []); setFollowUpAnswers({});
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const submitFollowUpAnswers = async () => {
    setLoading(true);
    const extra = Object.values(followUpAnswers).join(' ');

    try {
      if (mode === 'refineVision') {
        const res  = await fetch('/api/generateManifesto', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ answers, extraInfo: extra, mode: 'refine' })
        });
        const data = await res.json();
        setVision(data.vision || '⚠️ No refined vision generated.');

const paragraphs = (data.vision || '').split('\n').filter(p => p.trim());
setEditableVision(paragraphs);
setIsEditing(paragraphs.map(() => false));
      }

      if (mode === 'regenerateImage') {
        const prompt = `
          Illustration of the UK in 2050:
          Themes: ${selectedThemes.join(', ')}
          Answers: ${Object.values(answers).join(', ')}
          Extra: ${extra}
        `;
        const res  = await fetch('/api/generateImage', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt })
        });
        const data = await res.json();
        setImageUrl(data.url || '');
      }
      setFollowUpQs([]); setFollowUpAnswers({}); setMode(null);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  /* ─── Derived data ───────────────────────────────────────────── */
  const selectedQs = selectedThemes.flatMap(t => questions[t] || []);

  /* ─── Render ─────────────────────────────────────────────────── */
  return (
    <div className="app">
      <h1>CivicHorizon: Envision the UK in 2050</h1>

      {/* Theme selector */}
      <div className="theme-selector">
        <p>Select 1–5 themes to explore:</p>
        {Object.keys(questions).map(theme => (
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

      {/* Q&A input */}
      {selectedQs.length > 0 && (
        <div className="qa-section">
          {selectedQs.map((q, i) => (
            <div key={i} className="question-block">
              <label><strong>{q}</strong></label>
              <textarea
                value={answers[q] || ''}
                onChange={e => handleAnswer(q, e.target.value)}
                placeholder="Your answer…"
              />
            </div>
          ))}
          <button onClick={generate} disabled={loading}>
            {loading ? 'Generating…' : 'Generate Vision'}
          </button>
        </div>
      )}

      {/* Vision output */}
      {vision && (
        <div className="card output">
          <h2>🌍 Vision for 2050</h2>
          <button onClick={() => downloadAsPDF(vision, imageUrl)}>
            📄 Download as PDF
          </button>

          <div
            dangerouslySetInnerHTML={{
              __html: vision.replace(/\n/g, '<br />')
            }}
          />

          <div className="feedback-buttons">
            <button onClick={() => askFollowUps('refineVision')}>
              🔁 Refine Vision
            </button>
            <button onClick={() => askFollowUps('regenerateImage')}>
              🎨 Regenerate Image
            </button>
          </div>
        </div>
      )}

      {/* Image output */}
      {imageUrl && (
        <div className="card output">
          <h2>🎨 Visual Representation</h2>
          <img src={imageUrl} alt="Generated vision" />
        </div>
      )}

      {/* Follow-up questions */}
      {followUpQs.length > 0 && (
        <div className="card output">
          <h3>📝 Please answer a few follow-up questions:</h3>
          {followUpQs.map((q, i) => (
            <div key={i} className="question-block">
              <label>{q}</label>
              <textarea
                value={followUpAnswers[q] || ''}
                onChange={e =>
                  setFollowUpAnswers(prev => ({ ...prev, [q]: e.target.value }))
                }
              />
            </div>
          ))}
          <button onClick={submitFollowUpAnswers}>Continue</button>
        </div>
      )}
    </div>
  );
}
