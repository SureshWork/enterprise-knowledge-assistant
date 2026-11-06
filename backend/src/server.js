import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import { initializeQdrant } from "./config/qdrant.js";
import documentRoutes from "./routes/documentRoutes.js";
import { errorHandler } from "./middleware/errorHandler.js";
import chatRoutes from "./routes/chatRoutes.js";

dotenv.config();

const app = express();

app.use(cors());

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "Enterprise Knowledge Assistant API is running"
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    status: "OK",
    service: "Enterprise Knowledge Assistant",
    timestamp: new Date().toISOString()
  });
});

// Document APIs
app.use("/api/documents", documentRoutes);

// Chat APIs
app.use("/api/chat", chatRoutes);

// Global error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await initializeQdrant();

    app.listen(PORT, () => {
      console.log("--------------------------------");
      console.log("Enterprise Knowledge Assistant");
      console.log("--------------------------------");
      console.log(`Backend running on port ${PORT}`);
      console.log("Qdrant connected");
    });

  } catch (error) {
    console.error("Server startup failed:", error);
    process.exit(1);
  }
};

startServer();