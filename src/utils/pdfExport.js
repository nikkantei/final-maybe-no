// utils/pdfExport.js
import jsPDF from 'jspdf';

export function downloadAsPDF(title, headings, paragraphs, imageUrl) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const left   = 15;          // left margin
  const right  = pageW - 15;  // right margin
  const maxY   = 280;         // bottom margin (slightly above 297‑20)

  let y = 20;

  /* ── Title ─────────────────────────────── */
  doc.setFontSize(18);
  doc.setTextColor(40);
  doc.text(title || 'Vision for 2050', pageW / 2, y, { align: 'center' });
  y += 12;

  /* ── Body (headings + paragraphs) ──────── */
  doc.setFontSize(13);

  headings.forEach((h, idx) => {
    if (y > maxY) { doc.addPage(); y = 20; }

    // Heading
    doc.setFont(undefined, 'bold');
    doc.text(h || `Section ${idx + 1}`, left, y);
    y += 7;

    // Paragraph (auto‑wrap)
    doc.setFont(undefined, 'normal');
    const wrapped = doc.splitTextToSize(paragraphs[idx] || '', right - left);
    wrapped.forEach(line => {
      if (y > maxY) { doc.addPage(); y = 20; }
      doc.text(line, left, y);
      y += 7;
    });

    y += 4; // extra gap between sections
  });

  /* ── Image (optional) ───────────────────── */
  if (imageUrl) {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageUrl;

    img.onload = () => {
      const maxW = 160;
      const imgW = Math.min(maxW, img.width * 0.2646);           // px → mm
      const imgH = (img.height / img.width) * imgW;

      if (y + imgH > maxY) { doc.addPage(); y = 20; }
      doc.addImage(img, 'JPEG', (pageW - imgW) / 2, y, imgW, imgH);
      doc.save('vision-2050.pdf');
    };

    img.onerror = () => {
      console.warn('Image failed to load; saving PDF without it.');
      doc.save('vision-2050.pdf');
    };
  } else {
    doc.save('vision-2050.pdf');
  }
}
