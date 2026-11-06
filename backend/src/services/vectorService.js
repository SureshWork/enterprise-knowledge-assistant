
import { v4 as uuidv4 } from "uuid";

import {
  qdrantClient,
  COLLECTION_NAME
} from "../config/qdrant.js";

// Store document chunks in Qdrant
export const storeVectors = async (chunks, embeddings) => {
  try {
    if (chunks.length !== embeddings.length) {
      throw new Error("Chunks and embeddings count mismatch");
    }

    const points = chunks.map((chunk, index) => ({
      id: uuidv4(),
      vector: embeddings[index],
      payload: {
        documentId: chunk.documentId,
        fileName: chunk.fileName,
        pageNumber: chunk.pageNumber,
        chunkIndex: chunk.chunkIndex,
        text: chunk.text
      }
    }));

    await qdrantClient.upsert(COLLECTION_NAME, {
      wait: true,
      points
    });

    return points.length;
  } catch (error) {
    console.error("Qdrant storage error:", error.message);
    throw error;
  }
};

// Search relevant chunks and remove duplicate logical chunks
export const searchVectors = async (embedding, limit = 5) => {
  try {
    const results = await qdrantClient.query(COLLECTION_NAME, {
      query: embedding,
      limit,
      with_payload: true
    });

    const uniqueChunks = new Map();

    for (const result of results.points || []) {
      const payload = result.payload || {};
      const key = `${payload.documentId}:${payload.chunkIndex}`;

      const existing = uniqueChunks.get(key);

      if (!existing || result.score > existing.score) {
        uniqueChunks.set(key, {
          score: result.score,
          ...payload
        });
      }
    }

    return Array.from(uniqueChunks.values());
  } catch (error) {
    console.error("Qdrant search error:", error.message);
    throw error;
  }
};

// Get all uploaded documents from Qdrant
export const listDocuments = async () => {
  try {
    const documentsMap = new Map();
    let offset = undefined;

    do {
      const result = await qdrantClient.scroll(
        COLLECTION_NAME,
        {
          limit: 500,
          with_payload: true,
          with_vector: false,
          ...(offset !== undefined ? { offset } : {})
        }
      );

      for (const point of result.points || []) {
        const payload = point.payload || {};

        if (!payload.documentId) continue;

        if (!documentsMap.has(payload.documentId)) {
          documentsMap.set(payload.documentId, {
            documentId: payload.documentId,
            fileName: payload.fileName || "Untitled PDF",
            totalPages: 0,
            chunkIndexes: new Set()
          });
        }

        const document = documentsMap.get(payload.documentId);

        document.totalPages = Math.max(
          document.totalPages,
          Number(payload.pageNumber) || 0
        );

        if (payload.chunkIndex !== undefined) {
          document.chunkIndexes.add(payload.chunkIndex);
        }
      }

      offset = result.next_page_offset;
    } while (offset !== null && offset !== undefined);

    return Array.from(documentsMap.values())
      .map(document => ({
        documentId: document.documentId,
        fileName: document.fileName,
        totalPages: document.totalPages,
        totalChunks: document.chunkIndexes.size
      }))
      .sort((a, b) => a.fileName.localeCompare(b.fileName));

  } catch (error) {
    console.error("List documents error:", error.message);
    throw error;
  }
};

// Delete all vectors belonging to a document
export const deleteDocumentVectors = async (documentId) => {
  await qdrantClient.delete(COLLECTION_NAME, {
    filter: {
      must: [
        {
          key: "documentId",
          match: {
            value: documentId
          }
        }
      ]
    },
    wait: true
  });

  return true;
};

// Delete all document vectors from Qdrant
export const deleteAllDocumentVectors = async () => {
  try {
    const allPointIds = [];
    let offset = undefined;

    do {
      const result = await qdrantClient.scroll(
        COLLECTION_NAME,
        {
          limit: 500,
          with_payload: false,
          with_vector: false,
          ...(offset !== undefined ? { offset } : {})
        }
      );

      result.points.forEach(point => {
        allPointIds.push(point.id);
      });

      offset = result.next_page_offset;
    } while (offset !== null && offset !== undefined);

    for (let i = 0; i < allPointIds.length; i += 500) {
      const batch = allPointIds.slice(i, i + 500);

      await qdrantClient.delete(COLLECTION_NAME, {
        points: batch,
        wait: true
      });
    }

    return allPointIds.length;
  } catch (error) {
    console.error("Delete all vectors error:", error.message);
    throw error;
  }
};
