import jsPDF from 'jspdf';

export function downloadAsPDF(content, filename = "CivicHorizon_Vision.pdf") {
  const doc = new jsPDF();
  const margin = 15;
  const lineHeight = 10;
  const maxLineWidth = 180;
  const lines = doc.splitTextToSize(content, maxLineWidth);
  let cursorY = 20;

  lines.forEach((line) => {
    if (cursorY + lineHeight > doc.internal.pageSize.height - margin) {
      doc.addPage();
      cursorY = margin;
    }
    doc.text(line, margin, cursorY);
    cursorY += lineHeight;
  });

  doc.save(filename);
}
