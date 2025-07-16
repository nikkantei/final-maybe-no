import jsPDF from 'jspdf';

export async function downloadAsPDF(title, summary, headings = [], paragraphs = [], imageDataUrl = '') {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const left = 15;
  const right = pageW - 15;
  const maxY = 280;

  let y = 20;

  // Title
  doc.setFontSize(18);
  doc.setTextColor(40);
  doc.text(title || 'Vision for 2050', pageW / 2, y, { align: 'center' });
  y += 12;

  // Summary
  if (summary) {
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Summary', left, y);
    y += 7;

    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    const summaryLines = doc.splitTextToSize(summary, right - left);
    for (const line of summaryLines) {
      if (y > maxY) { doc.addPage(); y = 20; }
      doc.text(line, left, y);
      y += 7;
    }

    y += 4;
  }

  // Main Content
  doc.setFontSize(13);
  headings.forEach((h, idx) => {
    const heading = h || `Section ${idx + 1}`;
    const paragraph = paragraphs[idx] || '';

    if (y > maxY) { doc.addPage(); y = 20; }

    // Heading
    doc.setFont(undefined, 'bold');
    doc.text(heading, left, y);
    y += 7;

    // Paragraph
    doc.setFont(undefined, 'normal');
    const lines = doc.splitTextToSize(paragraph, right - left);
    for (const line of lines) {
      if (y > maxY) { doc.addPage(); y = 20; }
      doc.text(line, left, y);
      y += 7;
    }

    y += 4;
  });

  // Skip image for now (add later once text works)

  doc.save('vision-2050.pdf');
}
