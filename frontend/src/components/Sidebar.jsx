
import React from "react";

import {
  BrainCircuit,
  FileText,
  Trash2,
  Plus,
  MessageSquare,
  Database,
  X
} from "lucide-react";

function Sidebar({
  documents = [],
  onDelete,
  onNewChat,
  isOpen = false,
  onClose
}) {
  return (
    <aside className={`sidebar ${isOpen ? "sidebar-open" : ""}`}>

      <div className="sidebar-header">
        <div className="brand-icon">
          <BrainCircuit size={25} />
        </div>

        <div className="brand-text">
          <h2>Knowledge AI</h2>
          <span>Enterprise Assistant</span>
        </div>

        <button
          className="sidebar-close-btn"
          onClick={onClose}
          aria-label="Close navigation"
        >
          <X size={19} />
        </button>
      </div>

      <button
        className="new-chat-btn"
        onClick={onNewChat}
      >
        <Plus size={18} />
        <span>New conversation</span>
      </button>

      <div className="sidebar-section">

        <div className="sidebar-section-heading">
          <span>YOUR KNOWLEDGE BASE</span>
          <span className="document-count">
            {documents.length}
          </span>
        </div>

        {documents.length === 0 ? (
          <div className="empty-documents">
            <Database size={22} />
            <p>No documents yet</p>
            <small>Upload a PDF to get started.</small>
          </div>
        ) : (
          <div className="document-list">
            {documents.map((doc) => (
              <div
                className="document-item"
                key={doc.documentId}
              >
                <div className="document-icon">
                  <FileText size={18} />
                </div>

                <div className="document-info">
                  <span title={doc.fileName}>
                    {doc.fileName}
                  </span>

                  <small>
                    {doc.totalPages || 0} pages
                    {doc.totalChunks
                      ? ` · ${doc.totalChunks} chunks`
                      : ""}
                  </small>
                </div>

                <button
                  className="delete-btn"
                  title="Delete document"
                  aria-label={`Delete ${doc.fileName}`}
                  onClick={() => onDelete(doc.documentId)}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="sidebar-bottom">

        <div className="sidebar-info-card">
          <div className="sidebar-info-icon">
            <Database size={17} />
          </div>

          <div>
            <strong>Local knowledge base</strong>
            <small>Your documents stay on your system.</small>
          </div>
        </div>

        <div className="sidebar-footer">
          <MessageSquare size={16} />
          <span>Knowledge AI Workspace</span>
        </div>

      </div>
    </aside>
  );
}

export default Sidebar;
