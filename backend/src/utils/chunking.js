// src/utils/chunking.js (ESM)
export function chunkText(text, chunkSize = 1000) {
  // Chunk by character length or approximate tokens.
  // For a more token-accurate approach, you’d need a tokenizer.
  const chunks = [];
  let start = 0;

  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    chunks.push(text.slice(start, end));
    start = end;
  }

  return chunks;
}
