// utils/pdfExport.js
import jsPDF from "jspdf";

/**
 * Creates a multi-page PDF that contains:
 *  • the generated image (scaled to fit)
 *  • the complete vision text (wrapped & paginated)
 *
 * @param {string} visionText – plain-text vision
 * @param {string} imageUrl  – data-URL or remote URL to the generated image
 */
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

  /* ─── 1. IMAGE ─────────────────────────────────────────────────────────── */
  if (imageUrl) {
    // Reserve a fixed  seed height (200 pt) – tweak if you need larger images.
    const imgHeight = 200;
    const imgWidth  = pageWidth - margin * 2;

    // addImage(src, format, x, y, w, h)
    doc.addImage(imageUrl, "JPEG", margin, cursorY, imgWidth, imgHeight);

    cursorY += imgHeight + 20;           // 20 pt spacing below the image
  }

  /* ─── 2. VISION TEXT (wrapped & paginated) ─────────────────────────────── */
  const maxLineWidth = pageWidth - margin * 2;
  const lineHeight   = 18;               // line spacing in pt

  const lines = doc
    .setFont("Times", "Normal")
    .setFontSize(12)
    .splitTextToSize(visionText, maxLineWidth);

  lines.forEach(line => {
    /* add a new page if we’re about to run off the bottom margin */
    if (cursorY + lineHeight > pageHeight - margin) {
      doc.addPage();
      cursorY = margin;
    }
    doc.text(line, margin, cursorY);
    cursorY += lineHeight;
  });

  /* ─── 3. SAVE ──────────────────────────────────────────────────────────── */
  doc.save("vision-2050.pdf");
}
