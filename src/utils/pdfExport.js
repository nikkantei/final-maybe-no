import jsPDF from 'jspdf';

// Minimal version — no summary, no image
export async function downloadAsPDF(title) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  doc.setFontSize(18);
  doc.setTextColor(40);
  doc.text(title || 'Vision for 2050', 105, 20, { align: 'center' });

  doc.setFontSize(12);
  doc.text('✅ PDF generation works. This is a test export.', 15, 40);

  doc.save('vision-2050.pdf');
}
