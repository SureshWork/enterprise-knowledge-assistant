import { ollamaClient, EMBEDDING_MODEL } from "../config/ollama.js";

export const generateEmbeddings = async (texts) => {
  try {
    const response = await ollamaClient.embed({
      model: EMBEDDING_MODEL,
      input: texts
    });

    if (!response.embeddings ||
        response.embeddings.length !== texts.length) {
      throw new Error("Embedding count does not match input count");
    }

    return response.embeddings;

  } catch (error) {
    console.error("Embedding generation error:", error.message);
    throw error;
  }
};