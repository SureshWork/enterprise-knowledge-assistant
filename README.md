# Enterprise Knowledge Assistant — RAG Application

A locally running, full-stack conversational AI application that allows users to upload PDF documents and ask questions about their contents. The assistant retrieves relevant document passages and uses a local large language model to generate answers grounded in the uploaded information.

## 1. Project Overview

The Enterprise Knowledge Assistant demonstrates a Retrieval-Augmented Generation (RAG) workflow.

Users can:

- Upload PDF documents to build a searchable knowledge base.
- Extract text from uploaded PDFs.
- Split extracted content into smaller overlapping chunks.
- Generate vector embeddings locally.
- Store document chunks and embeddings in Qdrant.
- Ask natural-language questions about uploaded documents.
- Retrieve relevant passages and generate answers using a local LLM.
- View source references, including document name, page number, and retrieval score.
- Delete uploaded documents and their associated vectors.

**Design principle:** Keep document processing and AI inference local, without requiring a paid cloud LLM API.

## 2. Technology Stack

| Layer             | Technology              |
| ----------------- | ----------------------- |
| Frontend          | React, Vite, JavaScript |
| UI icons          | Lucide React            |
| Backend           | Node.js, Express        |
| PDF processing    | pdf-parse               |
| Embeddings        | Ollama — embeddinggemma |
| Chat model        | Ollama — llama3.2:1b    |
| Vector database   | Qdrant                  |
| Containerization  | Docker                  |
| API communication | Axios                   |

## 3. Architecture

```text
                 USER
                  |
                  v
          REACT FRONTEND
             (Vite)
                  |
          REST API / Axios
                  |
                  v
          NODE.JS / EXPRESS
                  |
        +---------+----------+
        |                    |
        v                    v
  DOCUMENT APIs          CHAT API
        |                    |
        v                    v
   PDF EXTRACTION       RAG SERVICE
        |                    |
        v                    v
   TEXT CHUNKING       QUESTION EMBEDDING
        |                    |
        v                    v
   OLLAMA EMBEDDING     QDRANT SEARCH
        |                    |
        v                    v
   QDRANT STORAGE      RETRIEVED CONTEXT
                             |
                             v
                       PROMPT BUILDING
                             |
                             v
                       OLLAMA LLM
                             |
                             v
                      GENERATED ANSWER
                             |
                             v
                       REACT FRONTEND
                    ANSWER + SOURCES
```

### Main components

**Frontend**

- Provides the document upload interface.
- Displays uploaded documents in the knowledge-base sidebar.
- Provides a conversational question-and-answer interface.
- Displays AI responses and source references.
- Supports starting a new conversation and deleting documents.

**Backend**

- Exposes REST APIs for document management and chat.
- Validates uploaded PDF files.
- Coordinates PDF extraction, chunking, embeddings, vector storage, retrieval, and answer generation.
- Handles API errors and returns structured responses.

**Ollama**

- Generates document and question embeddings using `embeddinggemma`.
- Generates answers using `llama3.2:1b`.
- Runs locally on the development machine.

**Qdrant**

- Stores document embeddings and their associated metadata.
- Performs similarity searches to retrieve relevant document chunks.
- Uses cosine similarity with a 768-dimensional vector configuration.

## 4. RAG Workflow

### Document ingestion

When a user uploads a PDF:

1. The backend receives the PDF through the document upload API.
2. PDF text is extracted, retaining page information.
3. Extracted text is divided into chunks.
4. Each chunk retains metadata such as document ID, filename, page number, and chunk index.
5. The embedding model generates a vector for each chunk.
6. Vectors and their metadata are stored in the Qdrant collection.

### Chunking strategy

The current configuration uses:

| Parameter         |            Value |
| ----------------- | ---------------: |
| Chunk size        | 1,000 characters |
| Chunk overlap     |   200 characters |
| Embedding model   |   embeddinggemma |
| Vector dimensions |              768 |
| Distance metric   |           Cosine |

Chunk overlap helps preserve context when information spans adjacent chunks.

### Question answering

When a user submits a question:

1. The backend validates the question.
2. Ollama generates an embedding for the question.
3. Qdrant searches for the most relevant document chunks.
4. The retrieved chunks are assembled into the prompt context.
5. The prompt instructs the LLM to answer using the supplied document context.
6. Ollama generates the answer.
7. The backend returns the answer and source metadata to the frontend.

The application uses a configurable retrieval limit (`TOP_K`) to control how many chunks are retrieved.

### Grounded answers

The prompt is designed to:

- Answer using the retrieved document context.
- Avoid inventing unsupported information.
- Indicate when the answer cannot be found in the available context.
- Treat document content as untrusted input.
- Include source references where appropriate.

## 5. Project Structure

```text
enterprise-knowledge-assistant/
|
+-- backend/
|   +-- src/
|   |   +-- config/
|   |   |   +-- ollama.js
|   |   |   +-- qdrant.js
|   |   |
|   |   +-- controllers/
|   |   |   +-- documentController.js
|   |   |   +-- chatController.js
|   |   |
|   |   +-- services/
|   |   |   +-- pdfService.js
|   |   |   +-- chunkService.js
|   |   |   +-- embeddingService.js
|   |   |   +-- vectorService.js
|   |   |   +-- ragService.js
|   |   |   +-- promptService.js
|   |   |
|   |   +-- routes/
|   |   |   +-- documentRoutes.js
|   |   |   +-- chatRoutes.js
|   |   |
|   |   +-- middleware/
|   |   |   +-- errorHandler.js
|   |   |
|   |   +-- server.js
|   |
|   +-- uploads/
|   +-- .env.example
|   +-- package.json
|
+-- frontend/
|   +-- src/
|       +-- components/
|       +-- services/
|       +-- App.jsx
|       +-- App.css
|       +-- main.jsx
|
+-- screenshots/
|
+-- README.md
+-- .gitignore
```

## 6. Prerequisites

Install the following before running the application:

- Node.js and npm
- Docker Desktop
- Ollama
- Git

The application uses local Ollama models and a locally running Qdrant instance.

## 7. Local Setup

### Step 1 — Clone the repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd enterprise-knowledge-assistant
```

### Step 2 — Start Qdrant

Run:

```bash
docker run -d \
  --name qdrant \
  -p 6333:6333 \
  -p 6334:6334 \
  -v qdrant_storage:/qdrant/storage \
  qdrant/qdrant
```

Qdrant dashboard:

```text
http://localhost:6333/dashboard
```

The Docker volume preserves Qdrant data across container restarts.

### Step 3 — Start Ollama

Install Ollama and pull the required models:

```bash
ollama pull embeddinggemma
ollama pull llama3.2:1b
```

Ollama normally exposes its local API at:

```text
http://localhost:11434
```

### Step 4 — Configure the backend

Navigate to the backend directory:

```bash
cd backend
npm install
```

Create a `.env` file using `.env.example` as the reference.

Configure the required environment variables before starting the backend.

Start the development server:

```bash
npm run dev
```

Backend API:

```text
http://localhost:5000
```

Health endpoint:

```text
http://localhost:5000/api/health
```

### Step 5 — Start the frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the Vite URL shown in the terminal, normally:

```text
http://localhost:5173
```

## 8. API Endpoints

| Method | Endpoint                     | Purpose                                 |
| ------ | ---------------------------- | --------------------------------------- |
| GET    | `/api/health`                | Check backend health                    |
| POST   | `/api/documents/upload`      | Upload and process a PDF                |
| GET    | `/api/documents`             | Retrieve uploaded document details      |
| DELETE | `/api/documents/:documentId` | Delete a document and its vectors       |
| DELETE | `/api/documents/all`         | Delete all uploaded document vectors    |
| POST   | `/api/chat`                  | Ask a question about uploaded documents |

The document-management endpoints operate on the document records and vector data supported by the current implementation.

## 9. Configuration

The main backend environment variables are:

| Variable            | Description                |
| ------------------- | -------------------------- |
| `PORT`              | Backend server port        |
| `OLLAMA_URL`        | Local Ollama API URL       |
| `LLM_MODEL`         | Chat model                 |
| `EMBEDDING_MODEL`   | Embedding model            |
| `QDRANT_URL`        | Qdrant API URL             |
| `QDRANT_COLLECTION` | Qdrant collection name     |
| `CHUNK_SIZE`        | Chunk size in characters   |
| `CHUNK_OVERLAP`     | Overlap between chunks     |
| `TOP_K`             | Number of chunks retrieved |

Never commit actual environment files or credentials to GitHub.

## 10. Engineering Decisions

### Why local LLM inference?

Ollama allows the application to run without a paid external LLM API. It also makes the application easier to demonstrate in an environment where internet access or API credentials are limited.

### Why Qdrant?

Qdrant provides vector storage and similarity search, making it suitable for retrieving relevant document chunks based on semantic similarity.

### Why overlapping chunks?

A fixed chunk boundary can separate related sentences or paragraphs. Overlap helps retain context across adjacent chunks.

### Why retain page metadata?

Page-level metadata makes it possible to identify where retrieved information originated and display useful source references to users.

### Why separate services?

PDF extraction, chunking, embeddings, vector storage, prompt construction, and RAG orchestration are separated into services to improve maintainability and make individual components easier to test.

## 11. Current Limitations

The current implementation is a functional local prototype, not a fully production-ready enterprise system.

Known limitations and areas for improvement include:

- PDF text extraction does not guarantee accurate extraction from scanned or image-only PDFs.
- Chunking currently uses a fixed character-based strategy.
- Retrieval primarily uses vector similarity and can miss relevant information.
- Retrieval quality depends on the embedding model, chunking strategy, and document quality.
- A small local language model may produce incomplete or inaccurate answers.
- The application does not yet provide comprehensive automated evaluation of RAG answer quality.
- Authentication, authorization, and multi-user access controls are not implemented.
- Production-grade monitoring, tracing, and usage analytics are not implemented.
- Large-scale document processing and concurrent workloads require further optimization.

Users should verify important answers against the cited source documents.

## 12. Production Improvements

If this application were extended for enterprise production use, I would prioritize:

1. **Improved document ingestion:** Add support for scanned PDFs using OCR, tables, and additional document formats.
2. **Advanced chunking:** Introduce semantic or structure-aware chunking and tune chunk sizes based on evaluation results.
3. **Hybrid retrieval:** Combine vector similarity with keyword search to improve retrieval coverage.
4. **Reranking:** Add a reranking model to improve the relevance of retrieved passages.
5. **RAG evaluation:** Build a representative question-and-answer dataset and measure retrieval precision, recall, and answer faithfulness.
6. **Security:** Implement authentication, authorization, document-level access control, and secure file handling.
7. **Scalability:** Add background document-processing jobs, queues, batching, and resource-aware model execution.
8. **Observability:** Track ingestion failures, retrieval quality, model latency, token usage where applicable, and application errors.
9. **Reliability:** Add retries, timeouts, health checks, and graceful handling of model or vector database outages.
10. **Testing and CI/CD:** Add automated unit, integration, and end-to-end tests, followed by a deployment pipeline.

## 13. Testing Checklist

Before submitting, verify:

- [ ] Backend starts successfully.
- [ ] Frontend starts successfully.
- [ ] Qdrant is reachable.
- [ ] Ollama models are available.
- [ ] A valid PDF can be uploaded.
- [ ] Document chunks and vectors are created.
- [ ] A question receives an answer based on the uploaded PDF.
- [ ] Source references show the correct document and page.
- [ ] An unrelated question does not result in unsupported claims.
- [ ] A document can be deleted from the UI.
- [ ] Deleted documents disappear from the sidebar.
- [ ] A new PDF can be uploaded after deletion.

## 14. Screenshots and Demo

The `screenshots/` directory will contain screenshots demonstrating:

- Initial application workspace.
- Successful PDF upload.
- A question and its generated answer.
- Source references returned with the answer.
- Document deletion and updated knowledge base.

A Loom demonstration video will walk through the application, its architecture, the RAG workflow, and the key engineering decisions.

## 15. AI-Assisted Development

AI-assisted development tools were used as part of the implementation process for technical exploration, debugging, code suggestions, and documentation.

The implementation was tested locally, and the developer reviewed and integrated the generated suggestions.

The goal was to use AI assistance to accelerate development while retaining responsibility for architecture, implementation decisions, debugging, and validation.

## 16. Conclusion

This project demonstrates an end-to-end local RAG application that connects a React user interface, Node.js backend, Ollama models, and Qdrant vector database.

It provides a foundation for an enterprise knowledge assistant and identifies the engineering improvements required to evolve the prototype into a secure, scalable, and observable production application.
