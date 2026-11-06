
import React, { useState, useRef, useEffect } from "react";

import {
  Send,
  Sparkles,
  MessageSquare,
  LoaderCircle
} from "lucide-react";

import Message from "./Message";

function ChatWindow({
  messages = [],
  onSend,
  isLoading = false
}) {
  const [question, setQuestion] = useState("");
  const messagesContainerRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Scroll only when a conversation exists.
  // Do not scroll the empty welcome screen.
  useEffect(() => {
    if (messages.length === 0) return;

    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end"
    });
  }, [messages, isLoading]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const trimmedQuestion = question.trim();

    if (!trimmedQuestion || isLoading) return;

    onSend(trimmedQuestion);
    setQuestion("");
  };

  return (
    <div className="chat-window">

      <header className="chat-header">
        <div>
          <h2>Enterprise Knowledge Assistant</h2>
          <p>Ask questions about your uploaded documents</p>
        </div>

        <div className="ai-status">
          <span className="status-dot" />
          AI Ready
        </div>
      </header>

      <div
        className="chat-messages"
        ref={messagesContainerRef}
      >

        {messages.length === 0 ? (
          <div className="welcome-screen">

            <div className="welcome-icon">
              <Sparkles size={34} />
            </div>

            <h2>How can I help you today?</h2>

            <p>
              Ask questions about your documents.
              I'll find relevant information and provide source references.
            </p>

            <div className="suggestion-card">
              <MessageSquare size={18} />
              <span>
                What are the key policies in my documents?
              </span>
            </div>

          </div>
        ) : (
          messages.map((message) => (
            <Message
              key={message.id}
              message={message}
            />
          ))
        )}

        {isLoading && (
          <div className="typing-indicator">
            <LoaderCircle
              size={19}
              className="loading-spinner"
            />
            AI is analyzing your documents...
          </div>
        )}

        <div ref={messagesEndRef} />

      </div>

      <form
        className="chat-input-container"
        onSubmit={handleSubmit}
      >

        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask a question about your documents..."
          rows={1}
          maxLength={2000}
          disabled={isLoading}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
        />

        <button
          type="submit"
          className="send-btn"
          disabled={!question.trim() || isLoading}
          title="Send message"
        >
          <Send size={19} />
        </button>

      </form>

      <div className="chat-disclaimer">
        AI-generated responses may contain errors.
        Verify important information against the cited sources.
      </div>

    </div>
  );
}

export default ChatWindow;
