import jsPDF from 'jspdf';

// Export PDF
export async function downloadAsPDF(title, summary, headings = [], paragraphs = [], imageDataUrl = '', authorName = '') {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const left = 12;
  const right = pageW - 12;
  const maxY = 280;

  let y = 18;

  // Title
  doc.setFontSize(16);
  doc.setTextColor(40);
  doc.text(title || 'Vision for 2050', pageW / 2, y, { align: 'center' });
  y += 10;

  // Summary
  if (summary) {
    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.text('Summary', left, y);
    y += 6;

    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    const summaryLines = doc.splitTextToSize(summary, right - left);
    for (const line of summaryLines) {
      doc.text(line, left, y);
      y += 5;
    }

    y += 3;
  }

  // Content
  doc.setFontSize(11);
  headings.forEach((h, idx) => {
    const heading = h || `Section ${idx + 1}`;
    const paragraph = paragraphs[idx] || '';

    doc.setFont(undefined, 'bold');
    doc.text(heading, left, y);
    y += 6;

    doc.setFont(undefined, 'normal');
    const lines = doc.splitTextToSize(paragraph, right - left);
    for (const line of lines) {
      doc.text(line, left, y);
      y += 5;
      if (y > maxY - 40) break; // Leave space for image
    }

    y += 4;
    if (y > maxY - 40) return; // Stop if space is tight
  });

  // Image
  if (imageDataUrl?.startsWith('data:image')) {
    const imgW = 60;
    const imgH = 45;

    if (y + imgH > maxY) {
      y = maxY - imgH;
    }

    try {
      doc.addImage(imageDataUrl, 'JPEG', (pageW - imgW) / 2, y, imgW, imgH);
      y += imgH + 4;
    } catch (err) {
      console.warn('⚠️ Failed to add image:', err);
    }
  } else {
    console.warn('⚠️ Skipping image – not a valid base64 data URL:', imageDataUrl?.slice(0, 30));
  }

  // Author name (if provided)
  if (authorName) {
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Created by: ${authorName}`, pageW - 15, 290, { align: 'right' });
  }

  doc.save('vision-2050.pdf');
}

// Helper: Convert image URL to base64 Data URL
export function loadImageAsDataURL(url) {
  return new Promise((resolve, reject) => {
    if (!url) {
      console.error('❌ No image URL provided to convert');
      reject(new Error('No image URL'));
      return;
    }

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
        console.log('✅ Image successfully converted to base64');
        resolve(dataUrl);
      } catch (err) {
        console.error('❌ Image conversion failed:', err);
        reject(err);
      }
    };

    img.onerror = (e) => {
      console.error('❌ Image failed to load:', e, url);
      reject(e);
    };

    img.src = url;
  });
}
