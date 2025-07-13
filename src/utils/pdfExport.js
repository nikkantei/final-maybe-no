import jsPDF from 'jspdf';

export function downloadAsPDF(headings = [], paragraphs = [], imageUrl = '') {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 20;

  // Add title
  doc.setFontSize(18);
  doc.setTextColor(40);
  doc.text('Vision for 2050', pageWidth / 2, y, { align: 'center' });
  y += 10;

  // Add vision with headings
  doc.setFontSize(12);
  for (let i = 0; i < paragraphs.length; i++) {
    if (headings[i]) {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.setFont(undefined, 'bold');
      doc.text(headings[i], 15, y);
      y += 7;
    }

    const lines = doc.splitTextToSize(paragraphs[i], pageWidth - 30);
    doc.setFont(undefined, 'normal');
    for (let line of lines) {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.text(line, 15, y);
      y += 7;
    }

    y += 5;
  }

  // Add image if available
  if (imageUrl) {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageUrl;

    img.onload = () => {
      const imgWidth = 160;
      const imgHeight = (img.height / img.width) * imgWidth;
      if (y + imgHeight > 280) {
        doc.addPage();
        y = 20;
      }
      doc.addImage(img, 'JPEG', (pageWidth - imgWidth) / 2, y, imgWidth, imgHeight);
      doc.save('vision-2050.pdf');
    };

    img.onerror = () => {
      console.warn('Image failed to load. Saving PDF without image.');
      doc.save('vision-2050.pdf');
    };
  } else {
    doc.save('vision-2050.pdf');
  }
}
