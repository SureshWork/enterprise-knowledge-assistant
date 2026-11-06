import { processQuestion } from "../services/ragService.js";

export const chat = async (req, res, next) => {
  try {

    const { question } = req.body;

    if (!question || typeof question !== "string" || !question.trim()) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid question"
      });
    }

    if (question.length > 2000) {
      return res.status(400).json({
        success: false,
        message: "Question cannot exceed 2000 characters"
      });
    }

    console.log("User question:", question);

    const result = await processQuestion(question.trim());

    res.json({
      success: true,
      question: question.trim(),
      answer: result.answer,
      sources: result.sources
    });

  } catch (error) {
    next(error);
  }
};