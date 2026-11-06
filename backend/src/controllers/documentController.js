import { v4 as uuidv4 } from "uuid";

import { extractPdfText } from "../services/pdfService.js";
import { createChunks } from "../services/chunkService.js";
import { generateEmbeddings } from "../services/embeddingService.js";
import { storeVectors, deleteDocumentVectors, deleteAllDocumentVectors, listDocuments } from "../services/vectorService.js";

export const uploadDocument = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload a PDF document"
      });
    }

    const documentId = uuidv4();
    const fileName = req.file.originalname;

    console.log("Processing document:", fileName);

    // 1. Extract PDF text
    const extracted = await extractPdfText(req.file.buffer);

    console.log("Pages extracted:", extracted.totalPages);

    // 2. Create chunks
    const chunks = createChunks(
      extracted.pages,
      documentId,
      fileName
    );

    if (chunks.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No usable text found in document"
      });
    }

    console.log("Chunks created:", chunks.length);

    // 3. Generate embeddings in batches
    const BATCH_SIZE = 16;
    const allEmbeddings = [];

    for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
      const batch = chunks.slice(i, i + BATCH_SIZE);

      const embeddings = await generateEmbeddings(
        batch.map(chunk => chunk.text)
      );

      allEmbeddings.push(...embeddings);

      console.log(
        `Embeddings generated: ${allEmbeddings.length}/${chunks.length}`
      );
    }

    // 4. Store vectors in Qdrant
    const storedCount = await storeVectors(
      chunks,
      allEmbeddings
    );

    // 5. Return success
    res.status(201).json({
      success: true,
      message: "Document uploaded and processed successfully",

      document: {
        documentId,
        fileName,
        totalPages: extracted.totalPages,
        totalChunks: chunks.length,
        totalEmbeddings: allEmbeddings.length,
        storedVectors: storedCount
      }
    });

  } catch (error) {
    next(error);
  }
};

export const deleteDocument = async (req, res, next) => {
  try {
    const { documentId } = req.params;

    if (!documentId) {
      return res.status(400).json({
        success: false,
        message: "Document ID is required"
      });
    }

    await deleteDocumentVectors(documentId);

    res.json({
      success: true,
      message: "Document deleted successfully",
      documentId
    });

  } catch (error) {
    next(error);
  }
};

export const deleteAllDocuments = async (req, res, next) => {
  try {
    const deletedCount = await deleteAllDocumentVectors();

    res.json({
      success: true,
      message: "All document vectors deleted successfully",
      deletedVectors: deletedCount
    });

  } catch (error) {
    next(error);
  }
};

export const getDocuments = async (req, res, next) => {
  try {
    const documents = await listDocuments();

    res.json({
      success: true,
      totalDocuments: documents.length,
      documents
    });
  } catch (error) {
    next(error);
  }
};