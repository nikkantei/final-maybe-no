import jsPDF from 'jspdf';

export function downloadAsPDF(content, filename = "CivicHorizon_Vision.pdf") {
  const doc = new jsPDF();
  const lines = doc.splitTextToSize(content, 180); // 180 = width
  doc.text(lines, 15, 20);
  doc.save(filename);
}
