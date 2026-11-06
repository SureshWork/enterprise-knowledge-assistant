
import {
  generateEmbedding,
  generateAnswer
} from "../config/ollama.js";

import { searchVectors } from "./vectorService.js";

import { buildRagMessages } from "./promptService.js";

export const processQuestion = async (question) => {
  try {

    // 1. Generate question embedding
    console.log("Generating question embedding...");

    const questionEmbedding = await generateEmbedding(question);

    // 2. Search relevant document chunks
    console.log("Searching Qdrant...");

    const retrievedChunks = await searchVectors(
      questionEmbedding,
      Number(process.env.TOP_K) || 5
    );

    // 3. Log retrieved chunks
    console.log("\n========== RETRIEVED CHUNKS ==========");

    retrievedChunks.forEach((chunk, index) => {
      console.log(`\nSOURCE ${index + 1}`);
      console.log("File:", chunk.fileName);
      console.log("Document ID:", chunk.documentId);
      console.log("Page:", chunk.pageNumber);
      console.log("Chunk:", chunk.chunkIndex);
      console.log("Score:", chunk.score);
      console.log("Text:", chunk.text);
    });

    console.log("\n======================================\n");

    // 4. Handle empty retrieval
    if (!retrievedChunks.length) {
      return {
        answer: "I could not find this information in the uploaded documents.",
        sources: []
      };
    }

    // 5. Build context and prompt
    console.log("Building document context...");

    const messages = buildRagMessages(
      question,
      retrievedChunks
    );

    // 6. Generate LLM response
    console.log("Generating AI answer...");

    const answer = await generateAnswer(messages);

    // 7. Prepare source citations
    const sources = retrievedChunks.map(chunk => ({
      fileName: chunk.fileName,
      pageNumber: chunk.pageNumber,
      chunkIndex: chunk.chunkIndex,
      score: Number(chunk.score.toFixed(4)),
      documentId: chunk.documentId
    }));

    // 8. Return response
    return {
      answer,
      sources
    };

  } catch (error) {
    console.error("RAG processing error:", error.message);
    throw error;
  }
};
