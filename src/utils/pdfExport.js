import jsPDF from 'jspdf';

// PDF Export with improved visuals (optional image supported)
export async function downloadAsPDF(
  title,
  summary,
  headings = [],
  paragraphs = [],
  imageDataUrl = '',
  authorName = ''
) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const left = 15;
  const right = pageW - 15;
  const maxY = 280;

  let y = 20;

  // 🎨 Cover title bar
  doc.setFillColor(255, 54, 94); // #FF365E
  doc.rect(0, 0, pageW, 30, 'F');
  doc.setFontSize(18);
  doc.setTextColor(255);
  doc.text(title || 'Vision for 2050', pageW / 2, 18, { align: 'center' });
  doc.setTextColor(40);
  y = 40;

  // ✍️ Summary section
  if (summary) {
    doc.setFontSize(13);
    doc.setFont(undefined, 'bold');
    doc.text('Summary', left, y);
    y += 7;

    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    const lines = doc.splitTextToSize(summary, right - left);
    for (const line of lines) {
      if (y > maxY) doc.addPage(), y = 20;
      doc.text(line, left, y);
      y += 5;
    }

    y += 6;
  }

  // 📚 Sectioned content
  doc.setFontSize(12);
  for (let i = 0; i < headings.length; i++) {
    if (y > maxY) doc.addPage(), y = 20;

    // Heading
    doc.setFont(undefined, 'bold');
    doc.text(headings[i] || `Section ${i + 1}`, left, y);
    y += 6;

    // Paragraph
    doc.setFont(undefined, 'normal');
    const paraLines = doc.splitTextToSize(paragraphs[i] || '', right - left);
    for (const line of paraLines) {
      if (y > maxY) doc.addPage(), y = 20;
      doc.text(line, left, y);
      y += 5;
    }

    // Divider
    y += 4;
    doc.setDrawColor(200);
    doc.line(left, y, right, y);
    y += 6;
  }

  // 🖼️ Optional image (if valid base64)
  if (imageDataUrl && imageDataUrl.startsWith('data:image/')) {
    if (y > 200) doc.addPage(), y = 20;
    const imgWidth = 140;
    const imgHeight = 80;
    const x = (pageW - imgWidth) / 2;

    doc.setFont(undefined, 'bold');
    doc.setFontSize(12);
    doc.text('Visual Representation', pageW / 2, y, { align: 'center' });
    y += 6;

    try {
      doc.addImage(imageDataUrl, 'JPEG', x, y, imgWidth, imgHeight);
      y += imgHeight + 10;
    } catch (err) {
      console.warn('⚠️ Failed to add image to PDF:', err);
    }
  }

  // 👤 Author credit
  if (authorName) {
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Created by: ${authorName}`, pageW - 15, 290, { align: 'right' });
  }

  // 🕓 Footer
  const today = new Date().toLocaleDateString();
  doc.setFontSize(9);
  doc.setTextColor(150);
  doc.text(`Generated on ${today} — CivicHorizon`, left, 290);

  doc.save('vision-2050.pdf');
}

// 🔄 Convert image URL to base64
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
        const dataUrl = canvas.toDataURL('image/jpeg');
        resolve(dataUrl);
      } catch (err) {
        reject(err);
      }
    };

    img.onerror = reject;
    img.src = url;
  });
}
