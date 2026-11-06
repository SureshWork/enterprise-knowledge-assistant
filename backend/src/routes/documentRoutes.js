
import express from "express";
import multer from "multer";

import {
  uploadDocument,
  getDocuments,
  deleteDocument,
  deleteAllDocuments
} from "../controllers/documentController.js";

const router = express.Router();

// Multer memory storage
const storage = multer.memoryStorage();

// PDF upload configuration
const upload = multer({
  storage,

  limits: {
    fileSize: 20 * 1024 * 1024 // 20 MB
  },

  fileFilter: (req, file, callback) => {
    const isPdf =
      file.mimetype === "application/pdf" &&
      file.originalname.toLowerCase().endsWith(".pdf");

    if (!isPdf) {
      return callback(
        new Error("Only PDF files are allowed")
      );
    }

    callback(null, true);
  }
});

// Upload PDF
router.post(
  "/upload",
  upload.single("file"),
  uploadDocument
);

// Get all uploaded documents
router.get("/", getDocuments);

// Delete all uploaded document vectors
router.delete("/all", deleteAllDocuments);

// Delete PDF and its vectors from Qdrant
router.delete(
  "/:documentId",
  deleteDocument
);

export default router;
