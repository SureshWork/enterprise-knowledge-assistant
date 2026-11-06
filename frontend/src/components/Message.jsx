
import React from "react";
import {
  User,
  Bot,
  FileText,
  ExternalLink
} from "lucide-react";

function Message({ message }) {
  const isUser = message.role === "user";

  return (
    <div className={`message-row ${isUser ? "user-row" : "assistant-row"}`}>

      <div className={`message-avatar ${isUser ? "user-avatar" : "ai-avatar"}`}>
        {isUser ? <User size={18} /> : <Bot size={20} />}
      </div>

      <div className="message-content">

        <div className="message-sender">
          {isUser ? "You" : "AI Assistant"}
        </div>

        <div className="message-text">
          {message.content}
        </div>

        {!isUser && message.sources?.length > 0 && (
          <div className="sources-container">

            <div className="sources-heading">
              <FileText size={16} />
              <strong>Sources</strong>
            </div>

            {message.sources.map((source, index) => (
              <div
                className="source-item"
                key={`${source.documentId}-${source.chunkIndex}-${index}`}
              >
                <div className="source-details">
                  <FileText size={17} />

                  <div>
                    <strong>{source.fileName}</strong>
                    <small>
                      Page {source.pageNumber} · Chunk {source.chunkIndex}
                    </small>
                  </div>
                </div>

                <span className="source-score">
                  {(source.score * 100).toFixed(1)}%
                </span>
              </div>
            ))}

          </div>
        )}

      </div>
    </div>
  );
}

export default Message;
