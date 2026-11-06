
import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json"
  }
});

// Get all uploaded documents
export const getDocuments = async () => {
  const response = await api.get("/documents");
  return response.data;
};

// Upload PDF
export const uploadDocument = async (file, onUploadProgress) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post(
    "/documents/upload",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data"
      },
      onUploadProgress
    }
  );

  return response.data;
};

// Ask a question
export const askQuestion = async (question) => {
  const response = await api.post("/chat", {
    question
  });

  return response.data;
};

// Delete document
export const deleteDocument = async (documentId) => {
  const response = await api.delete(
    `/documents/${documentId}`
  );

  return response.data;
};

export default api;
