import ollama from "ollama";
import dotenv from "dotenv";

dotenv.config();

export const ollamaClient = ollama;

export const LLM_MODEL =
  process.env.LLM_MODEL || "llama3.2:3b";

export const EMBEDDING_MODEL =
  process.env.EMBEDDING_MODEL || "embeddinggemma";

// Generate embeddings
export const generateEmbedding = async (text) => {
  try {
    const response = await ollamaClient.embed({
      model: EMBEDDING_MODEL,
      input: text
    });

    return response.embeddings[0];

  } catch (error) {
    console.error("Embedding generation failed:", error.message);
    throw error;
  }
};

// Generate AI response
export const generateAnswer = async (messages) => {
  try {
    const response = await ollamaClient.chat({
		model: LLM_MODEL,
		messages,
		stream: false,
		options: {
			temperature: 0.1
		}
	});

    return response.message.content;

  } catch (error) {
    console.error("LLM generation failed:", error.message);
    throw error;
  }
};