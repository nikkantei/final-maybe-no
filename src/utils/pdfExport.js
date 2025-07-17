import jsPDF from 'jspdf';

export async function downloadAsPDF(title, summary, headings = [], paragraphs = [], imageDataUrl = '', authorName = '') {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const left = 12;
  const right = pageW - 12;
  const maxY = 280;

  let y = 20;

  // Title
  doc.setFontSize(16);
  doc.text(title || 'Vision for 2050', pageW / 2, y, { align: 'center' });
  y += 10;

  // Summary
  if (summary) {
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('Summary', left, y);
    y += 6;

    doc.setFont(undefined, 'normal');
    const lines = doc.splitTextToSize(summary, right - left);
    lines.forEach(line => {
      doc.text(line, left, y);
      y += 5;
    });

    y += 4;
  }

  // Headings + Paragraphs
  doc.setFontSize(11);
  headings.forEach((heading, idx) => {
    if (y > maxY) doc.addPage(), y = 20;

    doc.setFont(undefined, 'bold');
    doc.text(heading || `Section ${idx + 1}`, left, y);
    y += 6;

    doc.setFont(undefined, 'normal');
    const paraLines = doc.splitTextToSize(paragraphs[idx] || '', right - left);
    paraLines.forEach(line => {
      if (y > maxY) doc.addPage(), y = 20;
      doc.text(line, left, y);
      y += 5;
    });

    y += 4;
  });

  // Author name
  if (authorName) {
    if (y > 280) doc.addPage(), y = 20;
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Created by: ${authorName}`, pageW - 15, 290, { align: 'right' });
  }

  doc.save('vision-2050.pdf');
}

export function loadImageAsDataURL(url) {
  return new Promise((resolve, reject) => {
    if (!url) return resolve('');
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/jpeg'));
      } catch (err) {
        reject(err);
      }
    };

    img.onerror = reject;
    img.src = url;
  });
}
