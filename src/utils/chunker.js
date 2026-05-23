function chunkText(text, chunkSize = 500, overlap = 50) {
  if (!text || text.trim().length === 0) return [];

  const chunks = [];
  let start = 0;

  while (start < text.length) {
    let end = start + chunkSize;

    if (end < text.length) {
      let breakPoint = end;
      for (let i = end; i > end - overlap && i > start; i--) {
        if (/[。！？\n\r！？.!?]/.test(text[i])) {
          breakPoint = i + 1;
          break;
        }
      }
      end = breakPoint;
    }

    end = Math.min(end, text.length);
    const chunk = text.substring(start, end).trim();
    if (chunk.length > 0) {
      chunks.push(chunk);
    }

    if (end >= text.length) break;

    const prevStart = start;
    start = end - overlap;
    if (start <= prevStart) break;
  }

  return chunks;
}

module.exports = { chunkText };
