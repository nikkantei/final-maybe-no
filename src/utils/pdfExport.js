// utils/pdfExport.js
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
    for (const line of lines) {
      if (y > maxY) doc.addPage(), y = 20;
      doc.text(line, left, y);
      y += 5;
    }

    y += 4;
  }

  // Headings + Paragraphs
  doc.setFontSize(11);
  for (let i = 0; i < headings.length; i++) {
    if (y > maxY) doc.addPage(), y = 20;

    doc.setFont(undefined, 'bold');
    doc.text(headings[i] || `Section ${i + 1}`, left, y);
    y += 6;

    doc.setFont(undefined, 'normal');
    const paraLines = doc.splitTextToSize(paragraphs[i] || '', right - left);
    for (const line of paraLines) {
      if (y > maxY) doc.addPage(), y = 20;
      doc.text(line, left, y);
      y += 5;
    }

    y += 4;
  }

  // Optional image — only if valid
  if (imageDataUrl && imageDataUrl.startsWith('data:image/')) {
    if (y > 200) doc.addPage(), y = 20;

    const imgWidth = 140;
    const imgHeight = 80;
    const x = (pageW - imgWidth) / 2;

    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('Visual Representation', pageW / 2, y, { align: 'center' });
    y += 6;

    try {
      doc.addImage(imageDataUrl, 'JPEG', x, y, imgWidth, imgHeight);
      y += imgHeight + 10;
    } catch (err) {
      console.warn('⚠️ Failed to add image to PDF:', err);
    }
  }

  // Author
  if (authorName) {
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Created by: ${authorName}`, pageW - 15, 290, { align: 'right' });
  }

  doc.save('vision-2050.pdf');
}

// Image loader
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
        canvas.getContext('2d').drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/jpeg'));
      } catch (err) {
        reject(err);
      }
    };
    img.onerror = reject;
    img.src = url;
  });
}
