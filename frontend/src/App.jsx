
import React, { useEffect, useState } from "react";

import {
  Sparkles,
  ShieldCheck,
  Menu
} from "lucide-react";

import Sidebar from "./components/Sidebar";
import DocumentUpload from "./components/DocumentUpload";
import ChatWindow from "./components/ChatWindow";

import {
  getDocuments,
  askQuestion,
  deleteDocument
} from "./services/api";

import "./App.css";

function App() {
  const [documents, setDocuments] = useState([]);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Load documents from Qdrant when the app starts
  useEffect(() => {
    const loadDocuments = async () => {
      try {
        const result = await getDocuments();

        if (result.success) {
          setDocuments(result.documents || []);
        }
      } catch (err) {
        console.error("Unable to load documents:", err);

        setError(
          err.response?.data?.message ||
          "Unable to load uploaded documents."
        );
      }
    };

    loadDocuments();
  }, []);

  // Handle successful PDF upload
  const handleUploadSuccess = (result) => {
    const uploadedDocument = result.document;

    const document = {
      documentId: uploadedDocument.documentId,
      fileName: uploadedDocument.fileName,
      totalPages: uploadedDocument.totalPages,
      totalChunks: uploadedDocument.totalChunks
    };

    setDocuments((previous) => [
      ...previous.filter(
        (item) => item.documentId !== document.documentId
      ),
      document
    ]);

    setError("");
  };

  // Delete an uploaded document
  const handleDeleteDocument = async (documentId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this document?"
    );

    if (!confirmed) return;

    try {
      await deleteDocument(documentId);

      setDocuments((previous) =>
        previous.filter(
          (doc) => doc.documentId !== documentId
        )
      );

      setError("");
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to delete document."
      );
    }
  };

  // Send question to RAG backend
  const handleSendQuestion = async (question) => {
    const userMessage = {
      id: Date.now(),
      role: "user",
      content: question
    };

    setMessages((previous) => [
      ...previous,
      userMessage
    ]);

    setIsLoading(true);
    setError("");

    try {
      const result = await askQuestion(question);

      if (!result.success) {
        throw new Error(
          result.message || "Unable to generate answer"
        );
      }

      const assistantMessage = {
        id: Date.now() + 1,
        role: "assistant",
        content: result.answer,
        sources: result.sources || []
      };

      setMessages((previous) => [
        ...previous,
        assistantMessage
      ]);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.message ||
        "Something went wrong. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Start a new conversation
  const handleNewChat = () => {
    setMessages([]);
    setError("");
    setSidebarOpen(false);
  };

  return (
    <div className="app-container">

      <div
        className={`sidebar-overlay ${sidebarOpen ? "show" : ""}`}
        onClick={() => setSidebarOpen(false)}
      />

      <Sidebar
        documents={documents}
        onDelete={handleDeleteDocument}
        onNewChat={handleNewChat}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="main-content">

        <header className="topbar">
          <div className="topbar-left">

            <button
              className="mobile-menu-btn"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open navigation"
            >
              <Menu size={20} />
            </button>

            <div className="breadcrumb">
              <span>Workspace</span>
              <span className="breadcrumb-separator">/</span>
              <strong>Knowledge Assistant</strong>
            </div>

          </div>

          <div className="topbar-right">

            <div className="topbar-status">
              <span className="status-dot" />
              All systems operational
            </div>

            <div className="topbar-avatar" title="Local user">
              U
            </div>

          </div>
        </header>

        <div className="workspace-content">

          <section className="page-heading">

            <div>
              <div className="eyebrow">
                <Sparkles size={14} />
                AI POWERED KNOWLEDGE
              </div>

              <h1>Your knowledge workspace</h1>

              <p>
                Upload documents and get accurate answers
                grounded in your knowledge base.
              </p>
            </div>

            <div className="privacy-indicator">
              <ShieldCheck size={17} />
              <span>Private & locally processed</span>
            </div>

          </section>

          <section className="upload-section">
            <DocumentUpload
              onUploadSuccess={handleUploadSuccess}
            />
          </section>

          {error && (
            <div className="app-error">
              {error}
            </div>
          )}

          <section className="chat-section">
            <ChatWindow
              messages={messages}
              onSend={handleSendQuestion}
              isLoading={isLoading}
            />
          </section>

          <footer className="workspace-footer">
            <span>Knowledge AI</span>
            <span>
              AI-generated responses should be verified
              against source documents.
            </span>
          </footer>

        </div>
      </main>
    </div>
  );
}

export default App;
