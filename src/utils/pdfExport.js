import jsPDF from "jspdf";

export function downloadAsPDF(visionText, imageUrl = "") {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: "a4"
  });

  const pageWidth  = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin     = 40;
  let cursorY      = margin;

  // Add image (only if it's valid)
  const imgWidth = pageWidth - margin * 2;
  const imgHeight = 200;

  if (
    imageUrl &&
    (imageUrl.startsWith('data:image') || imageUrl.startsWith('http'))
  ) {
    try {
      doc.addImage(imageUrl, "JPEG", margin, cursorY, imgWidth, imgHeight);
      cursorY += imgHeight + 20;
    } catch (err) {
      console.error("Image could not be added to PDF:", err);
    }
  }

  // Add wrapped text with page breaks
  const lineHeight = 20;
  const lines = doc.splitTextToSize(visionText, pageWidth - 2 * margin);

  lines.forEach(line => {
    if (cursorY + lineHeight > pageHeight - margin) {
      doc.addPage();
      cursorY = margin;
    }
    doc.text(line, margin, cursorY);
    cursorY += lineHeight;
  });

  doc.save("vision-2050.pdf");
}
