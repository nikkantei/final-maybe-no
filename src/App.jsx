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

  const questions = { /* same as before */ };
  const descriptions = { /* same as before */ };

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
      {/* ...existing UI layout above */}

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

      {/* Replace the old Refine and Regenerate buttons */}
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

      {/* ...rest of layout below */}
    </div>
  );
}
