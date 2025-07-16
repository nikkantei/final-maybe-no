// src/App.jsx
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
  const [authorName, setAuthorName] = useState('');

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
      {/* ... intro, questions, and other UI ... */}

      {vision && (
        <div className="card output">
          <h2>🌍 Vision for 2050</h2>
          <button onClick={async () => {
            try {
           console.log('📸 imageUrl before conversion:', imageUrl);
if (!imageUrl) {
  console.warn('⚠️ No imageUrl provided!');
} else if (!imageUrl.startsWith('http')) {
  console.warn('⚠️ imageUrl is not a valid http(s) URL:', imageUrl);
}


              const imageDataUrl = imageUrl ? await loadImageAsDataURL(imageUrl) : '';
              await downloadAsPDF(
                visionTitle || 'Vision for 2050',
                summary || 'No summary provided.',
                editableHeadings || [],
                editableVision || [],
                imageDataUrl,
                authorName || ''
              );
            } catch (err) {
              console.error('❌ Failed to download PDF:', err);
              alert('Failed to generate PDF. Please try again.');
            }
          }}>
            📄 Download as PDF
          </button>

          {/* rest of vision section... */}
        </div>
      )}
    </div>
  );
}

