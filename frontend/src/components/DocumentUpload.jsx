
import React, { useRef, useState } from "react";
import { FileUp, FileText, CheckCircle, AlertCircle } from "lucide-react";
import { uploadDocument } from "../services/api";

function DocumentUpload({ onUploadSuccess }) {
  const fileInputRef = useRef(null);

  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleFile = async (file) => {
    if (!file) return;

    setError("");
    setMessage("");

    if (
      file.type !== "application/pdf" &&
      !file.name.toLowerCase().endsWith(".pdf")
    ) {
      setError("Please select a PDF file.");
      return;
    }

    try {
      setUploading(true);
      setProgress(0);

      const result = await uploadDocument(
        file,
        (event) => {
          if (event.total) {
            setProgress(
              Math.round((event.loaded * 100) / event.total)
            );
          }
        }
      );

      if (!result.success) {
        throw new Error(result.message || "Upload failed");
      }

      setMessage("Document uploaded successfully!");

      onUploadSuccess?.(result);

    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.message ||
        "Unable to upload document."
      );
    } finally {
      setUploading(false);
      setProgress(0);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="upload-card">

      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,application/pdf"
        hidden
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      <div className="upload-icon">
        <FileUp size={30} />
      </div>

      <h3>Upload your documents</h3>

      <p>
        Upload PDF documents to build your knowledge base.
      </p>

      <button
        className="upload-btn"
        disabled={uploading}
        onClick={() => fileInputRef.current?.click()}
      >
        <FileText size={18} />
        {uploading ? "Uploading..." : "Choose PDF"}
      </button>

      {uploading && (
        <div className="progress-container">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
          <small>{progress}%</small>
          <p>Processing document. Please wait...</p>
        </div>
      )}

      {message && (
        <div className="success-message">
          <CheckCircle size={17} />
          {message}
        </div>
      )}

      {error && (
        <div className="error-message">
          <AlertCircle size={17} />
          {error}
        </div>
      )}

    </div>
  );
}

export default DocumentUpload;
