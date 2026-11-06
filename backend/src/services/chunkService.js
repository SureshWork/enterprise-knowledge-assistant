const CHUNK_SIZE = Number(process.env.CHUNK_SIZE) || 1000;
const CHUNK_OVERLAP = Number(process.env.CHUNK_OVERLAP) || 200;

export const createChunks = (pages, documentId, fileName) => {
  const chunks = [];

  let chunkIndex = 0;

  for (const page of pages) {
    const text = page.text;

    let start = 0;

    while (start < text.length) {
      let end = Math.min(start + CHUNK_SIZE, text.length);

      // Prefer ending at a word boundary
      if (end < text.length) {
        const boundary = text.lastIndexOf(" ", end);

        if (boundary > start) {
          end = boundary;
        }
      }

      const chunkText = text.slice(start, end).trim();

      if (chunkText) {
        chunks.push({
          chunkId: `${documentId}_${chunkIndex}`,
          documentId,
          fileName,
          pageNumber: page.pageNumber,
          chunkIndex,
          text: chunkText
        });

        chunkIndex++;
      }

      if (end >= text.length) {
        break;
      }

      start = Math.max(end - CHUNK_OVERLAP, start + 1);
    }
  }

  return chunks;
};