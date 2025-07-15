import React, { useState } from 'react';
import { downloadAsPDF, loadImageAsDataURL } from './utils/pdfExport';
import './styles.css';

export default function App() {
  const [selectedThemes, setSelectedThemes] = useState([]);
  const [answers, setAnswers] = useState({});
  const [vision, setVision] = useState('');
  const [summary, setSummary] = useState('');
  const [visionTitle, setVisionTitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [editableVision, setEditableVision] = useState([]);
  const [editableHeadings, setEditableHeadings] = useState([]);
  const [isEditing, setIsEditing] = useState([]);
  const [showIntro, setShowIntro] = useState(true);
  const [followUpQs, setFollowUpQs] = useState([]);
  const [followUpAnswers, setFollowUpAnswers] = useState({});
  const [showFollowUpForm, setShowFollowUpForm] = useState(false);
  const [nextAction, setNextAction] = useState(null);
  const [imageCaption, setImageCaption] = useState('');


  const questions = {
    politics: ['What values should guide political leadership in 2050?', 'What should participation look like in a future democracy?', 'What power should citizens hold?'],
    economy: ['What does a fair economy look like in 2050?', 'How is wealth distributed?', 'What role does work play in society?'],
    society: ['How do communities support each other in 2050?', 'What inequalities have been solved?', 'What does social justice look like?'],
    technology: ['What technologies are essential in 2050?', 'How is technology governed?', 'What is the relationship between AI and society?'],
    law: ['What rights are most important in 2050?', 'How is justice maintained?', 'What laws protect future generations?'],
    environment: ['What does sustainability mean in 2050?', 'How are natural resources managed?', 'What environmental challenges have we overcome?']
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
    setImageUrl('');
    setSummary('');
    setVisionTitle('');
    setShowFollowUpForm(false);

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

      const imageRes = await fetch('/api/generateImage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visionText: data.vision || '' })
      });

      const imageData = await imageRes.json();
      setImageUrl(imageData.url || '');
      setImageCaption(imageData.caption || ''); 
    } catch (err) {
      console.error(err);
      setVision('⚠️ Error generating vision.');
    } finally {
      setLoading(false);
    }
  };

const fetchFollowUpQuestions = async () => {
  if (!Object.keys(answers).length) {
    alert('⚠️ No original answers found. Please answer at least one question before refining.');
    return;
  }

  try {
    const res = await fetch('/api/getFollowUpQuestions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers })
    });

    if (!res.ok) throw new Error(`Server returned status ${res.status}`);

    const data = await res.json();
    if (!data.questions || !Array.isArray(data.questions)) {
      throw new Error('Invalid response format from follow-up API');
    }

    setFollowUpQs(data.questions);
    setShowFollowUpForm(true);
  } catch (err) {
    console.error('Failed to fetch follow-up questions:', err);
    alert('⚠️ Could not load follow-up questions. Please try again later.');
  }
};


  const proceedWithFollowUps = async () => {
    setLoading(true);
    setShowFollowUpForm(false);
    const extraInfo = Object.values(followUpAnswers).join(' ');

    try {
      if (nextAction === 'refine') {
        const res = await fetch('/api/generateManifesto', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ answers, extraInfo, mode: 'refine' })
        });
        const data = await res.json();
        setVision(data.vision || '');
        setSummary(data.summary || '');
        setVisionTitle(data.title || '');
        const { headings, paragraphs } = parseVisionWithHeadings(data.vision || '');
        setEditableVision(paragraphs);
        setEditableHeadings(headings);
        setIsEditing(paragraphs.map(() => false));
      } else if (nextAction === 'image') {
const keyParagraph =
  editableVision.find(p => p.length > 100 && !p.toLowerCase().includes('heading')) ||
  editableVision[0];

const res = await fetch('/api/generateImage', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ visionText: keyParagraph })
});
const data = await res.json();
setImageUrl(data.url || '');
setImageCaption(data.caption || '');


      }
    } catch (err) {
      console.error('Follow-up execution failed:', err);
    } finally {
      setLoading(false);
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
          <h1 className="page-title">CivicHorizon: Envision the UK in 2050</h1>

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
              <p>✨ The Ministry for the Future is drafting a vision for you...</p>
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
<textarea
  className="summary-text"
  value={summary}
  onChange={(e) => setSummary(e.target.value)}
  placeholder="Summary of your vision..."
  style={{
    width: '100%',
    padding: '10px',
    fontSize: '1em',
    borderRadius: '8px',
    border: '1px solid #ccc',
    marginTop: '10px'
  }}
/>
            </div>
          )}

          {vision && (
            <div className="card output">
              <h2>🌍 Vision for 2050</h2>
<button onClick={async () => {
  try {
    const imageDataUrl = await loadImageAsDataURL(imageUrl); // Convert to base64
    await downloadAsPDF(visionTitle, summary, editableHeadings, editableVision, imageDataUrl);
  } catch (err) {
    console.error('❌ Failed to download PDF:', err);
    alert('Failed to generate PDF. Please try again.');
  }
}}>
  📄 Download as PDF
</button>

<div className="email-section" style={{ marginTop: '16px' }}>
  <input
    type="email"
    placeholder="Your email address"
    value={email}
    onChange={e => setEmail(e.target.value)}
    style={{
      padding: '8px',
      width: '60%',
      marginRight: '8px',
      border: '1px solid #ccc',
      borderRadius: '4px'
    }}
  />
  <button
    onClick={async () => {
      try {
        await fetch('/api/sendEmail', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: email,
            subject: 'Your Vision for 2050',
            visionTitle,
            summary,
            headings: editableHeadings,
            paragraphs: editableVision,
            imageUrl
          })
        });
        alert('✅ Email sent successfully!');
      } catch (err) {
        console.error(err);
        alert('❌ Failed to send email.');
      }
    }}
    style={{
      padding: '8px 12px',
      backgroundColor: '#FF365E',
      color: 'white',
      border: 'none',
      borderRadius: '4px'
    }}
  >
    📧 Send to Email
  </button>
</div>

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

              <div className="feedback-buttons">
                <button onClick={() => { setNextAction('refine'); fetchFollowUpQuestions(); }}>
                  🔁 Refine Vision
                </button>
                <button onClick={() => { setNextAction('image'); fetchFollowUpQuestions(); }}>
                  🎨 Regenerate Image
                </button>
              </div>
            </div>
          )}

  {imageUrl && (
  <div className="card output">
    <h2>🎨 Visual Representation</h2>
    <img src={imageUrl} alt="Generated vision" />
{imageCaption && (
  <p className="image-caption">
    {imageCaption.length > 100 ? imageCaption.slice(0, 100) + '…' : imageCaption}
  </p>
)}

  </div>
)}


        </>
      )}
    </div>
  );
}
