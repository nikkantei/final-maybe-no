// ✅ FILE: src/utils/pdfExport.js
import jsPDF from 'jspdf';

// Export PDF (WITHOUT image)
export async function downloadAsPDF(title, summary, headings = [], paragraphs = [], authorName = '') {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const left = 12;
  const right = pageW - 12;
  const maxY = 280;

  let y = 18;

  // Title
  doc.setFontSize(16);
  doc.setTextColor(40);
  doc.text(title || 'Vision for 2050', pageW / 2, y, { align: 'center' });
  y += 10;

  // Summary
  if (summary) {
    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.text('Summary', left, y);
    y += 6;

    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    const summaryLines = doc.splitTextToSize(summary, right - left);
    for (const line of summaryLines) {
      doc.text(line, left, y);
      y += 5;
    }

    y += 3;
  }

  // Content
  doc.setFontSize(11);
  headings.forEach((h, idx) => {
    const heading = h || `Section ${idx + 1}`;
    const paragraph = paragraphs[idx] || '';

    doc.setFont(undefined, 'bold');
    doc.text(heading, left, y);
    y += 6;

    doc.setFont(undefined, 'normal');
    const lines = doc.splitTextToSize(paragraph, right - left);
    for (const line of lines) {
      doc.text(line, left, y);
      y += 5;
      if (y > maxY) return;
    }

    y += 4;
    if (y > maxY) return;
  });

  // Author name (if provided)
  if (authorName) {
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Created by: ${authorName}`, pageW - 15, 290, { align: 'right' });
  }

  doc.save('vision-2050.pdf');
}
