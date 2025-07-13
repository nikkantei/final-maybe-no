import jsPDF from 'jspdf';

export function downloadAsPDF(title, headings, paragraphs, imageUrl) {
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

  // Body
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

  // Image handling with async logic
  if (imageUrl) {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageUrl;

    img.onload = () => {
      const maxW = 160;
      const imgW = Math.min(maxW, img.width * 0.2646); // px → mm
      const imgH = (img.height / img.width) * imgW;

      if (y + imgH > maxY) { doc.addPage(); y = 20; }

      doc.addImage(img, 'JPEG', (pageW - imgW) / 2, y, imgW, imgH);
      doc.save('vision-2050.pdf');
    };

    img.onerror = () => {
      console.warn('⚠️ Image failed to load. Saving without image.');
      doc.save('vision-2050.pdf');
    };

    // Fallback: If image never loads in 5 sec
    setTimeout(() => {
      console.warn('⏱️ Image load timeout. Saving without image.');
      doc.save('vision-2050.pdf');
    }, 5000);
  } else {
    doc.save('vision-2050.pdf');
  }
}
