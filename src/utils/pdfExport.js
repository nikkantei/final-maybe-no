import jsPDF from 'jspdf';

export async function downloadAsPDF(title, summary, headings, paragraphs, imageDataUrl) {
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
    summaryLines.forEach(line => {
      if (y > maxY) { doc.addPage(); y = 20; }
      doc.text(line, left, y);
      y += 7;
    });

    y += 4;
  }

  // Main content
  doc.setFontSize(13);
  headings.forEach((h, idx) => {
    if (y > maxY) { doc.addPage(); y = 20; }

    doc.setFont(undefined, 'bold');
    doc.text(h || `Section ${idx + 1}`, left, y);
    y += 7;

    doc.setFont(undefined, 'normal');
    const wrapped = doc.splitTextToSize(paragraphs[idx] || '', right - left);
    wrapped.forEach(line => {
      if (y > maxY) { doc.addPage(); y = 20; }
      doc.text(line, left, y);
      y += 7;
    });

    y += 4;
  });

  // Image (if available) — no loading or size calculation
  if (imageDataUrl?.startsWith('data:image')) {
    if (y > maxY - 60) {
      doc.addPage();
      y = 20;
    }

    const imgW = 80;
    const imgH = 60;
    doc.addImage(imageDataUrl, 'JPEG', (pageW - imgW) / 2, y, imgW, imgH);
  }

  doc.save('vision-2050.pdf');
}

// Convert remote image URL to data URL
export function loadImageAsDataURL(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL('image/jpeg'));
    };
    img.onerror = reject;
    img.src = url;
  });
}
