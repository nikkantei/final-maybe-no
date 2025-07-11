import jsPDF from 'jspdf';

export function downloadAsPDF(vision, imageUrl) {
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

  // Add vision text with auto line wrapping
  doc.setFontSize(12);
  const lines = doc.splitTextToSize(vision, pageWidth - 30);
  lines.forEach(line => {
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
    doc.text(line, 15, y);
    y += 7;
  });

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
  } else {
    doc.save('vision-2050.pdf');
  }
}
