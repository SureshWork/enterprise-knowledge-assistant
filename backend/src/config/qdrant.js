import { QdrantClient } from "@qdrant/js-client-rest";
import dotenv from "dotenv";

dotenv.config();

export const COLLECTION_NAME =
  process.env.QDRANT_COLLECTION || "enterprise_documents";

export const qdrantClient = new QdrantClient({
  url: process.env.QDRANT_URL || "http://localhost:6333"
});

export const initializeQdrant = async () => {
  try {
    const collections = await qdrantClient.getCollections();

    const exists = collections.collections.some(
      collection => collection.name === COLLECTION_NAME
    );

    if (!exists) {
      await qdrantClient.createCollection(COLLECTION_NAME, {
        vectors: {
          size: 768,
          distance: "Cosine"
        }
      });

      console.log("Qdrant collection created:", COLLECTION_NAME);
    } else {
      console.log("Qdrant collection already exists");
    }

  } catch (error) {
    console.error("Qdrant initialization failed:", error.message);
    throw error;
  }
};